const express = require('express');
const { S3Client, HeadBucketCommand, GetBucketLocationCommand } = require('@aws-sdk/client-s3');
const { requireAuth } = require('../middleware/authMiddleware');
const bucketService = require('../services/bucketService');

const router = express.Router();

async function validateBucketAccess(credentials, region, bucketName) {
    try {
        const s3Client = new S3Client({
            region,
            credentials: {
                accessKeyId: credentials.accessKeyId,
                secretAccessKey: credentials.secretAccessKey,
                ...(credentials.sessionToken && { sessionToken: credentials.sessionToken })
            },
            maxAttempts: 2
        });

        const headCommand = new HeadBucketCommand({ Bucket: bucketName });
        await s3Client.send(headCommand);

        let location = region;
        try {
            const locationCommand = new GetBucketLocationCommand({ Bucket: bucketName });
            const locationResult = await s3Client.send(locationCommand);
            // LocationConstraint is null for us-east-1
            location = locationResult.LocationConstraint || 'us-east-1';
        } catch {
        }

        return {
            success: true,
            bucketInfo: {
                name: bucketName,
                region,
                location
            }
        };
    } catch (error) {
        console.error('[BucketRoutes] Validation error:', error.name, error.message);

        if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
            return {
                success: false,
                code: 'BUCKET_NOT_FOUND',
                message: 'Bucket does not exist or you don\'t have access to it.'
            };
        }

        if (error.name === 'AccessDenied' || error.$metadata?.httpStatusCode === 403) {
            return {
                success: false,
                code: 'ACCESS_DENIED',
                message: 'Access denied. Check your credentials and bucket permissions.'
            };
        }

        if (error.name === 'InvalidAccessKeyId') {
            return {
                success: false,
                code: 'INVALID_CREDENTIALS',
                message: 'Invalid AWS Access Key ID.'
            };
        }

        if (error.name === 'SignatureDoesNotMatch') {
            return {
                success: false,
                code: 'INVALID_CREDENTIALS',
                message: 'Invalid AWS Secret Access Key.'
            };
        }

        return {
            success: false,
            code: 'VALIDATION_FAILED',
            message: 'Failed to validate bucket access. Please check your credentials and try again.'
        };
    }
}

function validateBucketData(data, isUpdate = false) {
    const errors = [];

    if (!isUpdate) {
        if (!data.accessKeyId) {
            errors.push('accessKeyId is required');
        } else if (!/^(AKIA|ASIA)[A-Z0-9]{16}$/.test(data.accessKeyId)) {
            errors.push('Invalid accessKeyId format');
        }

        if (!data.secretAccessKey) {
            errors.push('secretAccessKey is required');
        }

        if (!data.bucketName) {
            errors.push('bucketName is required');
        }

        if (!data.displayName) {
            errors.push('displayName is required');
        }

        if (!data.region) {
            errors.push('region is required');
        }
    }

    if (data.bucketName) {
        if (data.bucketName.length < 3 || data.bucketName.length > 63) {
            errors.push('bucketName must be between 3 and 63 characters');
        }
        if (!/^[a-z0-9][a-z0-9.-]*[a-z0-9]$/.test(data.bucketName)) {
            errors.push('bucketName must start and end with alphanumeric, only lowercase letters, numbers, hyphens, and periods allowed');
        }
    }

    if (data.region) {
        const validRegions = [
            'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
            'ca-central-1', 'ca-west-1',
            'eu-west-1', 'eu-west-2', 'eu-west-3', 'eu-central-1', 'eu-central-2',
            'eu-north-1', 'eu-south-1', 'eu-south-2',
            'ap-east-1', 'ap-south-1', 'ap-south-2',
            'ap-northeast-1', 'ap-northeast-2', 'ap-northeast-3',
            'ap-southeast-1', 'ap-southeast-2', 'ap-southeast-3', 'ap-southeast-4', 'ap-southeast-5',
            'sa-east-1',
            'me-south-1', 'me-central-1',
            'af-south-1',
            'il-central-1'
        ];
        if (!validRegions.includes(data.region)) {
            errors.push(`Invalid region. Valid regions: ${validRegions.join(', ')}`);
        }
    }

    if (data.displayName) {
        if (data.displayName.length < 1 || data.displayName.length > 255) {
            errors.push('displayName must be between 1 and 255 characters');
        }
    }

    return errors;
}

