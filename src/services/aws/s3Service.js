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
    GetObjectCommand
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
        const command = new PutObjectCommand({
            Bucket: currentBucket,
            Key: key,
            Body: file,
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
            partSize: 5 * 1024 * 1024, // 5MB parts
            queueSize: 4 // 4 concurrent uploads
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
 * Download file via presigned URL
 */
export const downloadFile = async (key) => {
    if (!s3Client || !currentBucket) {
        return { success: false, error: 'S3 client not initialized' };
    }

    try {
        const command = new GetObjectCommand({
            Bucket: currentBucket,
            Key: key
        });

        const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

        // Trigger download
        const link = document.createElement('a');
        link.href = url;
        link.download = key.split('/').pop();
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        return { success: true };
    } catch (error) {
        console.error('Failed to download file:', error);
        return { success: false, error: error.message };
    }
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
 * Get current bucket name
 */
export const getCurrentBucket = () => currentBucket;

/**
 * Check if S3 client is initialized
 */
export const isS3ClientInitialized = () => !!(s3Client && currentBucket);
