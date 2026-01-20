/**
 * Shortener Routes
 * URL shortening with Supabase storage (SQLite fallback)
 */
const express = require('express');
const router = express.Router();
const { isSafeUrl } = require('../utils/validateUrl');
const { validate, shortenSchema } = require('../utils/validation');

// Try to use Supabase service, fallback to SQLite
let shortlinksService;
let usingSQLite = false;

try {
    shortlinksService = require('../services/shortlinksService');
    console.log('✓ Shortlinks: Using Supabase');
} catch (error) {
    console.warn('⚠ Shortlinks: Supabase unavailable, using SQLite fallback');
    usingSQLite = true;
}

// SQLite fallback setup
let db = null;
if (usingSQLite) {
    const sqlite3 = require('sqlite3').verbose();
    const path = require('path');
    const fs = require('fs');
    const { generateShortCode } = require('../utils/idGen');

    const DB_DIR = process.env.DB_PATH ? path.dirname(process.env.DB_PATH) : path.join(__dirname, '..', 'data');
    const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'shortlinks.db');

    if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
    }

    db = new sqlite3.Database(DB_PATH);
    db.run(`CREATE TABLE IF NOT EXISTS shortlinks (
        code TEXT PRIMARY KEY,
        url TEXT NOT NULL,
        s3_bucket TEXT,
        s3_key TEXT,
        s3_region TEXT,
        is_permanent INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // SQLite implementation
    shortlinksService = {
        createShortlink: async (data) => {
            const { url, s3Bucket, s3Key, s3Region, permanent } = data;

            return new Promise((resolve) => {
                const checkExists = (code) => new Promise((res) => {
                    db.get('SELECT code FROM shortlinks WHERE code = ?', [code], (err, row) => res(!!row));
                });

                generateShortCode(checkExists).then(code => {
                    db.run(
                        'INSERT INTO shortlinks (code, url, s3_bucket, s3_key, s3_region, is_permanent) VALUES (?, ?, ?, ?, ?, ?)',
                        [code, url, s3Bucket || null, s3Key || null, s3Region || null, permanent ? 1 : 0],
                        (err) => {
                            if (err) {
                                resolve({ success: false, error: err.message });
                            } else {
                                const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
                                resolve({ success: true, shortUrl: `${baseUrl}/s/${code}`, shortCode: code });
                            }
                        }
                    );
                });
            });
        },

        getShortlink: async (code) => {
            return new Promise((resolve) => {
                db.get('SELECT * FROM shortlinks WHERE code = ?', [code], (err, row) => {
                    if (err || !row) resolve({ success: false, error: 'Not found' });
                    else resolve({ success: true, link: row });
                });
            });
        }
    };
}

// POST /shorten - Create short URL
router.post('/shorten', validate(shortenSchema), async (req, res) => {
    const { url, s3Bucket, s3Key, s3Region, permanent } = req.validatedBody;

    if (!isSafeUrl(url)) {
        return res.status(400).json({ error: 'Invalid URL' });
    }

    const result = await shortlinksService.createShortlink({
        url, s3Bucket, s3Key, s3Region, permanent
    });

    if (!result.success) {
        return res.status(500).json({ error: result.error || 'Failed to create short URL' });
    }

    res.json({ shortUrl: result.shortUrl, shortCode: result.shortCode, permanent: result.permanent });
});

// GET /api/shortlinks/:code - Get shortlink metadata (for LinkButton component)
router.get('/api/shortlinks/:code', async (req, res) => {
    const { code } = req.params;

    const result = await shortlinksService.getShortlink(code);

    if (!result.success) {
        return res.status(404).json({ error: 'Shortlink not found' });
    }

    const link = result.link;
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

    // Compute AWS S3 URL from stored metadata
    let awsUrl = null;
    if (link.s3_bucket && link.s3_key) {
        const region = link.s3_region || 'us-east-1';
        awsUrl = `https://${link.s3_bucket}.s3.${region}.amazonaws.com/${link.s3_key}`;
    }

    res.json({
        shortUrl: `${baseUrl}/s/${code}`,
        shortCode: code,
        awsUrl,
        s3Bucket: link.s3_bucket || null,
        s3Key: link.s3_key || null,
        s3Region: link.s3_region || null,
        isPermanent: link.is_permanent,
        createdAt: link.created_at
    });
});

// GET /s/:code - Redirect to original URL
router.get('/s/:code', async (req, res) => {
    const { code } = req.params;

    const result = await shortlinksService.getShortlink(code);

    if (!result.success) {
        return res.status(404).send('Short URL not found');
    }

    const link = result.link;

    // Validate URL before redirect
    if (!isSafeUrl(link.url)) {
        console.warn(`⚠️ Blocked unsafe redirect for ${code}`);
        return res.status(403).send('URL no longer valid');
    }

    res.redirect(302, link.url);
});

module.exports = router;
