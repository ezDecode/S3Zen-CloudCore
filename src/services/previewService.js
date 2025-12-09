/**
 * Preview Service
 * Handles file preview URL generation and content fetching
 */

import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { normalizeKey, sanitizeS3Path, validateKey } from '../utils/validationUtils';

// LRU Cache for presigned URLs with size limit
const MAX_CACHE_SIZE = 100;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

class LRUCache {
    constructor(maxSize) {
        this.maxSize = maxSize;
        this.cache = new Map();
    }

    get(key) {
        if (!this.cache.has(key)) return null;
        
        const item = this.cache.get(key);
        // Check expiration
        if (Date.now() - item.timestamp > CACHE_DURATION) {
            this.cache.delete(key);
            return null;
        }
        
        // Move to end (most recently used)
        this.cache.delete(key);
        this.cache.set(key, item);
        return item;
    }

    set(key, value) {
        // Remove if exists (to update position)
        if (this.cache.has(key)) {
            this.cache.delete(key);
        }
        
        // Evict oldest if at capacity
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        
        this.cache.set(key, value);
    }

    clear() {
        this.cache.clear();
    }

    // Cleanup expired entries
    cleanup() {
        const now = Date.now();
        for (const [key, value] of this.cache.entries()) {
            if (now - value.timestamp > CACHE_DURATION) {
                this.cache.delete(key);
            }
        }
    }
}

const urlCache = new LRUCache(MAX_CACHE_SIZE);

// Periodic cleanup of expired entries
setInterval(() => {
    urlCache.cleanup();
}, CACHE_DURATION);

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

    // Validate input
    if (!s3Key || typeof s3Key !== 'string') {
        throw new Error('Invalid file path');
    }

    // SECURITY: normalize, sanitize, validate server-side
    const normalizedKey = normalizeKey(s3Key);
    const sanitizedKey = sanitizeS3Path(normalizedKey);
    if (!sanitizedKey || validateKey(sanitizedKey)) {
        throw new Error('Invalid file path');
    }

    // Check cache
    const cached = urlCache.get(sanitizedKey);
    if (cached) {
        return cached.url;
    }

    try {
        const s3Client = s3ClientGetter();
        const bucket = bucketGetter();
        if (!bucket) {
            throw new Error('No bucket selected');
        }

        const command = new GetObjectCommand({
            Bucket: bucket,
            Key: sanitizedKey
        });

        const url = await getSignedUrl(s3Client, command, { expiresIn });

        // Cache the URL
        urlCache.set(sanitizedKey, {
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
