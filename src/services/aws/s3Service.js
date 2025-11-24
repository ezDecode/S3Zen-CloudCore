/**
 * S3 Service
 * Core AWS S3 operations for CloudCore file manager
 */

import {
    S3Client,
    ListObjectsV2Command,
    PutObjectCommand,
    DeleteObjectsCommand,
    HeadBucketCommand,
    GetObjectCommand,
    CopyObjectCommand
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

let s3Client = null;
let currentBucket = null;

/**
 * Initialize S3 Client with credentials
 */
export const initializeS3Client = (credentials, region, bucketName) => {
    try {
        s3Client = new S3Client({
            region,
            credentials: {
                accessKeyId: credentials.accessKeyId,
                secretAccessKey: credentials.secretAccessKey,
                ...(credentials.sessionToken && { sessionToken: credentials.sessionToken })
            }
        });

        currentBucket = bucketName;
        return { success: true };
    } catch (error) {
        console.error('Failed to initialize S3 client:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Validate credentials by attempting to access the bucket
 */
export const validateCredentials = async () => {
    if (!s3Client || !currentBucket) {
        return { success: false, error: 'S3 client not initialized' };
    }

    try {
        const command = new HeadBucketCommand({
            Bucket: currentBucket
        });

        await s3Client.send(command);
        return { success: true };
    } catch (error) {
        console.error('Credential validation failed:', error);

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
 */
export const listObjects = async (prefix = '', continuationToken = null) => {
    if (!s3Client || !currentBucket) {
        return { success: false, error: 'S3 client not initialized' };
    }

    try {
        const command = new ListObjectsV2Command({
            Bucket: currentBucket,
            Prefix: prefix,
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
 */
export const uploadFile = async (file, key, onProgress) => {
    if (!s3Client || !currentBucket) {
        return { success: false, error: 'S3 client not initialized' };
    }

    try {
        const fileBuffer = await file.arrayBuffer();
        const command = new PutObjectCommand({
            Bucket: currentBucket,
            Key: key,
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
 */
export const uploadLargeFile = async (file, key, onProgress) => {
    if (!s3Client || !currentBucket) {
        return { success: false, error: 'S3 client not initialized' };
    }

    try {
        const upload = new Upload({
            client: s3Client,
            params: {
                Bucket: currentBucket,
                Key: key,
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
 */
export const deleteObjects = async (keys) => {
    if (!s3Client || !currentBucket) {
        return { success: false, error: 'S3 client not initialized' };
    }

    try {
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
 * Create a folder (by creating an empty object with trailing /)
 */
export const createFolder = async (folderKey) => {
    if (!s3Client || !currentBucket) {
        return { success: false, error: 'S3 client not initialized' };
    }

    try {
        // Ensure folder key ends with /
        const key = folderKey.endsWith('/') ? folderKey : `${folderKey}/`;

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
 */
export const renameObject = async (oldKey, newName, isFolder = false) => {
    if (!s3Client || !currentBucket) {
        return { success: false, error: 'S3 client not initialized' };
    }

    try {
        // Extract the path and create new key
        const pathParts = oldKey.split('/');
        pathParts[pathParts.length - (isFolder ? 2 : 1)] = newName;
        const newKey = pathParts.join('/');

        if (isFolder) {
            // For folders, we need to rename all objects with this prefix
            const listResult = await listObjects(oldKey);
            if (!listResult.success) {
                throw new Error('Failed to list folder contents');
            }

            // Copy all items
            for (const item of listResult.items) {
                const itemNewKey = item.key.replace(oldKey, newKey);

                if (item.type === 'file') {
                    const copyCommand = new CopyObjectCommand({
                        Bucket: currentBucket,
                        CopySource: `${currentBucket}/${item.key}`,
                        Key: itemNewKey
                    });
                    await s3Client.send(copyCommand);
                }
            }

            // Delete old folder
            const keysToDelete = listResult.items.map(item => item.key);
            keysToDelete.push(oldKey); // Include folder marker
            await deleteObjects(keysToDelete);

            // Create new folder marker
            await createFolder(newKey);
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