router.post('/', requireAuth({ requireEmailVerified: true }), async (req, res) => {
    try {
        const userId = req.user.id;
        const data = req.body;

        const validationErrors = validateBucketData(data);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                error: {
                    code: 'VALIDATION_ERROR',
                    message: validationErrors.join('. '),
                    status: 400
                }
            });
        }

        const validation = await validateBucketAccess(
            {
                accessKeyId: data.accessKeyId,
                secretAccessKey: data.secretAccessKey,
                sessionToken: data.sessionToken
            },
            data.region,
            data.bucketName
        );

        if (!validation.success) {
            return res.status(400).json({
                error: {
                    code: validation.code,
                    message: validation.message,
                    status: 400
                }
            });
        }

        const result = await bucketService.createBucket(userId, data);

        if (!result.success) {
            const status = result.code === 'DUPLICATE_BUCKET' || result.code === 'DUPLICATE_NAME' ? 409 : 400;
            return res.status(status).json({
                error: {
                    code: result.code || 'CREATE_FAILED',
                    message: result.error,
                    status
                }
            });
        }

        res.status(201).json({
            success: true,
            bucket: result.bucket
        });
    } catch (error) {
        console.error('[BucketRoutes] Create error:', error.message);
        res.status(500).json({
            error: {
                code: 'SERVER_ERROR',
                message: 'An error occurred while creating bucket configuration',
                status: 500
            }
        });
    }
});

router.get('/', requireAuth(), async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await bucketService.getBuckets(userId);

        if (!result.success) {
            return res.status(500).json({
                error: {
                    code: 'FETCH_FAILED',
                    message: result.error,
                    status: 500
                }
            });
        }

        res.json({
            success: true,
            buckets: result.buckets
        });
    } catch (error) {
        console.error('[BucketRoutes] List error:', error.message);
        res.status(500).json({
            error: {
                code: 'SERVER_ERROR',
                message: 'An error occurred while fetching bucket configurations',
                status: 500
            }
        });
    }
});

// Get bucket count for current user (must be before /:id route)
router.get('/count', requireAuth(), async (req, res) => {
    try {
        const userId = req.user.id;
        const count = await bucketService.getBucketCount(userId);

        res.json({
            success: true,
            count
        });
    } catch (error) {
        console.error('[BucketRoutes] Get count error:', error.message);
        res.status(500).json({
            error: {
                code: 'SERVER_ERROR',
                message: 'An error occurred while fetching bucket count',
                status: 500
            }
        });
    }
});

router.get('/default', requireAuth(), async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await bucketService.getDefaultBucket(userId);

        if (!result.success) {
            return res.status(500).json({
                error: {
                    code: 'FETCH_FAILED',
                    message: result.error,
                    status: 500
                }
            });
        }

        res.json({
            success: true,
            bucket: result.bucket,
            message: result.message
        });
    } catch (error) {
        console.error('[BucketRoutes] Get default error:', error.message);
        res.status(500).json({
            error: {
                code: 'SERVER_ERROR',
                message: 'An error occurred while fetching default bucket',
                status: 500
            }
        });
    }
});

router.post('/validate', requireAuth(), async (req, res) => {
    try {
        const data = req.body;

        const validationErrors = validateBucketData(data);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                error: {
                    code: 'VALIDATION_ERROR',
                    message: validationErrors.join('. '),
                    status: 400
                }
            });
        }

        const validation = await validateBucketAccess(
            {
                accessKeyId: data.accessKeyId,
                secretAccessKey: data.secretAccessKey,
                sessionToken: data.sessionToken
            },
            data.region,
            data.bucketName
        );

        if (!validation.success) {
            return res.status(400).json({
                error: {
                    code: validation.code,
                    message: validation.message,
                    status: 400
                }
            });
        }

        res.json({
            success: true,
            message: 'Bucket access validated successfully',
            bucketInfo: validation.bucketInfo
        });
    } catch (error) {
        console.error('[BucketRoutes] Validate error:', error.message);
        res.status(500).json({
            error: {
                code: 'SERVER_ERROR',
                message: 'An error occurred while validating bucket access',
                status: 500
            }
        });
    }
});

router.get('/:id', requireAuth(), async (req, res) => {
    try {
        const userId = req.user.id;
        const bucketId = req.params.id;

        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(bucketId)) {
            return res.status(400).json({
                error: {
                    code: 'INVALID_ID',
                    message: 'Invalid bucket ID format',
                    status: 400
                }
            });
        }

        const result = await bucketService.getBucketById(bucketId, userId);

        if (!result.success) {
            const status = result.code === 'NOT_FOUND' ? 404 : 500;
            return res.status(status).json({
                error: {
                    code: result.code || 'FETCH_FAILED',
                    message: result.error,
                    status
                }
            });
        }

        res.json({
            success: true,
            bucket: bucketService.formatBucketMetadata(result.bucket)
        });
    } catch (error) {
        console.error('[BucketRoutes] Get by ID error:', error.message);
        res.status(500).json({
            error: {
                code: 'SERVER_ERROR',
                message: 'An error occurred while fetching bucket configuration',
                status: 500
            }
        });
    }
});

