/**
 * S3 Upload Operations
 * Handles file uploads (small and large/multipart)
 */

import { PutObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getS3Client, getCurrentBucket } from './s3Client.js';
import { sanitizeS3Path, validateKey, normalizeKey, isValidFileSize } from '../../utils/validationUtils.js';

/**
 * Upload a file to S3
 */
export const uploadFile = async (file, key, onProgress) => {
    const s3Client = getS3Client();
    const bucket = getCurrentBucket();

    if (!s3Client || !bucket) {
        return { success: false, error: 'S3 client not initialized' };
    }

    try {
        if (!isValidFileSize(file.size)) {
            return { success: false, error: 'File size exceeds maximum allowed (5GB)' };
        }

        const normalizedKey = normalizeKey(key);
        const sanitizedKey = sanitizeS3Path(normalizedKey);

        if (!sanitizedKey || validateKey(sanitizedKey)) {
            console.error('❌ Upload blocked - Invalid path:', { original: key, sanitized: sanitizedKey });
            return { success: false, error: 'Invalid file path - contains dangerous patterns' };
        }

        const { rateLimitOperation } = await import('../../utils/rateLimiter.js');

        await rateLimitOperation('upload', async () => {
            const fileBuffer = await file.arrayBuffer();
            const command = new PutObjectCommand({
                Bucket: bucket,
                Key: sanitizedKey,
                Body: new Uint8Array(fileBuffer),
                ContentType: file.type
            });
            await s3Client.send(command);
        });

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
    const s3Client = getS3Client();
    const bucket = getCurrentBucket();

    if (!s3Client || !bucket) {
        return { success: false, error: 'S3 client not initialized' };
    }

    try {
        if (!isValidFileSize(file.size)) {
            return { success: false, error: 'File size exceeds maximum allowed (5GB)' };
        }

        const normalizedKey = normalizeKey(key);
        const sanitizedKey = sanitizeS3Path(normalizedKey);

        if (!sanitizedKey || validateKey(sanitizedKey)) {
            console.error('❌ Large file upload blocked - Invalid path:', { original: key, sanitized: sanitizedKey });
            return { success: false, error: 'Invalid file path - contains dangerous patterns' };
        }

        const upload = new Upload({
            client: s3Client,
            params: {
                Bucket: bucket,
                Key: sanitizedKey,
                Body: file,
                ContentType: file.type
            },
            partSize: 25 * 1024 * 1024, // 25MB parts
            queueSize: 10 // 10 concurrent part uploads
        });

        upload.on('httpUploadProgress', (progress) => {
            if (onProgress) {
                onProgress({
                    loaded: progress.loaded,
                    total: progress.total,
                    percentage: Math.round((progress.loaded / progress.total) * 100)
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
