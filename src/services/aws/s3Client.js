/**
 * S3 Client Module
 * Handles S3 and STS client initialization and validation
 */

import { S3Client, HeadBucketCommand } from '@aws-sdk/client-s3';
import { STSClient, GetCallerIdentityCommand } from '@aws-sdk/client-sts';

// Shared state
let s3Client = null;
let stsClient = null;
let currentBucket = null;
let currentRegion = null;
let bucketOwnerVerified = false;

/**
 * Initialize S3 Client with credentials
 */
export const initializeS3Client = (credentials, region, bucketName) => {
    try {
        const awsConfig = {
            region,
            credentials: {
                accessKeyId: credentials.accessKeyId,
                secretAccessKey: credentials.secretAccessKey,
                ...(credentials.sessionToken && { sessionToken: credentials.sessionToken })
            },
            maxAttempts: 3,
            requestHandler: {
                connectionTimeout: 30000,
                socketTimeout: 30000
            }
        };

        s3Client = new S3Client(awsConfig);
        stsClient = new STSClient(awsConfig);
        currentBucket = bucketName;
        currentRegion = region;
        bucketOwnerVerified = false;

        return { success: true };
    } catch (error) {
        console.error('Failed to initialize S3 client:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Validate credentials and bucket ownership using STS
 */
export const validateCredentials = async () => {
    if (!s3Client || !stsClient || !currentBucket) {
        return { success: false, error: 'S3 client not initialized' };
    }

    try {
        await s3Client.send(new HeadBucketCommand({ Bucket: currentBucket }));
        const identity = await stsClient.send(new GetCallerIdentityCommand({}));

        console.log('✓ Bucket access verified for:', identity.UserId);
        bucketOwnerVerified = true;

        return {
            success: true,
            identity: { userId: identity.UserId, account: identity.Account, arn: identity.Arn }
        };
    } catch (error) {
        console.error('Credential validation failed:', error);
        bucketOwnerVerified = false;

        let errorMessage = 'Invalid credentials or bucket access denied';
        if (error.name === 'NotFound') errorMessage = 'Bucket not found';
        else if (error.name === 'Forbidden') errorMessage = 'Access denied to bucket';
        else if (error.name === 'NetworkingError') errorMessage = 'Network error - check your connection';

        return { success: false, error: errorMessage };
    }
};

// Getters for shared state
export const getS3Client = () => s3Client;
export const getCurrentBucket = () => currentBucket;
export const getCurrentRegion = () => currentRegion;
export const isS3ClientInitialized = () => !!(s3Client && currentBucket);
export const isBucketVerified = () => bucketOwnerVerified;
