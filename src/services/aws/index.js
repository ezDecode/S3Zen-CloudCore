/**
 * S3 Service - Unified Export
 * 
 * This is the main entry point for S3 operations.
 * Re-exports all functions from split modules for backward compatibility.
 * 
 * ARCHITECTURE (Phase 1 Refactoring):
 * - s3Client.js   → Client initialization, validation
 * - s3List.js     → List operations
 * - s3Upload.js   → Upload operations (small + multipart)
 * - s3Download.js → Download + presigned URLs
 * - s3Manage.js   → Delete, rename, move, folder ops
 * - s3Stats.js    → Bucket statistics
 */

// Client management
export {
    initializeS3Client,
    validateCredentials,
    getS3Client,
    getCurrentBucket,
    isS3ClientInitialized
} from './s3Client.js';

// List operations
export { listObjects } from './s3List.js';

// Upload operations
export { uploadFile, uploadLargeFile } from './s3Upload.js';

// Download operations
export {
    downloadFile,
    generateShareableLink,
    getPreviewUrl
} from './s3Download.js';

// Management operations
export {
    deleteObjects,
    deleteItems,
    createFolder,
    renameObject,
    moveFile
} from './s3Manage.js';

// Statistics
export { getBucketStats } from './s3Stats.js';

// Retry utilities
export { withRetry, createRetryableClient, retryable } from './s3Retry.js';

