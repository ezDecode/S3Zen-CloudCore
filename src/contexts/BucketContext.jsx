/**
 * Bucket Context
 * Manages current bucket state and credentials
 */

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { api } from '../services/api';
import { initializeS3Client, validateCredentials, isS3ClientInitialized } from '../services/aws/s3Client';

const BucketContext = createContext(null);

export const BucketProvider = ({ children }) => {
    const [buckets, setBuckets] = useState([]);
    const [currentBucket, setCurrentBucket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Load all buckets for current user
     */
    const loadBuckets = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await api.buckets.list();
            setBuckets(result.buckets || []);
            return result.buckets || [];
        } catch (err) {
            setError(err.message);
            return [];
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Connect to a specific bucket
     */
    const connectToBucket = useCallback(async (bucketId) => {
        setIsLoading(true);
        setError(null);
        setIsConnected(false);

        try {
            // Get bucket credentials
            const result = await api.buckets.getCredentials(bucketId);

            if (!result.success || !result.credentials) {
                throw new Error(result.error || 'Failed to get bucket credentials');
            }

            const { credentials, bucket } = result;

            // Initialize S3 client
            const initResult = initializeS3Client(
                credentials,
                credentials.region || bucket?.region,
                credentials.bucketName || bucket?.bucket_name
            );

            if (!initResult.success) {
                throw new Error(initResult.error || 'Failed to initialize S3 client');
            }

            // Validate connection
            const validationResult = await validateCredentials();
            if (!validationResult.success) {
                throw new Error(validationResult.error || 'Failed to validate credentials');
            }

            setCurrentBucket({
                id: bucketId,
                name: credentials.bucketName || bucket?.bucket_name,
                region: credentials.region || bucket?.region,
                displayName: bucket?.display_name || bucket?.name
            });
            setIsConnected(true);

            return { success: true };
        } catch (err) {
            setError(err.message);
            setCurrentBucket(null);
            setIsConnected(false);
            return { success: false, error: err.message };
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Connect to default bucket
     */
    const connectToDefaultBucket = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await api.buckets.getDefault();

            if (!result.success || !result.bucket) {
                return { success: false, error: 'No default bucket configured' };
            }

            return connectToBucket(result.bucket.id);
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setIsLoading(false);
        }
    }, [connectToBucket]);

    /**
     * Disconnect from current bucket
     */
    const disconnect = useCallback(() => {
        setCurrentBucket(null);
        setIsConnected(false);
        setError(null);
    }, []);

    const value = {
        // State
        buckets,
        currentBucket,
        isConnected,
        isLoading,
        error,

        // Actions
        loadBuckets,
        connectToBucket,
        connectToDefaultBucket,
        disconnect,

        // Utilities
        isS3Ready: isS3ClientInitialized
    };

    return (
        <BucketContext.Provider value={value}>
            {children}
        </BucketContext.Provider>
    );
};

export const useBucket = () => {
    const context = useContext(BucketContext);
    if (!context) {
        throw new Error('useBucket must be used within a BucketProvider');
    }
    return context;
};
