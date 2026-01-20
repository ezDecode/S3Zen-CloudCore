const { getAdminClient, createUserClient } = require('../config/supabase');
const { encryptCredentials, decryptCredentials } = require('./encryptionService');

const TABLE_NAME = 'bucket_configurations';

const dbLogger = {
    info: (message, data = {}) => {
        console.log(`[BucketDB] ${message}`, sanitizeData(data));
    },
    error: (message, data = {}) => {
        console.error(`[BucketDB] ERROR: ${message}`, sanitizeData(data));
    },
    warn: (message, data = {}) => {
        console.warn(`[BucketDB] WARN: ${message}`, sanitizeData(data));
    }
};

function sanitizeData(data) {
    if (!data || typeof data !== 'object') return data;

    const sensitiveKeys = [
        'accessKeyId', 'secretAccessKey', 'sessionToken',
        'encrypted_credentials', 'credentials', 'iv', 'ciphertext'
    ];

    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
        if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk.toLowerCase()))) {
            sanitized[key] = '[REDACTED]';
        } else if (typeof value === 'object' && value !== null) {
            sanitized[key] = sanitizeData(value);
        } else {
            sanitized[key] = value;
        }
    }
    return sanitized;
}

function formatBucketMetadata(record) {
    return {
        id: record.id,
        displayName: record.display_name,
        bucketName: record.bucket_name,
        region: record.region,
        isDefault: record.is_default,
        createdAt: record.created_at,
        updatedAt: record.updated_at
    };
}

async function createBucket(userId, data) {
    try {
        const {
            accessKeyId,
            secretAccessKey,
            sessionToken,
            region,
            bucketName,
            displayName,
            isDefault = false
        } = data;

        const { ciphertext, iv } = encryptCredentials({
            accessKeyId,
            secretAccessKey,
            sessionToken: sessionToken || null
        });

        const adminClient = getAdminClient();
        const { data: bucket, error } = await adminClient
            .from(TABLE_NAME)
            .insert({
                user_id: userId,
                encrypted_credentials: ciphertext,
                iv,
                region,
                bucket_name: bucketName,
                display_name: displayName,
                is_default: isDefault
            })
            .select()
            .single();

        if (error) {
            dbLogger.error('Failed to create bucket', { error: error.message, code: error.code, details: error.details });

            if (error.code === '23505') {
                if (error.message.includes('unique_user_bucket')) {
                    return { success: false, error: 'A bucket with this name already exists', code: 'DUPLICATE_BUCKET' };
                }
                if (error.message.includes('unique_user_display_name')) {
                    return { success: false, error: 'A bucket with this display name already exists', code: 'DUPLICATE_NAME' };
                }
            }

            // Return more specific error message
            return { success: false, error: error.message || 'Failed to create bucket configuration' };
        }

        dbLogger.info('Bucket created', { bucketId: bucket.id, userId });

        return {
            success: true,
            bucket: formatBucketMetadata(bucket)
        };
    } catch (error) {
        dbLogger.error('Create bucket error', { error: error.message });
        return { success: false, error: error.message };
    }
}

async function getBuckets(userId) {
    try {
        const adminClient = getAdminClient();
        const { data: buckets, error } = await adminClient
            .from(TABLE_NAME)
            .select('id, display_name, bucket_name, region, is_default, created_at, updated_at')
            .eq('user_id', userId)
            .order('is_default', { ascending: false })
            .order('created_at', { ascending: false });

        if (error) {
            dbLogger.error('Failed to get buckets', { error: error.message, userId });
            return { success: false, error: 'Failed to retrieve bucket configurations' };
        }

        dbLogger.info('Buckets retrieved', { userId, count: buckets.length });

        return {
            success: true,
            buckets: buckets.map(formatBucketMetadata)
        };
    } catch (error) {
        dbLogger.error('Get buckets error', { error: error.message });
        return { success: false, error: error.message };
    }
}

async function getBucketById(bucketId, userId) {
    try {
        const adminClient = getAdminClient();
        const { data: bucket, error } = await adminClient
            .from(TABLE_NAME)
            .select('*')
            .eq('id', bucketId)
            .eq('user_id', userId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return { success: false, error: 'Bucket not found', code: 'NOT_FOUND' };
            }
            dbLogger.error('Failed to get bucket', { error: error.message, bucketId });
            return { success: false, error: 'Failed to retrieve bucket configuration' };
        }

        return {
            success: true,
            bucket
        };
    } catch (error) {
        dbLogger.error('Get bucket by ID error', { error: error.message });
        return { success: false, error: error.message };
    }
}

async function getBucketCredentials(bucketId, userId) {
    try {
        const result = await getBucketById(bucketId, userId);

        if (!result.success) {
            return result;
        }

        const bucket = result.bucket;

        const credentials = decryptCredentials(
            bucket.encrypted_credentials,
            bucket.iv
        );

        dbLogger.info('Credentials retrieved', { bucketId, userId });

        return {
            success: true,
            credentials: {
                ...credentials,
                region: bucket.region,
                bucketName: bucket.bucket_name
            }
        };
    } catch (error) {
        dbLogger.error('Get credentials error', { error: error.message });
        return { success: false, error: 'Failed to decrypt credentials' };
    }
}

