/**
 * Mock Bucket Service for Offline/Local Mode
 * Stores bucket configurations in localStorage
 */

const STORAGE_KEY = 'orbit_buckets_local';

export const mockBucketService = {
    getBuckets: () => {
        const stored = localStorage.getItem(STORAGE_KEY);
        const buckets = stored ? JSON.parse(stored) : [];
        return { success: true, buckets };
    },

    saveBucket: (bucketData) => {
        const stored = localStorage.getItem(STORAGE_KEY);
        const buckets = stored ? JSON.parse(stored) : [];

        const newBucket = {
            ...bucketData,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString()
        };

        buckets.push(newBucket);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(buckets));

        return { success: true, bucket: newBucket };
    },

    updateBucket: (id, bucketData) => {
        const stored = localStorage.getItem(STORAGE_KEY);
        let buckets = stored ? JSON.parse(stored) : [];

        const index = buckets.findIndex(b => b.id === id);
        if (index === -1) throw new Error('Bucket not found');

        buckets[index] = { ...buckets[index], ...bucketData };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(buckets));

        return { success: true, bucket: buckets[index] };
    },

    deleteBucket: (id) => {
        const stored = localStorage.getItem(STORAGE_KEY);
        let buckets = stored ? JSON.parse(stored) : [];

        buckets = buckets.filter(b => b.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(buckets));

        return { success: true };
    },

    getCredentials: (id) => {
        const stored = localStorage.getItem(STORAGE_KEY);
        const buckets = stored ? JSON.parse(stored) : [];
        const bucket = buckets.find(b => b.id === id);

        if (!bucket) throw new Error('Bucket not found');

        return {
            success: true,
            credentials: {
                accessKeyId: bucket.accessKeyId,
                secretAccessKey: bucket.secretAccessKey,
                region: bucket.region,
                bucketName: bucket.bucketName
            }
        };
    }
};
