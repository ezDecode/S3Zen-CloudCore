/**
 * Secure S3 Service
 * Core AWS S3 operations with security hardening
 * 
 * SECURITY FEATURES:
 * - Input validation and sanitization
 * - Path traversal prevention
 * - Bucket ownership validation
 * - Least-privilege operations
 */

import {
    S3Client,
    ListObjectsV2Command,
    PutObjectCommand,
    DeleteObjectsCommand,
    HeadBucketCommand,
    GetObjectCommand,
    CopyObjectCommand,
    GetBucketLocationCommand
} from '@aws-sdk/client-s3';
import { STSClient, GetCallerIdentityCommand } from '@aws-sdk/client-sts';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
    sanitizeFileName,
    sanitizeS3Path,
    validateKey,
    isDangerousPath,
    isValidFolderName,
    isValidFileSize,
    preserveFileExtension
} from '../../utils/validationUtils.js';

let s3Client = null;
let stsClient = null;
let currentBucket = null;
let bucketOwnerVerified = false;
let currentRegion = null;

/**
 * Initialize S3 Client with credentials
 * SECURITY: Also initializes STS client for identity validation
 */
export const initializeS3Client = (credentials, region, bucketName) => {
    try {
        const awsConfig = {
            region,
            credentials: {
                accessKeyId: credentials.accessKeyId,
                secretAccessKey: credentials.secretAccessKey,
                ...(credentials.sessionToken && { sessionToken: credentials.sessionToken })
            }
        };

        s3Client = new S3Client(awsConfig);
        stsClient = new STSClient(awsConfig);

        currentBucket = bucketName;
        currentRegion = region;
        bucketOwnerVerified = false; // Reset on new connection

        return { success: true };
    } catch (error) {
        console.error('Failed to initialize S3 client:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Validate credentials and bucket ownership using STS
 * SECURITY: Verifies bucket access and gets caller identity
 */
export const validateCredentials = async () => {
    if (!s3Client || !stsClient || !currentBucket) {
        return { success: false, error: 'S3 client not initialized' };
    }

    try {
        // First, verify bucket access
        const headCommand = new HeadBucketCommand({
            Bucket: currentBucket
        });
        await s3Client.send(headCommand);

        // Second, get caller identity for security context
        const identityCommand = new GetCallerIdentityCommand({});
        const identity = await stsClient.send(identityCommand);

        console.log('✓ Bucket access verified for:', identity.UserId);
        bucketOwnerVerified = true;

        return {
            success: true,
            identity: {
                userId: identity.UserId,
                account: identity.Account,
                arn: identity.Arn
            }
        };
    } catch (error) {
        console.error('Credential validation failed:', error);
        bucketOwnerVerified = false;

        let errorMessage = 'Invalid credentials or bucket access denied';

        if (error.name === 'NotFound') {
            errorMessage = 'Bucket not found';
        } else if (error.name === 'Forbidden') {
            errorMessage = 'Access denied to bucket';
        } else if (error.name === 'NetworkingError') {
            errorMessage = 'Network error - check your connection';
        }

        return { success: false, error: errorMessage };
    }
};

/**
 * List objects in a folder (prefix)
 * SECURITY: Sanitizes prefix and validates against path traversal
 */
export const listObjects = async (prefix = '', continuationToken = null) => {
    if (!s3Client || !currentBucket) {
        return { success: false, error: 'S3 client not initialized' };
    }

    try {
        // SECURITY: Sanitize prefix to prevent path traversal
        const sanitizedPrefix = sanitizeS3Path(prefix);

        // SECURITY: Validate ONLY the sanitized prefix
        if (prefix && validateKey(sanitizedPrefix)) {
            return { success: false, error: 'Invalid path format' };
        }

        const command = new ListObjectsV2Command({
            Bucket: currentBucket,
            Prefix: sanitizedPrefix,
            Delimiter: '/',
            MaxKeys: 1000,
            ...(continuationToken && { ContinuationToken: continuationToken })
        });

        const response = await s3Client.send(command);

        // Parse folders (CommonPrefixes)
        const folders = (response.CommonPrefixes || []).map(item => ({
            key: item.Prefix,
            name: item.Prefix.slice(prefix.length).replace('/', ''),
            type: 'folder',
            size: 0,
            lastModified: null
        }));

        // Parse files (Contents)
        const files = (response.Contents || [])
            .filter(item => item.Key !== prefix) // Exclude the folder itself
            .map(item => ({
                key: item.Key,
                name: item.Key.slice(prefix.length),
                type: 'file',
                size: item.Size,
                lastModified: item.LastModified
            }));

        return {
            success: true,
            items: [...folders, ...files],
            isTruncated: response.IsTruncated,
            nextContinuationToken: response.NextContinuationToken
        };
    } catch (error) {
        console.error('Failed to list objects:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Upload a file to S3
 * SECURITY: Validates file size and sanitizes key
 */
export const uploadFile = async (file, key, onProgress) => {
    if (!s3Client || !currentBucket) {
        return { success: false, error: 'S3 client not initialized' };
    }

    try {
        // SECURITY: Validate file size (max 5GB by default)
        if (!isValidFileSize(file.size)) {
            return { success: false, error: 'File size exceeds maximum allowed (5GB)' };
        }

        // SECURITY PIPELINE: rawKey → normalizeKey → sanitizeKey → validateKey → upload
        // 1. Normalize: replace multiple slashes with one, preserve trailing slash
        const normalizedKey = key; // normalizeKey is done by frontend buildS3Key

        // 2. Sanitize: sanitize ONLY name segments, preserve trailing slash
        const sanitizedKey = sanitizeS3Path(normalizedKey);

        // 3. Validate: validate ONLY the sanitized key
        if (!sanitizedKey || validateKey(sanitizedKey)) {
            console.error('❌ Upload blocked - Invalid path:', { original: key, normalized: normalizedKey, sanitized: sanitizedKey });
            return { success: false, error: 'Invalid file path - contains dangerous patterns' };
        }

        const fileBuffer = await file.arrayBuffer();
        const command = new PutObjectCommand({
            Bucket: currentBucket,
            Key: sanitizedKey,
            Body: new Uint8Array(fileBuffer),
            ContentType: file.type
        });

        await s3Client.send(command);

        if (onProgress) {
            onProgress({ loaded: file.size, total: file.size, percentage: 100 });
        }

        return { success: true };
    } catch (error) {
        console.error('Failed to upload file:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Upload large file with multipart upload and progress tracking
 * SECURITY: Validates file size and sanitizes key
 */
export const uploadLargeFile = async (file, key, onProgress) => {
    if (!s3Client || !currentBucket) {
        return { success: false, error: 'S3 client not initialized' };
    }

    try {
        // SECURITY: Validate file size
        if (!isValidFileSize(file.size)) {
            return { success: false, error: 'File size exceeds maximum allowed (5GB)' };
        }

        // SECURITY PIPELINE: rawKey → normalizeKey → sanitizeKey → validateKey → upload
        // 1. Normalize: replace multiple slashes with one, preserve trailing slash
        const normalizedKey = key; // normalizeKey is done by frontend buildS3Key

        // 2. Sanitize: sanitize ONLY name segments, preserve trailing slash
        const sanitizedKey = sanitizeS3Path(normalizedKey);

        // 3. Validate: validate ONLY the sanitized key
        if (!sanitizedKey || validateKey(sanitizedKey)) {
            console.error('❌ Large file upload blocked - Invalid path:', { original: key, normalized: normalizedKey, sanitized: sanitizedKey });
            return { success: false, error: 'Invalid file path - contains dangerous patterns' };
        }

        const upload = new Upload({
            client: s3Client,
            params: {
                Bucket: currentBucket,
                Key: sanitizedKey,
                Body: file,
                ContentType: file.type
            },
            partSize: 10 * 1024 * 1024, // 10MB parts
            queueSize: 8 // 8 concurrent uploads
        });

        // Track progress
        upload.on('httpUploadProgress', (progress) => {
            if (onProgress) {
                const percentage = Math.round((progress.loaded / progress.total) * 100);
                onProgress({
                    loaded: progress.loaded,
                    total: progress.total,
                    percentage
                });
            }
        });

        await upload.done();
        return { success: true };
    } catch (error) {
        console.error('Failed to upload large file:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Download file via presigned URL with progress tracking
 */
export const downloadFile = async (itemOrKey, onProgress) => {
    if (!s3Client || !currentBucket) {
        return { success: false, error: 'S3 client not initialized' };
    }

    try {
        // Handle both object with key property and direct key string
        const key = typeof itemOrKey === 'string' ? itemOrKey : itemOrKey.key;
        const fileName = typeof itemOrKey === 'string'
            ? itemOrKey.split('/').pop()
            : itemOrKey.name || itemOrKey.key.split('/').pop();
        const fileSize = typeof itemOrKey === 'object' ? itemOrKey.size : null;

        // Get the object with progress tracking
        const command = new GetObjectCommand({
            Bucket: currentBucket,
            Key: key
        });

        // For small files, use presigned URL
        if (!onProgress || (fileSize && fileSize < 5 * 1024 * 1024)) {
            const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

            // Trigger download
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            if (onProgress) {
                onProgress({ loaded: fileSize, total: fileSize, percentage: 100 });
            }

            return { success: true };
        }

        // For large files with progress tracking
        const response = await s3Client.send(command);
        const blob = await streamToBlob(response.Body, fileSize, onProgress);

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        return { success: true };
    } catch (error) {
        console.error('Failed to download file:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Helper function to convert stream to blob with progress tracking 
 */
const streamToBlob = async (stream, totalSize, onProgress) => {
    const reader = stream.getReader();
    const chunks = [];
    let receivedLength = 0;

    while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        chunks.push(value);
        receivedLength += value.length;

        if (onProgress && totalSize) {
            const percentage = Math.round((receivedLength / totalSize) * 100);
            onProgress({
                loaded: receivedLength,
                total: totalSize,
                percentage
            });
        }
    }

    return new Blob(chunks);
};

/**
 * Generate shareable presigned URL
 */
export const generateShareableLink = async (key, expiresIn = 3600) => {
    if (!s3Client || !currentBucket) {
        return { success: false, error: 'S3 client not initialized' };
    }

    try {
        const command = new GetObjectCommand({
            Bucket: currentBucket,
            Key: key
        });

        const url = await getSignedUrl(s3Client, command, { expiresIn });
        return { success: true, url };
    } catch (error) {
        console.error('Failed to generate shareable link:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Delete multiple objects
 * SECURITY: Validates all keys before deletion
 */
export const deleteObjects = async (keys) => {
    if (!s3Client || !currentBucket) {
        return { success: false, error: 'S3 client not initialized' };
    }

    try {
        // SECURITY: Validate and sanitize all keys
        const sanitizedKeys = keys.map(key => {
            const sanitized = sanitizeS3Path(key);
            // Validate ONLY the sanitized key
            if (!sanitized || validateKey(sanitized)) {
                throw new Error(`Invalid path: ${key}`);
            }
            return sanitized;
        });

        const command = new DeleteObjectsCommand({
            Bucket: currentBucket,
            Delete: {
                Objects: keys.map(key => ({ Key: key })),
                Quiet: false
            }
        });

        const response = await s3Client.send(command);

        return {
            success: true,
            deleted: response.Deleted || [],
            errors: response.Errors || []
        };
    } catch (error) {
        console.error('Failed to delete objects:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Delete multiple items (files and folders) recursively
 * OPTIMIZED: Parallel listing and batched deletion
 */
export const deleteItems = async (items) => {
    if (!s3Client || !currentBucket) {
        return { success: false, error: 'S3 client not initialized' };
    }

    try {
        // OPTIMIZATION: Process all items in parallel
        const listPromises = items.map(async (item) => {
            if (item.type === 'folder') {
                const keys = [];
                let continuationToken = null;
                
                do {
                    const command = new ListObjectsV2Command({
                        Bucket: currentBucket,
                        Prefix: item.key,
                        MaxKeys: 1000, // Max per request
                    });

                    if (continuationToken) {
                        command.input.ContinuationToken = continuationToken;
                    }

                    const response = await s3Client.send(command);

                    if (response.Contents) {
                        keys.push(...response.Contents.map(obj => obj.Key));
                    }

                    continuationToken = response.NextContinuationToken;
                } while (continuationToken);

                keys.push(item.key); // Include folder marker
                return keys;
            } else {
                return [item.key];
            }
        });

        // Wait for all listings to complete
        const allKeyArrays = await Promise.all(listPromises);
        let allKeysToDelete = allKeyArrays.flat();

        // Remove duplicates
        allKeysToDelete = [...new Set(allKeysToDelete)];

        if (allKeysToDelete.length === 0) {
            return { success: true };
        }

        // OPTIMIZATION: Delete all batches in parallel
        const BATCH_SIZE = 1000;
        const deletePromises = [];
        
        for (let i = 0; i < allKeysToDelete.length; i += BATCH_SIZE) {
            const batch = allKeysToDelete.slice(i, i + BATCH_SIZE);
            deletePromises.push(deleteObjects(batch));
        }
        
        await Promise.all(deletePromises);

        return { success: true };
    } catch (error) {
        console.error('Failed to delete items:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Create a folder (by creating an empty object with trailing /)
 * SECURITY: Validates folder name and sanitizes path
 */
export const createFolder = async (folderKey) => {
    if (!s3Client || !currentBucket) {
        return { success: false, error: 'S3 client not initialized' };
    }

    try {
        // SECURITY: Validate folder name
        const folderName = folderKey.split('/').filter(Boolean).pop();
        if (!isValidFolderName(folderName)) {
            return { success: false, error: 'Invalid folder name' };
        }

        // SECURITY: Sanitize the full path
        let sanitizedKey = sanitizeS3Path(folderKey);

        // Validate ONLY the sanitized key
        if (!sanitizedKey || validateKey(sanitizedKey)) {
            return { success: false, error: 'Invalid folder path' };
        }

        // Ensure folder key ends with /
        const key = sanitizedKey.endsWith('/') ? sanitizedKey : `${sanitizedKey}/`;

        const command = new PutObjectCommand({
            Bucket: currentBucket,
            Key: key,
            Body: ''
        });

        await s3Client.send(command);
        return { success: true };
    } catch (error) {
        console.error('Failed to create folder:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Rename a file or folder (copy + delete)
 * SECURITY: Validates new name and sanitizes paths
 * UX: Automatically preserves file extensions
 */
export const renameObject = async (oldKey, newName, isFolder = false) => {
    if (!s3Client || !currentBucket) {
        return { success: false, error: 'S3 client not initialized' };
    }

    try {
        // SECURITY: Validate and sanitize new name
        const sanitizedNewName = sanitizeFileName(newName);
        if (!sanitizedNewName || sanitizedNewName !== newName) {
            return { success: false, error: 'Invalid name - contains dangerous characters' };
        }

        if (isFolder && !isValidFolderName(sanitizedNewName)) {
            return { success: false, error: 'Invalid folder name' };
        }

        // Extract the path and create new key
        const pathParts = oldKey.split('/');
        const oldFileName = pathParts[pathParts.length - (isFolder ? 2 : 1)];

        // UX: For files, preserve the extension automatically
        let finalNewName = sanitizedNewName;
        if (!isFolder) {
            finalNewName = preserveFileExtension(sanitizedNewName, oldFileName);
        }

        pathParts[pathParts.length - (isFolder ? 2 : 1)] = finalNewName;
        const newKey = pathParts.join('/');

        if (isFolder) {
            // OPTIMIZED: Stream processing - start copying while still listing
            let allObjects = [];
            let continuationToken = null;
            const copyPromises = [];
            const COPY_BATCH_SIZE = 50; // Increased from 10 to 50 for max throughput
            const MAX_CONCURRENT_COPIES = 100; // Max concurrent operations
            
            // Stream: List and copy simultaneously
            do {
                const command = new ListObjectsV2Command({
                    Bucket: currentBucket,
                    Prefix: oldKey,
                    MaxKeys: 1000, // Get max objects per request
                    ...(continuationToken && { ContinuationToken: continuationToken })
                });

                const response = await s3Client.send(command);
                
                if (response.Contents && response.Contents.length > 0) {
                    allObjects.push(...response.Contents);
                    
                    // Start copying immediately without waiting for full list
                    const copyBatch = response.Contents.map(obj => {
                        const itemNewKey = obj.Key.replace(oldKey, newKey);
                        
                        return s3Client.send(new CopyObjectCommand({
                            Bucket: currentBucket,
                            CopySource: encodeURIComponent(`${currentBucket}/${obj.Key}`),
                            Key: itemNewKey
                        })).catch(err => {
                            console.error(`Failed to copy ${obj.Key}:`, err);
                            throw err;
                        });
                    });
                    
                    copyPromises.push(...copyBatch);
                    
                    // Throttle: Wait if we have too many concurrent operations
                    if (copyPromises.length >= MAX_CONCURRENT_COPIES) {
                        await Promise.all(copyPromises.splice(0, COPY_BATCH_SIZE));
                    }
                }
                
                continuationToken = response.NextContinuationToken;
            } while (continuationToken);

            // Wait for remaining copy operations
            if (copyPromises.length > 0) {
                await Promise.all(copyPromises);
            }

            if (allObjects.length === 0) {
                return { success: true, newKey };
            }

            // OPTIMIZED: Parallel delete in maximum batches (1000 = S3 limit)
            const keysToDelete = allObjects.map(obj => obj.Key);
            const DELETE_BATCH_SIZE = 1000;
            const deletePromises = [];
            
            for (let i = 0; i < keysToDelete.length; i += DELETE_BATCH_SIZE) {
                const batch = keysToDelete.slice(i, i + DELETE_BATCH_SIZE);
                // Fire all delete batches in parallel
                deletePromises.push(deleteObjects(batch));
            }
            
            await Promise.all(deletePromises);
        } else {
            // For files, simple copy and delete
            const copyCommand = new CopyObjectCommand({
                Bucket: currentBucket,
                CopySource: `${currentBucket}/${oldKey}`,
                Key: newKey
            });
            await s3Client.send(copyCommand);

            // Delete old file
            await deleteObjects([oldKey]);
        }

        return { success: true, newKey };
    } catch (error) {
        console.error('Failed to rename object:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Get current bucket name
 */
export const getCurrentBucket = () => currentBucket;

/**
 * Check if S3 client is initialized
 */
export const isS3ClientInitialized = () => !!(s3Client && currentBucket);
