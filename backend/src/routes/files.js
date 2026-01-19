/**
 * Files Routes - Upload with compression and S3 storage
 */
const express = require('express');
const multer = require('multer');
const { PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { requireAuth } = require('../middleware/authMiddleware');
const bucketService = require('../services/bucketService');
const { createS3Client } = require('../services/s3ClientFactory');
const { processBuffer, isImageType } = require('../services/imageProcessor');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 * 1024 } });

const sanitize = (name) => (name || 'unnamed')
    .replace(/\.\./g, '').replace(/^\/+/, '').replace(/[<>:"|?*\\]/g, '_')
    .replace(/\s+/g, '-').replace(/[^\w\-_.]/g, '').substring(0, 200);

const genKey = (uid, name) => `uploads/${uid}/${new Date().toISOString().replace(/[:.]/g, '-')}-${sanitize(name)}`;

const err = (res, status, code, msg) => res.status(status).json({ error: { code, message: msg, status } });

router.post('/upload', requireAuth(), upload.single('file'), async (req, res) => {
    try {
        const { id: userId } = req.user;
        const { file } = req;
        const { bucketId, makePublic } = req.body;

        if (!file) return err(res, 400, 'NO_FILE', 'No file provided');

        // Get bucket
        let result;
        if (bucketId) {
            if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(bucketId)) {
                return err(res, 400, 'INVALID_BUCKET_ID', 'Invalid bucket ID');
            }
            result = await bucketService.getBucketCredentials(bucketId, userId);
        } else {
            result = await bucketService.getDefaultBucket(userId);
        }

        if (!result.success) return err(res, result.code === 'NOT_FOUND' ? 404 : 403, result.code || 'BUCKET_ERROR', result.error);
        if (!result.bucket && !result.credentials) return err(res, 404, 'NO_BUCKET', 'No bucket configured');

        const creds = result.credentials || result.bucket?.credentials;
        if (!creds?.accessKeyId || !creds?.bucketName) return err(res, 500, 'INVALID_CREDENTIALS', 'Incomplete credentials');

        // Process image
        let processed = { buffer: file.buffer, mimeType: file.mimetype, size: file.size, wasProcessed: false };
        if (isImageType(file.mimetype)) {
            processed = await processBuffer(file.buffer, file.mimetype);
        }

        // Upload to S3
        const s3 = createS3Client(creds, creds.region);
        const key = genKey(userId, file.originalname);

        await s3.send(new PutObjectCommand({
            Bucket: creds.bucketName, Key: key, Body: processed.buffer, ContentType: processed.mimeType,
            ...(makePublic === 'true' && { ACL: 'public-read' })
        }));

        const url = await getSignedUrl(s3, new GetObjectCommand({ Bucket: creds.bucketName, Key: key }), { expiresIn: 3600 });

        // Short URL with S3 info for permanent access
        let shortUrl = null;
        try {
            const r = await fetch(`http://localhost:${process.env.PORT || 3000}/shorten`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url,
                    s3Bucket: creds.bucketName,
                    s3Key: key,
                    s3Region: creds.region,
                    permanent: true
                })
            });
            if (r.ok) shortUrl = (await r.json()).shortUrl;
        } catch { }

        res.json({
            success: true,
            file: {
                key, originalName: file.originalname, size: processed.size, originalSize: file.size,
                type: processed.mimeType, compressed: processed.wasProcessed, url, shortUrl
            }
        });
    } catch (e) {
        console.error('[Files]', e.message);
        if (e.code === 'LIMIT_FILE_SIZE') return err(res, 413, 'FILE_TOO_LARGE', 'Max 5GB');
        err(res, 500, 'UPLOAD_FAILED', 'Upload failed');
    }
});

module.exports = router;
