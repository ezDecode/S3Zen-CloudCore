/**
 * S3 Client Factory - Creates S3Client from credentials
 */
const { S3Client } = require('@aws-sdk/client-s3');

function createS3Client(credentials, region) {
    if (!credentials?.accessKeyId || !credentials?.secretAccessKey) {
        throw new Error('Missing credentials');
    }
    if (!region) throw new Error('Region required');

    return new S3Client({
        region,
        credentials: {
            accessKeyId: credentials.accessKeyId,
            secretAccessKey: credentials.secretAccessKey,
            ...(credentials.sessionToken && { sessionToken: credentials.sessionToken })
        },
        maxAttempts: 3
    });
}

module.exports = { createS3Client };
