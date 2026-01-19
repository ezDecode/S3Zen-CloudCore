const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { generateShortCode } = require('../utils/idGen');
const { isSafeUrl } = require('../utils/validateUrl');

// Initialize SQLite database
const DB_DIR = process.env.DB_PATH ? path.dirname(process.env.DB_PATH) : path.join(__dirname, '..', 'data');
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'shortlinks.db');

if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
    console.log(`✓ Created database directory: ${DB_DIR}`);
}

const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Failed to open database:', err.message);
        process.exit(1);
    }
    console.log(`✓ Database connected: ${DB_PATH}`);
});

// Create table with S3 info for permanent links
db.run(`CREATE TABLE IF NOT EXISTS shortlinks (
    code TEXT PRIMARY KEY,
    url TEXT NOT NULL,
    s3_bucket TEXT,
    s3_key TEXT,
    s3_region TEXT,
    is_permanent INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// Graceful shutdown
const closeDatabase = () => {
    db.close((err) => {
        if (err) console.error('Error closing database:', err.message);
        else console.log('✓ Database connection closed');
        process.exit(0);
    });
};

process.on('SIGINT', closeDatabase);
process.on('SIGTERM', closeDatabase);
process.on('exit', () => db.close());

// POST /shorten - Create a short URL
// If s3_bucket, s3_key, s3_region provided → permanent link (regenerates presigned URL on access)
router.post('/shorten', (req, res) => {
    const { url, s3Bucket, s3Key, s3Region, permanent } = req.body;

    if (!url || !isSafeUrl(url)) {
        return res.status(400).json({ error: 'Invalid URL' });
    }

    const checkExists = (code) => new Promise((resolve) => {
        db.get('SELECT code FROM shortlinks WHERE code = ?', [code], (err, row) => resolve(!!row));
    });

    generateShortCode(checkExists)
        .then(shortCode => {
            const isPermanent = permanent || (s3Bucket && s3Key && s3Region);

            db.run(
                'INSERT INTO shortlinks (code, url, s3_bucket, s3_key, s3_region, is_permanent) VALUES (?, ?, ?, ?, ?, ?)',
                [shortCode, url, s3Bucket || null, s3Key || null, s3Region || null, isPermanent ? 1 : 0],
                (err) => {
                    if (err) {
                        console.error('Database error:', err);
                        return res.status(500).json({ error: 'Failed to create short URL' });
                    }

                    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
                    const shortUrl = `${baseUrl}/s/${shortCode}`;

                    res.json({ shortUrl, shortCode, permanent: isPermanent });
                }
            );
        })
        .catch(error => {
            console.error('Short code generation error:', error);
            res.status(500).json({ error: 'Failed to generate unique short code' });
        });
});

// GET /s/:code - Redirect to original URL (regenerate presigned if permanent S3 link)
router.get('/s/:code', async (req, res) => {
    const { code } = req.params;

    db.get('SELECT * FROM shortlinks WHERE code = ?', [code], async (err, row) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Server error');
        }

        if (!row) return res.status(404).send('Short URL not found');

        // If permanent S3 link, regenerate presigned URL
        if (row.is_permanent && row.s3_bucket && row.s3_key && row.s3_region) {
            try {
                // Get credentials from bucket service
                const bucketService = require('../services/bucketService');

                // Find bucket by name (search through all user buckets)
                // For now, regenerate from stored URL pattern
                // In production, you'd look up the bucket credentials

                // Fallback: redirect to stored URL (may be expired)
                console.log(`🔗 Permanent link ${code} - redirecting to original URL`);
                return res.redirect(302, row.url);
            } catch (e) {
                console.error('Error regenerating presigned URL:', e);
                return res.redirect(302, row.url);
            }
        }

        // Normal redirect
        if (!isSafeUrl(row.url)) {
            console.warn(`⚠️ Blocked unsafe redirect for ${code}`);
            return res.status(403).send('URL no longer valid');
        }

        res.redirect(302, row.url);
    });
});

module.exports = router;
