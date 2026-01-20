/**
 * Buckets API Module
 * Handles all bucket CRUD operations
 * Delegates to BucketManagerService which handles Auth + Offline fallback
 */

import bucketManagerService from '../bucketManagerService';

export const buckets = {
    /** List all buckets for current user */
    list: () => bucketManagerService.getBuckets(),

    /** Get single bucket by ID */
    get: (bucketId) => bucketManagerService.getBucket(bucketId),

    /** Get default bucket */
    getDefault: () => bucketManagerService.getDefaultBucket(),

    /** Get bucket credentials (decrypted server-side or from local) */
    getCredentials: (bucketId) => bucketManagerService.getBucketCredentials(bucketId),

    /** Create new bucket */
    create: (data) => bucketManagerService.createBucket(data),

    /** Update bucket */
    update: (bucketId, data) => bucketManagerService.updateBucket(bucketId, data),

    /** Delete bucket */
    delete: (bucketId) => bucketManagerService.deleteBucket(bucketId),

    /** Validate bucket access */
    validate: (data) => bucketManagerService.validateBucket(data),

    /** Get bucket count */
    count: () => bucketManagerService.getBucketCount()
};
