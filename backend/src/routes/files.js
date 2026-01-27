/**
 * Files Routes - All file operations via backend
 * - Upload (with compression)
 * - Delete
 * - Rename
 * - Create folder
 * - Move
 * - History (cross-device sync)
 */
const express = require('express');
const multer = require('multer');
const {
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectsCommand,
    CopyObjectCommand,
    ListObjectsV2Command
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { requireAuth } = require('../middleware/authMiddleware');
const bucketService = require('../services/bucketService');
const { createS3Client } = require('../services/s3ClientFactory');
const { processBuffer, isImageType } = require('../services/imageProcessor');
const uploadHistoryService = require('../services/uploadHistoryService');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 * 1024 } });

// Helpers
const sanitize = (name) => (name || 'unnamed')
    .replace(/\.\./g, '').replace(/^\/+/, '').replace(/[<>:"|?*\\]/g, '_')
    .replace(/\s+/g, '-').replace(/[^\w\-_.\/]/g, '').substring(0, 500);

const err = (res, status, code, msg) => res.status(status).json({ error: { code, message: msg, status } });

const getCredentials = async (bucketId, userId) => {
    let result;
    if (bucketId) {
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(bucketId)) {
            return { error: { status: 400, code: 'INVALID_BUCKET_ID', message: 'Invalid bucket ID' } };
        }
        result = await bucketService.getBucketCredentials(bucketId, userId);
    } else {
        result = await bucketService.getDefaultBucket(userId);
    }

    if (!result.success) {
        return { error: { status: result.code === 'NOT_FOUND' ? 404 : 403, code: result.code || 'BUCKET_ERROR', message: result.error } };
    }
    if (!result.bucket && !result.credentials) {
        return { error: { status: 404, code: 'NO_BUCKET', message: 'No bucket configured' } };
    }

    const creds = result.credentials || result.bucket?.credentials;
    if (!creds?.accessKeyId || !creds?.bucketName) {
        return { error: { status: 500, code: 'INVALID_CREDENTIALS', message: 'Incomplete credentials' } };
    }

    return { creds };
};

// POST /upload - Upload file with optional compression
router.post('/upload', requireAuth(), upload.single('file'), async (req, res) => {
    try {
        const { id: userId } = req.user;
        const { file } = req;
        const { bucketId, makePublic, path: targetPath, skipCompression } = req.body;

        if (!file) return err(res, 400, 'NO_FILE', 'No file provided');

        const { creds, error } = await getCredentials(bucketId, userId);
        if (error) return err(res, error.status, error.code, error.message);

        // Process image if applicable
        let processed = { buffer: file.buffer, mimeType: file.mimetype, size: file.size, wasProcessed: false };

        if (isImageType(file.mimetype) && skipCompression !== 'true') {
            processed = await processBuffer(file.buffer, file.mimetype);

            // If processing failed (and we didn't explicitly skip it), fail the upload
            if (processed.error) {
                console.warn('[Files/Upload] Compression failed:', processed.error);
                return err(res, 422, 'COMPRESSION_FAILED', processed.error);
            }
        }

        const s3 = createS3Client(creds, creds.region);
        const basePath = targetPath ? sanitize(targetPath) : '';
        const key = basePath + (basePath && !basePath.endsWith('/') ? '/' : '') + sanitize(file.originalname);

        await s3.send(new PutObjectCommand({
            Bucket: creds.bucketName, Key: key, Body: processed.buffer, ContentType: processed.mimeType,
            ...(makePublic === 'true' && { ACL: 'public-read' })
        }));

        const url = await getSignedUrl(s3, new GetObjectCommand({ Bucket: creds.bucketName, Key: key }), { expiresIn: 3600 });

        // Record upload to history for cross-device sync
        // This is non-blocking - we don't wait for it
        uploadHistoryService.recordUpload(userId, {
            bucketId: bucketId || null,
            key,
            originalName: file.originalname,
            size: processed.size,
            originalSize: file.size,
            mimeType: processed.mimeType,
            shortUrl: url,
            s3Bucket: creds.bucketName,
            s3Region: creds.region,
            compressed: processed.wasProcessed,
        }).catch(e => console.error('[Files/Upload] History record failed:', e.message));

        res.json({
            success: true,
            file: {
                key,
                originalName: file.originalname,
                size: processed.size,
                originalSize: file.size,
                type: processed.mimeType,
                compressed: processed.wasProcessed,
                url,
                s3Bucket: creds.bucketName,
                s3Region: creds.region,
            }
        });
    } catch (e) {
        console.error('[Files/Upload]', e.message);
        if (e.code === 'LIMIT_FILE_SIZE') return err(res, 413, 'FILE_TOO_LARGE', 'Max 5GB');
        err(res, 500, 'UPLOAD_FAILED', 'Upload failed');
    }
});

// POST /delete - Delete files/folders
router.post('/delete', requireAuth(), async (req, res) => {
    try {
        const { id: userId } = req.user;
        const { bucketId, keys } = req.body;

        if (!keys?.length) return err(res, 400, 'NO_KEYS', 'No keys provided');
        if (keys.length > 1000) return err(res, 400, 'TOO_MANY_KEYS', 'Maximum 1000 keys per request');

        const { creds, error } = await getCredentials(bucketId, userId);
        if (error) return err(res, error.status, error.code, error.message);

        const s3 = createS3Client(creds, creds.region);
        const sanitizedKeys = keys.map(k => sanitize(k)).filter(Boolean);

        // For folders, list and delete all contents
        const allKeys = new Set();
        for (const key of sanitizedKeys) {
            if (key.endsWith('/')) {
                let token = null;
                do {
                    const list = await s3.send(new ListObjectsV2Command({
                        Bucket: creds.bucketName, Prefix: key, MaxKeys: 1000,
                        ...(token && { ContinuationToken: token })
                    }));
                    (list.Contents || []).forEach(obj => allKeys.add(obj.Key));
                    token = list.NextContinuationToken;
                } while (token);
            }
            allKeys.add(key);
        }

        if (allKeys.size === 0) return res.json({ success: true, deleted: [] });

        const keysArray = Array.from(allKeys);
        const deleted = [];
        const failed = [];

        // Delete in batches of 1000
        for (let i = 0; i < keysArray.length; i += 1000) {
            const batch = keysArray.slice(i, i + 1000);
            const result = await s3.send(new DeleteObjectsCommand({
                Bucket: creds.bucketName,
                Delete: { Objects: batch.map(Key => ({ Key })), Quiet: false }
            }));
            (result.Deleted || []).forEach(d => deleted.push(d.Key));
            (result.Errors || []).forEach(e => failed.push({ key: e.Key, error: e.Message }));
        }

        // Also remove from upload history (non-blocking)
        if (deleted.length > 0) {
            uploadHistoryService.deleteUploads(userId, deleted)
                .catch(e => console.error('[Files/Delete] History cleanup failed:', e.message));
        }

        res.json({ success: failed.length === 0, deleted, failed });
    } catch (e) {
        console.error('[Files/Delete]', e.message);
        err(res, 500, 'DELETE_FAILED', 'Delete operation failed');
    }
});

// POST /rename - Rename file or folder
router.post('/rename', requireAuth(), async (req, res) => {
    try {
        const { id: userId } = req.user;
        const { bucketId, oldKey, newName } = req.body;

        if (!oldKey || !newName) return err(res, 400, 'MISSING_PARAMS', 'oldKey and newName required');

        const { creds, error } = await getCredentials(bucketId, userId);
        if (error) return err(res, error.status, error.code, error.message);

        const s3 = createS3Client(creds, creds.region);
        const sanitizedNew = sanitize(newName);
        const isFolder = oldKey.endsWith('/');

        // Build new key
        const parts = oldKey.split('/');
        parts[parts.length - (isFolder ? 2 : 1)] = sanitizedNew;
        const newKey = parts.join('/');

        if (oldKey === newKey) return res.json({ success: true, newKey, message: 'Name unchanged' });

        if (isFolder) {
            // List all objects in folder
            const objects = [];
            let token = null;
            do {
                const list = await s3.send(new ListObjectsV2Command({
                    Bucket: creds.bucketName, Prefix: oldKey, MaxKeys: 1000,
                    ...(token && { ContinuationToken: token })
                }));
                objects.push(...(list.Contents || []));
                token = list.NextContinuationToken;
            } while (token);

            // Copy all objects to new location
            for (const obj of objects) {
                const destKey = obj.Key.replace(oldKey, newKey);
                await s3.send(new CopyObjectCommand({
                    Bucket: creds.bucketName,
                    CopySource: encodeURIComponent(`${creds.bucketName}/${obj.Key}`),
                    Key: destKey
                }));
            }

            // Delete old objects
            if (objects.length > 0) {
                await s3.send(new DeleteObjectsCommand({
                    Bucket: creds.bucketName,
                    Delete: { Objects: objects.map(o => ({ Key: o.Key })) }
                }));
            }
        } else {
            // Copy and delete single file
            await s3.send(new CopyObjectCommand({
                Bucket: creds.bucketName,
                CopySource: encodeURIComponent(`${creds.bucketName}/${oldKey}`),
                Key: newKey
            }));
            await s3.send(new DeleteObjectsCommand({
                Bucket: creds.bucketName,
                Delete: { Objects: [{ Key: oldKey }] }
            }));
        }

        res.json({ success: true, newKey });
    } catch (e) {
        console.error('[Files/Rename]', e.message);
        err(res, 500, 'RENAME_FAILED', 'Rename operation failed');
    }
});

// POST /create-folder - Create empty folder
router.post('/create-folder', requireAuth(), async (req, res) => {
    try {
        const { id: userId } = req.user;
        const { bucketId, path } = req.body;

        if (!path) return err(res, 400, 'MISSING_PATH', 'Folder path required');

        const { creds, error } = await getCredentials(bucketId, userId);
        if (error) return err(res, error.status, error.code, error.message);

        const s3 = createS3Client(creds, creds.region);
        const key = sanitize(path).replace(/\/+$/, '') + '/';

        await s3.send(new PutObjectCommand({
            Bucket: creds.bucketName, Key: key, Body: ''
        }));

        res.json({ success: true, key });
    } catch (e) {
        console.error('[Files/CreateFolder]', e.message);
        err(res, 500, 'CREATE_FOLDER_FAILED', 'Create folder failed');
    }
});

// POST /move - Move file to different folder
router.post('/move', requireAuth(), async (req, res) => {
    try {
        const { id: userId } = req.user;
        const { bucketId, sourceKey, destinationFolder } = req.body;

        if (!sourceKey || !destinationFolder) return err(res, 400, 'MISSING_PARAMS', 'sourceKey and destinationFolder required');

        const { creds, error } = await getCredentials(bucketId, userId);
        if (error) return err(res, error.status, error.code, error.message);

        const s3 = createS3Client(creds, creds.region);
        const fileName = sourceKey.split('/').pop();
        const destPath = sanitize(destinationFolder).replace(/\/+$/, '') + '/';
        const newKey = destPath + fileName;

        if (sourceKey === newKey) return res.json({ success: true, newKey, message: 'Already in destination' });

        await s3.send(new CopyObjectCommand({
            Bucket: creds.bucketName,
            CopySource: encodeURIComponent(`${creds.bucketName}/${sourceKey}`),
            Key: newKey
        }));

        await s3.send(new DeleteObjectsCommand({
            Bucket: creds.bucketName,
            Delete: { Objects: [{ Key: sourceKey }] }
        }));

        res.json({ success: true, newKey });
    } catch (e) {
        console.error('[Files/Move]', e.message);
        err(res, 500, 'MOVE_FAILED', 'Move operation failed');
    }
});

// GET /history - Get upload history for cross-device sync
router.get('/history', requireAuth(), async (req, res) => {
    try {
        const { id: userId } = req.user;
        const limit = Math.min(parseInt(req.query.limit) || 50, 100);
        const offset = parseInt(req.query.offset) || 0;

        const result = await uploadHistoryService.getHistory(userId, limit, offset);

        // Always return success with files array (graceful degradation)
        res.json({
            success: true,
            files: result.files || [],
            total: result.total || 0,
            limit,
            offset,
        });
    } catch (e) {
        console.error('[Files/History]', e.message);
        // Return empty array on error - graceful degradation
        res.json({
            success: true,
            files: [],
            total: 0,
            limit: parseInt(req.query.limit) || 50,
            offset: parseInt(req.query.offset) || 0,
        });
    }
});

// DELETE /history/:key - Remove item from history (without deleting from S3)
router.delete('/history/:key(*)', requireAuth(), async (req, res) => {
    try {
        const { id: userId } = req.user;
        const { key } = req.params;

        if (!key) return err(res, 400, 'MISSING_KEY', 'Key is required');

        const result = await uploadHistoryService.deleteUpload(userId, key);

        if (!result.success) {
            return err(res, 500, 'DELETE_HISTORY_FAILED', result.error || 'Failed to delete from history');
        }

        res.json({ success: true });
    } catch (e) {
        console.error('[Files/DeleteHistory]', e.message);
        err(res, 500, 'DELETE_HISTORY_FAILED', 'Failed to delete from history');
    }
});

module.exports = router;