router.get('/:id/credentials', requireAuth(), async (req, res) => {
    try {
        const userId = req.user.id;
        const bucketId = req.params.id;

        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(bucketId)) {
            return res.status(400).json({
                error: {
                    code: 'INVALID_ID',
                    message: 'Invalid bucket ID format',
                    status: 400
                }
            });
        }

        const result = await bucketService.getBucketCredentials(bucketId, userId);

        if (!result.success) {
            const status = result.code === 'NOT_FOUND' ? 404 : 500;
            return res.status(status).json({
                error: {
                    code: result.code || 'FETCH_FAILED',
                    message: result.error,
                    status
                }
            });
        }

        res.json({
            success: true,
            credentials: result.credentials
        });
    } catch (error) {
        console.error('[BucketRoutes] Get credentials error:', error.message);
        res.status(500).json({
            error: {
                code: 'SERVER_ERROR',
                message: 'An error occurred while fetching credentials',
                status: 500
            }
        });
    }
});

router.put('/:id', requireAuth({ requireEmailVerified: true }), async (req, res) => {
    try {
        const userId = req.user.id;
        const bucketId = req.params.id;
        const data = req.body;

        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(bucketId)) {
            return res.status(400).json({
                error: {
                    code: 'INVALID_ID',
                    message: 'Invalid bucket ID format',
                    status: 400
                }
            });
        }

        const validationErrors = validateBucketData(data, true);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                error: {
                    code: 'VALIDATION_ERROR',
                    message: validationErrors.join('. '),
                    status: 400
                }
            });
        }

        if (data.accessKeyId || data.secretAccessKey) {
            const existing = await bucketService.getBucketCredentials(bucketId, userId);
            if (!existing.success) {
                return res.status(404).json({
                    error: {
                        code: 'NOT_FOUND',
                        message: 'Bucket configuration not found',
                        status: 404
                    }
                });
            }

            const validation = await validateBucketAccess(
                {
                    accessKeyId: data.accessKeyId || existing.credentials.accessKeyId,
                    secretAccessKey: data.secretAccessKey || existing.credentials.secretAccessKey,
                    sessionToken: data.sessionToken !== undefined ? data.sessionToken : existing.credentials.sessionToken
                },
                data.region || existing.credentials.region,
                existing.credentials.bucketName
            );

            if (!validation.success) {
                return res.status(400).json({
                    error: {
                        code: validation.code,
                        message: validation.message,
                        status: 400
                    }
                });
            }
        }

        const result = await bucketService.updateBucket(bucketId, userId, data);

        if (!result.success) {
            const status = result.code === 'NOT_FOUND' ? 404 :
                result.code === 'DUPLICATE_NAME' ? 409 : 500;
            return res.status(status).json({
                error: {
                    code: result.code || 'UPDATE_FAILED',
                    message: result.error,
                    status
                }
            });
        }

        res.json({
            success: true,
            bucket: result.bucket
        });
    } catch (error) {
        console.error('[BucketRoutes] Update error:', error.message);
        res.status(500).json({
            error: {
                code: 'SERVER_ERROR',
                message: 'An error occurred while updating bucket configuration',
                status: 500
            }
        });
    }
});

router.delete('/:id', requireAuth({ requireEmailVerified: true }), async (req, res) => {
    try {
        const userId = req.user.id;
        const bucketId = req.params.id;

        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(bucketId)) {
            return res.status(400).json({
                error: {
                    code: 'INVALID_ID',
                    message: 'Invalid bucket ID format',
                    status: 400
                }
            });
        }

        const result = await bucketService.deleteBucket(bucketId, userId);

        if (!result.success) {
            const status = result.code === 'NOT_FOUND' ? 404 : 500;
            return res.status(status).json({
                error: {
                    code: result.code || 'DELETE_FAILED',
                    message: result.error,
                    status
                }
            });
        }

        res.json({
            success: true,
            message: result.message,
            newDefault: result.newDefault
        });
    } catch (error) {
        console.error('[BucketRoutes] Delete error:', error.message);
        res.status(500).json({
            error: {
                code: 'SERVER_ERROR',
                message: 'An error occurred while deleting bucket configuration',
                status: 500
            }
        });
    }
});

module.exports = router;
