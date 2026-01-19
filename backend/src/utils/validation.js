/**
 * Validation Schemas
 * Zod schemas for API request validation
 */
const { z } = require('zod');

// Common schemas
const uuidSchema = z.string().uuid();
const s3KeySchema = z.string().min(1).max(1024).refine(
    (val) => !val.includes('..') && !val.startsWith('/'),
    { message: 'Invalid S3 key format' }
);

// File operations
const uploadSchema = z.object({
    bucketId: uuidSchema.optional(),
    makePublic: z.enum(['true', 'false']).optional(),
    path: z.string().max(500).optional()
});

const deleteSchema = z.object({
    bucketId: uuidSchema.optional(),
    keys: z.array(s3KeySchema).min(1).max(1000)
});

const renameSchema = z.object({
    bucketId: uuidSchema.optional(),
    oldKey: s3KeySchema,
    newName: z.string().min(1).max(255).refine(
        (val) => !val.includes('/') && !val.includes('..'),
        { message: 'Invalid name' }
    )
});

const createFolderSchema = z.object({
    bucketId: uuidSchema.optional(),
    path: z.string().min(1).max(500)
});

const moveSchema = z.object({
    bucketId: uuidSchema.optional(),
    sourceKey: s3KeySchema,
    destinationFolder: z.string().min(0).max(500)
});

// Bucket operations
const createBucketSchema = z.object({
    name: z.string().min(1).max(100),
    bucketName: z.string().min(3).max(63).regex(/^[a-z0-9][a-z0-9.-]*[a-z0-9]$/, 'Invalid S3 bucket name'),
    region: z.string().min(1).max(50),
    accessKeyId: z.string().min(16).max(128),
    secretAccessKey: z.string().min(1).max(256),
    isDefault: z.boolean().optional()
});

const updateBucketSchema = createBucketSchema.partial();

// Shortener
const shortenSchema = z.object({
    url: z.string().url().max(2048),
    s3Bucket: z.string().max(63).optional(),
    s3Key: z.string().max(1024).optional(),
    s3Region: z.string().max(50).optional(),
    permanent: z.boolean().optional()
});

/**
 * Validation middleware factory
 */
const validate = (schema) => (req, res, next) => {
    try {
        const parsed = schema.parse(req.body);
        req.validatedBody = parsed;
        next();
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Validation failed',
                    details: error.errors.map(e => ({
                        field: e.path.join('.'),
                        message: e.message
                    }))
                }
            });
        }
        next(error);
    }
};

module.exports = {
    // Schemas
    uploadSchema,
    deleteSchema,
    renameSchema,
    createFolderSchema,
    moveSchema,
    createBucketSchema,
    updateBucketSchema,
    shortenSchema,

    // Middleware
    validate
};
