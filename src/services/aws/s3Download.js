/**
 * S3 Download Operations
 * Handles file downloads with progress tracking
 */

import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getS3Client, getCurrentBucket } from './s3Client.js';
import { sanitizeS3Path, validateKey, normalizeKey } from '../../utils/validationUtils.js';

/**
 * Download file via presigned URL with progress tracking
 */
export const downloadFile = async (itemOrKey, onProgress) => {
    const s3Client = getS3Client();
    const bucket = getCurrentBucket();

    if (!s3Client || !bucket) {
        return { success: false, error: 'S3 client not initialized' };
    }

    try {
        const key = typeof itemOrKey === 'string' ? itemOrKey : itemOrKey.key;
        const fileName = typeof itemOrKey === 'string'
            ? itemOrKey.split('/').pop()
            : itemOrKey.name || itemOrKey.key.split('/').pop();
        const fileSize = typeof itemOrKey === 'object' ? itemOrKey.size : null;

        const command = new GetObjectCommand({ Bucket: bucket, Key: key });

        // For small files or no progress needed, use presigned URL
        if (!onProgress || (fileSize && fileSize < 5 * 1024 * 1024)) {
            const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

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
 * Generate shareable presigned URL
 */
export const generateShareableLink = async (key, expiresIn = 3600) => {
    const s3Client = getS3Client();
    const bucket = getCurrentBucket();

    if (!s3Client || !bucket) {
        return { success: false, error: 'S3 client not initialized' };
    }

    try {
        const command = new GetObjectCommand({ Bucket: bucket, Key: key });
        const url = await getSignedUrl(s3Client, command, { expiresIn });
        return { success: true, url };
    } catch (error) {
        console.error('Failed to generate shareable link:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Get presigned URL for file preview
 */
export const getPreviewUrl = async (key, expiresIn = 3600) => {
    const s3Client = getS3Client();
    const bucket = getCurrentBucket();

    if (!s3Client || !bucket) {
        return { success: false, error: 'S3 client not initialized' };
    }

    try {
        const normalizedKey = normalizeKey(key);
        const sanitizedKey = sanitizeS3Path(normalizedKey);
        if (!sanitizedKey || validateKey(sanitizedKey)) {
            return { success: false, error: 'Invalid file path' };
        }

        const command = new GetObjectCommand({ Bucket: bucket, Key: sanitizedKey });
        const url = await getSignedUrl(s3Client, command, { expiresIn });
        return { success: true, url };
    } catch (error) {
        console.error('Failed to get preview URL:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Stream to blob with progress tracking
 */
const streamToBlob = async (stream, totalSize, onProgress) => {
    const reader = stream.getReader();
    const chunks = [];
    let receivedLength = 0;
    let lastProgressUpdate = 0;

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
        receivedLength += value.length;

        if (onProgress && totalSize) {
            const progressDelta = receivedLength - lastProgressUpdate;
            if (progressDelta >= 100000 || receivedLength === totalSize) {
                onProgress({
                    loaded: receivedLength,
                    total: totalSize,
                    percentage: Math.round((receivedLength / totalSize) * 100)
                });
                lastProgressUpdate = receivedLength;
            }
        }
    }

    return new Blob(chunks);
};
