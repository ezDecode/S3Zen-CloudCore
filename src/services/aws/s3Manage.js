/**
 * S3 Management Operations
 * Handles delete, rename, move, and folder operations
 */

import {
    PutObjectCommand,
    DeleteObjectsCommand,
    ListObjectsV2Command,
    CopyObjectCommand
} from '@aws-sdk/client-s3';
import { getS3Client, getCurrentBucket } from './s3Client.js';
import {
    sanitizeFileName,
    sanitizeS3Path,
    validateKey,
    isValidFolderName,
    preserveFileExtension
} from '../../utils/validationUtils.js';

/**
 * Delete multiple objects
 */
export const deleteObjects = async (keys) => {
    const s3Client = getS3Client();
    const bucket = getCurrentBucket();

    if (!s3Client || !bucket) {
        return { success: false, error: 'S3 client not initialized' };
    }

    try {
        const sanitizedKeys = keys.map(key => {
            const sanitized = sanitizeS3Path(key);
            if (!sanitized || validateKey(sanitized)) {
                throw new Error(`Invalid path: ${key}`);
            }
            return sanitized;
        });

        const { rateLimitOperation } = await import('../../utils/rateLimiter.js');

        const response = await rateLimitOperation('delete', async () => {
            const command = new DeleteObjectsCommand({
                Bucket: bucket,
                Delete: {
                    Objects: sanitizedKeys.map(key => ({ Key: key })),
                    Quiet: false
                }
            });
            return await s3Client.send(command);
        });

        const deleted = (response.Deleted || []).map(e => e.Key).filter(Boolean);
        const failed = (response.Errors || []).map(e => ({
            key: e.Key, code: e.Code, message: e.Message
        })).filter(f => f.key || f.message);

        return { success: failed.length === 0, deleted, failed };
    } catch (error) {
        console.error('Failed to delete objects:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Delete multiple items (files and folders) recursively
 */
export const deleteItems = async (items) => {
    const s3Client = getS3Client();
    const bucket = getCurrentBucket();

    if (!s3Client || !bucket) {
        return { success: false, error: 'S3 client not initialized' };
    }

    try {
        const allKeysToDelete = new Set();

        await Promise.all(items.map(async (item) => {
            if (item.type === 'folder') {
                let continuationToken = null;
                do {
                    const command = new ListObjectsV2Command({
                        Bucket: bucket,
                        Prefix: item.key,
                        MaxKeys: 1000,
                        ...(continuationToken && { ContinuationToken: continuationToken })
                    });
                    const response = await s3Client.send(command);
                    if (response.Contents) {
                        response.Contents.forEach(obj => allKeysToDelete.add(obj.Key));
                    }
                    continuationToken = response.NextContinuationToken;
                } while (continuationToken);
                allKeysToDelete.add(item.key);
            } else {
                allKeysToDelete.add(item.key);
            }
        }));

        if (allKeysToDelete.size === 0) return { success: true };

        const BATCH_SIZE = 1000;
        const keysArray = Array.from(allKeysToDelete);
        const results = await Promise.allSettled(
            Array.from({ length: Math.ceil(keysArray.length / BATCH_SIZE) }, (_, i) =>
                deleteObjects(keysArray.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE))
            )
        );

        const deleted = [];
        const failed = [];

        results.forEach(result => {
            if (result.status === 'fulfilled') {
                if (result.value.deleted) deleted.push(...result.value.deleted);
                if (result.value.failed) failed.push(...result.value.failed);
            } else {
                failed.push({ key: 'batch', message: result.reason?.message });
            }
        });

        return { success: failed.length === 0, deleted, failed };
    } catch (error) {
        console.error('Failed to delete items:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Create a folder
 */
export const createFolder = async (folderKey) => {
    const s3Client = getS3Client();
    const bucket = getCurrentBucket();

    if (!s3Client || !bucket) {
        return { success: false, error: 'S3 client not initialized' };
    }

    try {
        const folderName = folderKey.split('/').filter(Boolean).pop();
        if (!isValidFolderName(folderName)) {
            return { success: false, error: 'Invalid folder name' };
        }

        let sanitizedKey = sanitizeS3Path(folderKey);
        if (!sanitizedKey || validateKey(sanitizedKey)) {
            return { success: false, error: 'Invalid folder path' };
        }

        const key = sanitizedKey.endsWith('/') ? sanitizedKey : `${sanitizedKey}/`;

        await s3Client.send(new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: ''
        }));

        return { success: true };
    } catch (error) {
        console.error('Failed to create folder:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Rename a file or folder (copy + delete)
 */
export const renameObject = async (oldKey, newName, isFolder = false) => {
    const s3Client = getS3Client();
    const bucket = getCurrentBucket();

    if (!s3Client || !bucket) {
        return { success: false, error: 'S3 client not initialized' };
    }

    try {
        const sanitizedNewName = sanitizeFileName(newName);
        if (!sanitizedNewName || sanitizedNewName !== newName) {
            return { success: false, error: 'Invalid name - contains dangerous characters' };
        }

        if (isFolder && !isValidFolderName(sanitizedNewName)) {
            return { success: false, error: 'Invalid folder name' };
        }

        const pathParts = oldKey.split('/');
        const oldFileName = pathParts[pathParts.length - (isFolder ? 2 : 1)];

        let finalNewName = sanitizedNewName;
        if (!isFolder) {
            finalNewName = preserveFileExtension(sanitizedNewName, oldFileName);
        }

        pathParts[pathParts.length - (isFolder ? 2 : 1)] = finalNewName;
        const newKey = pathParts.join('/');

        if (oldKey === newKey) {
            return { success: true, newKey, message: 'Name unchanged' };
        }

        if (isFolder) {
            await renameFolderContents(s3Client, bucket, oldKey, newKey);
        } else {
            await s3Client.send(new CopyObjectCommand({
                Bucket: bucket,
                CopySource: `${bucket}/${oldKey}`,
                Key: newKey
            }));
            await deleteObjects([oldKey]);
        }

        return { success: true, newKey };
    } catch (error) {
        console.error('Failed to rename object:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Helper: Rename folder contents
 */
const renameFolderContents = async (s3Client, bucket, oldKey, newKey) => {
    const MAX_CONCURRENT = 50;
    let allObjects = [];
    let continuationToken = null;

    do {
        const response = await s3Client.send(new ListObjectsV2Command({
            Bucket: bucket,
            Prefix: oldKey,
            MaxKeys: 1000,
            ...(continuationToken && { ContinuationToken: continuationToken })
        }));

        if (response.Contents?.length) {
            allObjects.push(...response.Contents);

            const copyOps = response.Contents.map(obj => ({
                oldKey: obj.Key,
                newKey: obj.Key.replace(oldKey, newKey)
            }));

            for (let i = 0; i < copyOps.length; i += MAX_CONCURRENT) {
                await Promise.all(
                    copyOps.slice(i, i + MAX_CONCURRENT).map(({ oldKey: objKey, newKey: itemNewKey }) =>
                        s3Client.send(new CopyObjectCommand({
                            Bucket: bucket,
                            CopySource: encodeURIComponent(`${bucket}/${objKey}`),
                            Key: itemNewKey
                        }))
                    )
                );
            }
        }
        continuationToken = response.NextContinuationToken;
    } while (continuationToken);

    if (allObjects.length > 0) {
        const keysToDelete = allObjects.map(obj => obj.Key);
        for (let i = 0; i < keysToDelete.length; i += 1000) {
            await deleteObjects(keysToDelete.slice(i, i + 1000));
        }
    }
};

/**
 * Move/Copy file to a different folder
 */
export const moveFile = async (sourceKey, destinationFolder) => {
    const s3Client = getS3Client();
    const bucket = getCurrentBucket();

    if (!s3Client || !bucket) {
        return { success: false, error: 'S3 client not initialized' };
    }

    try {
        const fileName = sourceKey.split('/').pop();
        const newKey = destinationFolder + fileName;

        if (sourceKey === newKey) {
            return { success: true, newKey, message: 'File already in destination' };
        }

        await s3Client.send(new CopyObjectCommand({
            Bucket: bucket,
            CopySource: encodeURIComponent(`${bucket}/${sourceKey}`),
            Key: newKey
        }));

        await deleteObjects([sourceKey]);

        return { success: true, newKey };
    } catch (error) {
        console.error('Failed to move file:', error);
        return { success: false, error: error.message };
    }
};
