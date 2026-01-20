/**
 * S3 Client Module
 * Handles S3 and STS client initialization and validation
 * 
 * Includes:
 * - Retry logic with exponential backoff
 * - Configurable timeouts
 * - Better error handling
 */

import { S3Client, HeadBucketCommand } from '@aws-sdk/client-s3';
import { STSClient, GetCallerIdentityCommand } from '@aws-sdk/client-sts';

// Shared state
let s3Client = null;
let stsClient = null;
let currentBucket = null;
let currentRegion = null;
let bucketOwnerVerified = false;

// Retry configuration for improved reliability
const RETRY_CONFIG = {
    maxAttempts: 5,
    retryMode: 'adaptive', // Uses adaptive retry with token bucket
};

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
            ...RETRY_CONFIG,
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

/**
 * Test S3 Connection without modifying global state
 * Accepts either (credentials, region, bucketName) or single config object
 */
export const testS3Connection = async (credentialsOrConfig, region, bucketName) => {
    // Support both object format and individual params
    let accessKeyId, secretAccessKey, regionToUse, bucket;

    if (typeof credentialsOrConfig === 'object' && credentialsOrConfig.bucketName) {
        // Object format: { accessKeyId, secretAccessKey, bucketName, region }
        accessKeyId = credentialsOrConfig.accessKeyId;
        secretAccessKey = credentialsOrConfig.secretAccessKey;
        regionToUse = credentialsOrConfig.region;
        bucket = credentialsOrConfig.bucketName;
    } else {
        // Individual params format
        accessKeyId = credentialsOrConfig.accessKeyId;
        secretAccessKey = credentialsOrConfig.secretAccessKey;
        regionToUse = region;
        bucket = bucketName;
    }

    // Validate inputs first
    if (!accessKeyId || !secretAccessKey || !bucket || !regionToUse) {
        return {
            success: false,
            error: 'Missing credentials or bucket information'
        };
    }

    try {
        const tempS3 = new S3Client({
            region: regionToUse,
            credentials: {
                accessKeyId,
                secretAccessKey
            },
            maxAttempts: 1,
            requestHandler: {
                connectionTimeout: 10000,
                socketTimeout: 10000
            }
        });

        const tempSTS = new STSClient({
            region: regionToUse,
            credentials: {
                accessKeyId,
                secretAccessKey
            },
            maxAttempts: 1
        });

        await tempS3.send(new HeadBucketCommand({ Bucket: bucket }));
        const identity = await tempSTS.send(new GetCallerIdentityCommand({}));

        return { success: true, identity };
    } catch (error) {
        console.error('Test connection failed:', error);

        // Build user-friendly error message
        let errorMessage = 'Connection failed';
        let errorCode = error.name || 'UnknownError';
        const httpStatus = error.$metadata?.httpStatusCode;

        // Check for CORS / Network errors first (TypeError: Failed to fetch)
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
            errorMessage = 'CORS Error: Your S3 bucket needs CORS configuration. Go to S3 Console → Bucket → Permissions → CORS and add localhost:5173 to AllowedOrigins';
            errorCode = 'CORSError';
        }
        // 403 Forbidden - Permission issues
        else if (httpStatus === 403 || error.name === 'Forbidden' || error.name === 'AccessDenied') {
            errorMessage = 'Access Denied: Your IAM user doesn\'t have S3 permissions. Add AmazonS3FullAccess policy to your IAM user.';
            errorCode = 'AccessDenied';
        }
        // 404 Not Found - Bucket doesn't exist
        else if (httpStatus === 404 || error.name === 'NotFound' || error.name === 'NoSuchBucket') {
            errorMessage = `Bucket "${bucket}" not found in region ${regionToUse}. Check bucket name and region.`;
            errorCode = 'BucketNotFound';
        }
        // Invalid credentials
        else if (error.name === 'InvalidAccessKeyId') {
            errorMessage = 'Invalid Access Key ID. Please check your credentials.';
            errorCode = 'InvalidCredentials';
        }
        else if (error.name === 'SignatureDoesNotMatch') {
            errorMessage = 'Invalid Secret Access Key. Please check your credentials.';
            errorCode = 'InvalidCredentials';
        }
        // Network errors
        else if (error.name === 'NetworkingError' || error.code === 'ENOTFOUND') {
            errorMessage = 'Network error. Check your internet connection.';
            errorCode = 'NetworkError';
        }
        // Generic error with the original message
        else {
            errorMessage = error.message || 'Unknown error occurred';
        }

        return {
            success: false,
            error: errorMessage,
            code: errorCode,
            details: {
                bucket,
                region: regionToUse,
                httpStatus
            }
        };
    }
};

