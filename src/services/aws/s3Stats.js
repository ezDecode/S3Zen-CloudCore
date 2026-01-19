/**
 * S3 Statistics Operations
 * Handles bucket statistics and analytics
 */

import { ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getS3Client, getCurrentBucket } from './s3Client.js';

/**
 * Get file category from extension
 */
const getFileCategory = (key) => {
    const ext = key.split('.').pop()?.toLowerCase() || '';

    const categories = {
        images: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'],
        videos: ['mp4', 'webm', 'mov', 'avi', 'mkv', 'm4v'],
        audio: ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac'],
        documents: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf'],
        code: ['js', 'jsx', 'ts', 'tsx', 'json', 'html', 'css', 'py', 'java', 'c', 'cpp', 'go', 'rs', 'md'],
        archives: ['zip', 'rar', '7z', 'tar', 'gz', 'bz2']
    };

    for (const [category, extensions] of Object.entries(categories)) {
        if (extensions.includes(ext)) return category;
    }
    return 'other';
};

/**
 * Get bucket storage statistics
 */
export const getBucketStats = async (onProgress = null, abortSignal = null) => {
    const s3Client = getS3Client();
    const bucket = getCurrentBucket();

    if (!s3Client || !bucket) {
        return { success: false, error: 'S3 client not initialized' };
    }

    try {
        let totalSize = 0;
        let fileCount = 0;
        let folderCount = 0;
        let processedObjects = 0;
        const fileTypes = {
            images: { count: 0, size: 0 },
            videos: { count: 0, size: 0 },
            audio: { count: 0, size: 0 },
            documents: { count: 0, size: 0 },
            code: { count: 0, size: 0 },
            archives: { count: 0, size: 0 },
            other: { count: 0, size: 0 }
        };
        let continuationToken = null;
        let totalObjects = null;

        do {
            if (abortSignal?.aborted) {
                return { success: false, error: 'Operation cancelled' };
            }

            const response = await s3Client.send(new ListObjectsV2Command({
                Bucket: bucket,
                MaxKeys: 1000,
                ...(continuationToken && { ContinuationToken: continuationToken })
            }));

            if (totalObjects === null && response.KeyCount !== undefined) {
                totalObjects = response.KeyCount;
            }

            if (response.Contents) {
                for (const item of response.Contents) {
                    if (abortSignal?.aborted) {
                        return { success: false, error: 'Operation cancelled' };
                    }

                    processedObjects++;

                    if (item.Key.endsWith('/')) {
                        folderCount++;
                    } else {
                        fileCount++;
                        const size = item.Size || 0;
                        totalSize += size;

                        const category = getFileCategory(item.Key);
                        fileTypes[category].count++;
                        fileTypes[category].size += size;
                    }
                }

                if (onProgress && totalObjects) {
                    onProgress({
                        processed: processedObjects,
                        total: totalObjects,
                        percentage: Math.round((processedObjects / totalObjects) * 100),
                        currentSize: totalSize,
                        currentFileCount: fileCount
                    });
                }
            }

            continuationToken = response.NextContinuationToken;
        } while (continuationToken);

        return { success: true, totalSize, fileCount, folderCount, fileTypes };
    } catch (error) {
        console.error('Failed to get bucket stats:', error);
        return { success: false, error: error.message };
    }
};