async function updateBucket(bucketId, userId, updates) {
    try {
        const existing = await getBucketById(bucketId, userId);
        if (!existing.success) {
            return existing;
        }

        const updateData = {};

        if (updates.displayName !== undefined) {
            updateData.display_name = updates.displayName;
        }
        if (updates.region !== undefined) {
            updateData.region = updates.region;
        }
        if (updates.isDefault !== undefined) {
            updateData.is_default = updates.isDefault;
        }

        if (updates.accessKeyId || updates.secretAccessKey) {
            const currentCredentials = decryptCredentials(
                existing.bucket.encrypted_credentials,
                existing.bucket.iv
            );

            const newCredentials = {
                accessKeyId: updates.accessKeyId || currentCredentials.accessKeyId,
                secretAccessKey: updates.secretAccessKey || currentCredentials.secretAccessKey,
                sessionToken: updates.sessionToken !== undefined
                    ? updates.sessionToken
                    : currentCredentials.sessionToken
            };

            const { ciphertext, iv } = encryptCredentials(newCredentials);
            updateData.encrypted_credentials = ciphertext;
            updateData.iv = iv;
        }

        if (Object.keys(updateData).length === 0) {
            return {
                success: true,
                bucket: formatBucketMetadata(existing.bucket)
            };
        }

        const adminClient = getAdminClient();
        const { data: bucket, error } = await adminClient
            .from(TABLE_NAME)
            .update(updateData)
            .eq('id', bucketId)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) {
            dbLogger.error('Failed to update bucket', { error: error.message, bucketId });

            if (error.code === '23505') {
                return { success: false, error: 'Display name already exists', code: 'DUPLICATE_NAME' };
            }

            return { success: false, error: 'Failed to update bucket configuration' };
        }

        dbLogger.info('Bucket updated', { bucketId, userId });

        return {
            success: true,
            bucket: formatBucketMetadata(bucket)
        };
    } catch (error) {
        dbLogger.error('Update bucket error', { error: error.message });
        return { success: false, error: error.message };
    }
}

async function deleteBucket(bucketId, userId) {
    try {
        const existing = await getBucketById(bucketId, userId);
        if (!existing.success) {
            return existing;
        }

        const wasDefault = existing.bucket.is_default;

        const adminClient = getAdminClient();
        const { error } = await adminClient
            .from(TABLE_NAME)
            .delete()
            .eq('id', bucketId)
            .eq('user_id', userId);

        if (error) {
            dbLogger.error('Failed to delete bucket', { error: error.message, bucketId });
            return { success: false, error: 'Failed to delete bucket configuration' };
        }

        dbLogger.info('Bucket deleted', { bucketId, userId, wasDefault });

        let newDefault = null;
        if (wasDefault) {
            const { data: buckets } = await adminClient
                .from(TABLE_NAME)
                .select('id, display_name, is_default')
                .eq('user_id', userId)
                .eq('is_default', true)
                .limit(1);

            if (buckets && buckets.length > 0) {
                newDefault = {
                    id: buckets[0].id,
                    displayName: buckets[0].display_name
                };
            }
        }

        return {
            success: true,
            message: 'Bucket configuration deleted',
            newDefault
        };
    } catch (error) {
        dbLogger.error('Delete bucket error', { error: error.message });
        return { success: false, error: error.message };
    }
}

async function getDefaultBucket(userId) {
    try {
        const adminClient = getAdminClient();
        const { data: bucket, error } = await adminClient
            .from(TABLE_NAME)
            .select('*')
            .eq('user_id', userId)
            .eq('is_default', true)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                const { data: anyBuckets } = await adminClient
                    .from(TABLE_NAME)
                    .select('id')
                    .eq('user_id', userId)
                    .limit(1);

                if (!anyBuckets || anyBuckets.length === 0) {
                    return {
                        success: true,
                        bucket: null,
                        message: 'No bucket configurations found'
                    };
                }

                return {
                    success: true,
                    bucket: null,
                    message: 'No default bucket set'
                };
            }
            dbLogger.error('Failed to get default bucket', { error: error.message, userId });
            return { success: false, error: 'Failed to retrieve default bucket' };
        }

        const credentials = decryptCredentials(
            bucket.encrypted_credentials,
            bucket.iv
        );

        dbLogger.info('Default bucket retrieved', { userId, bucketId: bucket.id });

        return {
            success: true,
            bucket: {
                ...formatBucketMetadata(bucket),
                credentials: {
                    ...credentials,
                    region: bucket.region,
                    bucketName: bucket.bucket_name
                }
            }
        };
    } catch (error) {
        dbLogger.error('Get default bucket error', { error: error.message });
        return { success: false, error: error.message };
    }
}

async function setDefaultBucket(bucketId, userId) {
    return updateBucket(bucketId, userId, { isDefault: true });
}

async function bucketNameExists(userId, bucketName) {
    try {
        const adminClient = getAdminClient();
        const { data, error } = await adminClient
            .from(TABLE_NAME)
            .select('id')
            .eq('user_id', userId)
            .eq('bucket_name', bucketName)
            .limit(1);

        if (error) {
            dbLogger.error('Check bucket name error', { error: error.message });
            return false;
        }

        return data && data.length > 0;
    } catch (error) {
        dbLogger.error('Bucket name exists error', { error: error.message });
        return false;
    }
}

async function getBucketCount(userId) {
    try {
        const adminClient = getAdminClient();
        const { count, error } = await adminClient
            .from(TABLE_NAME)
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

        if (error) {
            dbLogger.error('Get bucket count error', { error: error.message });
            return 0;
        }

        return count || 0;
    } catch (error) {
        dbLogger.error('Bucket count error', { error: error.message });
        return 0;
    }
}

module.exports = {
    createBucket,
    getBuckets,
    getBucketById,
    getBucketCredentials,
    updateBucket,
    deleteBucket,
    getDefaultBucket,
    setDefaultBucket,
    bucketNameExists,
    getBucketCount,
    formatBucketMetadata
};
