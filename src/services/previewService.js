/**
 * Preview Service
 * Handles file preview URL generation and content fetching
 */

import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand } from '@aws-sdk/client-s3';

// Cache for presigned URLs (5 minutes)
const urlCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get S3 client from s3Service
 */
let s3ClientGetter = null;
let bucketGetter = null;

export const initializePreviewService = (getClient, getBucket) => {
    s3ClientGetter = getClient;
    bucketGetter = getBucket;
};

/**
 * Generate presigned URL for preview
 */
export const getPreviewUrl = async (s3Key, expiresIn = 3600) => {
    if (!s3ClientGetter || !bucketGetter) {
        throw new Error('Preview service not initialized');
    }

    // Check cache
    const cached = urlCache.get(s3Key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.url;
    }

    try {
        const s3Client = s3ClientGetter();
        const bucket = bucketGetter();

        const command = new GetObjectCommand({
            Bucket: bucket,
            Key: s3Key
        });

        const url = await getSignedUrl(s3Client, command, { expiresIn });

        // Cache the URL
        urlCache.set(s3Key, {
            url,
            timestamp: Date.now()
        });

        return url;
    } catch (error) {
        console.error('Failed to generate preview URL:', error);
        throw error;
    }
};

/**
 * Fetch file content as text (for text/code files)
 */
export const getFileContent = async (s3Key) => {
    try {
        const url = await getPreviewUrl(s3Key);
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Failed to fetch file content');
        }
        
        const text = await response.text();
        return text;
    } catch (error) {
        console.error('Failed to get file content:', error);
        throw error;
    }
};

/**
 * Fetch file as blob (for binary files)
 */
export const getFileBlob = async (s3Key) => {
    try {
        const url = await getPreviewUrl(s3Key);
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Failed to fetch file');
        }
        
        const blob = await response.blob();
        return blob;
    } catch (error) {
        console.error('Failed to get file blob:', error);
        throw error;
    }
};

/**
 * Clear URL cache
 */
export const clearPreviewCache = () => {
    urlCache.clear();
};

/**
 * Preload next file URL (for faster navigation)
 */
export const preloadPreviewUrl = async (s3Key) => {
    try {
        await getPreviewUrl(s3Key);
    } catch (error) {
        // Silently fail for preloading
        console.warn('Failed to preload preview URL:', error);
    }
};
