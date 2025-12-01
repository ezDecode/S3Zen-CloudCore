const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const { generateShortCode } = require('../utils/idGen');
const { isSafeUrl } = require('../utils/validateUrl');

// Initialize SQLite database
// Use DB_PATH from environment or default to ./data/shortlinks.db
const DB_DIR = process.env.DB_PATH
    ? path.dirname(process.env.DB_PATH)
    : path.join(__dirname, '..', 'data');

const DB_PATH = process.env.DB_PATH
    || path.join(__dirname, '..', 'data', 'shortlinks.db');

// Ensure database directory exists
if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
    console.log(`✓ Created database directory: ${DB_DIR}`);
}

const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Failed to open database:', err.message);
        console.error('Database path:', DB_PATH);
        process.exit(1);
    }
    console.log(`✓ Database connected: ${DB_PATH}`);
});

// Create table if not exists
db.run(`CREATE TABLE IF NOT EXISTS shortlinks (
    code TEXT PRIMARY KEY,
    url TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// Graceful shutdown handler
const closeDatabase = () => {
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err.message);
        } else {
            console.log('✓ Database connection closed');
        }
        process.exit(0);
    });
};

// Handle shutdown signals
process.on('SIGINT', closeDatabase);
process.on('SIGTERM', closeDatabase);
process.on('exit', () => {
    db.close();
});

// POST /shorten - Create a short URL
router.post('/shorten', (req, res) => {
    const { longUrl, url } = req.body;
    const urlToShorten = longUrl || url; // Support both 'longUrl' and 'url' field names

    console.log('📝 Shorten request:', {
        hasLongUrl: !!longUrl,
        hasUrl: !!url,
        urlLength: urlToShorten ? urlToShorten.length : 0
    });

    // Validate URL
    if (!urlToShorten || !isSafeUrl(urlToShorten)) {
        console.log('❌ URL validation failed for:', urlToShorten?.substring(0, 100));
        return res.status(400).json({ error: 'Invalid URL' });
    }

    // Generate short code
    const shortCode = generateShortCode();

    // Save to database
    db.run(
        'INSERT INTO shortlinks (code, url) VALUES (?, ?)',
        [shortCode, urlToShorten],
        (err) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Failed to create short URL' });
            }

            const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
            const shortUrl = `${baseUrl}/s/${shortCode}`;
            console.log('✅ Created short URL:', shortUrl);

            res.json({
                shortUrl,
                shortCode
            });
        }
    );
});

// GET /s/:code - Redirect to original URL
router.get('/s/:code', (req, res) => {
    const { code } = req.params;

    db.get('SELECT url FROM shortlinks WHERE code = ?', [code], (err, row) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Server error');
        }

        if (!row) {
            return res.status(404).send('Short URL not found');
        }

        // Security: Re-validate URL before redirect to prevent open redirect
        if (!isSafeUrl(row.url)) {
            console.warn(`⚠️ Blocked unsafe redirect for ${code}`);
            return res.status(403).send('URL no longer valid');
        }

        console.log(`🔗 Redirecting ${code} to ${row.url.substring(0, 50)}...`);
        // Redirect to the original URL
        res.redirect(302, row.url);
    });
});

module.exports = router;
