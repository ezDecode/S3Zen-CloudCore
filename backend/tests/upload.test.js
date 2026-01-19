/**
 * Upload Route Tests
 */
import { describe, it, expect, beforeAll, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import path from 'path';

// Mock dependencies
vi.mock('../services/bucketService', () => ({
    default: {
        getDefaultBucket: vi.fn(),
        getBucketCredentials: vi.fn()
    }
}));

vi.mock('../services/s3ClientFactory', () => ({
    createS3Client: vi.fn(() => ({
        send: vi.fn().mockResolvedValue({})
    }))
}));

vi.mock('../services/imageProcessor', () => ({
    isImageType: vi.fn((type) => type?.startsWith('image/')),
    processBuffer: vi.fn((buffer, mimeType) => ({
        buffer, mimeType, size: buffer.length, wasProcessed: true
    }))
}));

vi.mock('@aws-sdk/s3-request-presigner', () => ({
    getSignedUrl: vi.fn().mockResolvedValue('https://s3.example.com/signed-url')
}));

vi.mock('../middleware/authMiddleware', () => ({
    requireAuth: () => (req, res, next) => {
        req.user = { id: 'test-user-123' };
        next();
    }
}));

// Mock fetch for shortener
global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ shortUrl: 'http://localhost:3000/s/abc123' })
});

describe('POST /api/files/upload', () => {
    let app;

    beforeAll(async () => {
        app = express();
        app.use(express.json());
        const filesRouter = (await import('../routes/files.js')).default;
        app.use('/api/files', filesRouter);
    });

    it('returns 400 when no file provided', async () => {
        const res = await request(app)
            .post('/api/files/upload')
            .set('Authorization', 'Bearer test-token');

        expect(res.status).toBe(400);
        expect(res.body.error.code).toBe('NO_FILE');
    });

    it('returns 400 for invalid bucket ID format', async () => {
        const res = await request(app)
            .post('/api/files/upload')
            .set('Authorization', 'Bearer test-token')
            .field('bucketId', 'invalid-uuid')
            .attach('file', Buffer.from('test'), 'test.txt');

        expect(res.status).toBe(400);
        expect(res.body.error.code).toBe('INVALID_BUCKET_ID');
    });

    it('uploads file successfully with default bucket', async () => {
        const bucketService = (await import('../services/bucketService')).default;
        bucketService.getDefaultBucket.mockResolvedValue({
            success: true,
            bucket: {
                credentials: {
                    accessKeyId: 'AKIATEST',
                    secretAccessKey: 'secret',
                    bucketName: 'test-bucket',
                    region: 'us-east-1'
                }
            }
        });

        const res = await request(app)
            .post('/api/files/upload')
            .set('Authorization', 'Bearer test-token')
            .attach('file', Buffer.from('test content'), 'test.txt');

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.file).toHaveProperty('key');
        expect(res.body.file).toHaveProperty('url');
        expect(res.body.file.originalName).toBe('test.txt');
    });

    it('processes and compresses images', async () => {
        const bucketService = (await import('../services/bucketService')).default;
        const imageProcessor = (await import('../services/imageProcessor'));

        bucketService.getDefaultBucket.mockResolvedValue({
            success: true,
            bucket: {
                credentials: {
                    accessKeyId: 'AKIATEST',
                    secretAccessKey: 'secret',
                    bucketName: 'test-bucket',
                    region: 'us-east-1'
                }
            }
        });

        const res = await request(app)
            .post('/api/files/upload')
            .set('Authorization', 'Bearer test-token')
            .attach('file', Buffer.from('fake image data'), {
                filename: 'photo.jpg',
                contentType: 'image/jpeg'
            });

        expect(res.status).toBe(200);
        expect(imageProcessor.isImageType).toHaveBeenCalledWith('image/jpeg');
        expect(res.body.file.compressed).toBe(true);
    });

    it('returns 404 when no bucket configured', async () => {
        const bucketService = (await import('../services/bucketService')).default;
        bucketService.getDefaultBucket.mockResolvedValue({
            success: true,
            bucket: null
        });

        const res = await request(app)
            .post('/api/files/upload')
            .set('Authorization', 'Bearer test-token')
            .attach('file', Buffer.from('test'), 'test.txt');

        expect(res.status).toBe(404);
        expect(res.body.error.code).toBe('NO_BUCKET');
    });

    it('returns 403 for bucket ownership failure', async () => {
        const bucketService = (await import('../services/bucketService')).default;
        bucketService.getBucketCredentials.mockResolvedValue({
            success: false,
            code: 'FORBIDDEN',
            error: 'Not your bucket'
        });

        const res = await request(app)
            .post('/api/files/upload')
            .set('Authorization', 'Bearer test-token')
            .field('bucketId', '12345678-1234-1234-1234-123456789012')
            .attach('file', Buffer.from('test'), 'test.txt');

        expect(res.status).toBe(403);
    });
});
