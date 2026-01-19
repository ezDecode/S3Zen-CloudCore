/**
 * S3 List Operations
 * Handles listing objects in S3 buckets
 */

import { ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getS3Client, getCurrentBucket } from './s3Client.js';
import { sanitizeS3Path, validateKey } from '../../utils/validationUtils.js';

/**
 * List objects in a folder (prefix)
 */
export const listObjects = async (prefix = '', continuationToken = null) => {
    const s3Client = getS3Client();
    const bucket = getCurrentBucket();

    if (!s3Client || !bucket) {
        return { success: false, error: 'S3 client not initialized' };
    }

    try {
        const sanitizedPrefix = sanitizeS3Path(prefix);
        if (prefix && validateKey(sanitizedPrefix)) {
            return { success: false, error: 'Invalid path format' };
        }

        const { rateLimitOperation } = await import('../../utils/rateLimiter.js');

        const response = await rateLimitOperation('list', async () => {
            const command = new ListObjectsV2Command({
                Bucket: bucket,
                Prefix: sanitizedPrefix,
                Delimiter: '/',
                MaxKeys: 1000,
                ...(continuationToken && { ContinuationToken: continuationToken })
            });
            return await s3Client.send(command);
        });

        const prefixLength = prefix.length;

        const folders = (response.CommonPrefixes || []).map(item => ({
            key: item.Prefix,
            name: item.Prefix.slice(prefixLength, -1),
            type: 'folder',
            size: 0,
            lastModified: null
        }));

        const files = [];
        for (const item of response.Contents || []) {
            if (item.Key === prefix) continue;
            files.push({
                key: item.Key,
                name: item.Key.slice(prefixLength),
                type: 'file',
                size: item.Size,
                lastModified: item.LastModified
            });
        }

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
