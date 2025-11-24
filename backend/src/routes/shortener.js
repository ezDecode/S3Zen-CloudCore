const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { generateShortCode } = require('../utils/idGen');
const { isSafeUrl } = require('../utils/validateUrl');

// Initialize SQLite database
const DB_PATH = path.join(__dirname, '..', 'db', 'shortlinks.db');
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Failed to open database:', err.message);
        process.exit(1);
    }
});

// Create table if not exists
db.run(`CREATE TABLE IF NOT EXISTS shortlinks (
    code TEXT PRIMARY KEY,
    url TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// POST /shorten - Create a short URL
router.post('/shorten', (req, res) => {
    const { longUrl } = req.body;

    // Validate URL
    if (!longUrl || !isSafeUrl(longUrl)) {
        return res.status(400).json({ error: 'Invalid URL' });
    }

    // Generate short code
    const shortCode = generateShortCode();

    // Save to database
    db.run(
        'INSERT INTO shortlinks (code, url) VALUES (?, ?)',
        [shortCode, longUrl],
        (err) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Failed to create short URL' });
            }

            const baseUrl = process.env.BASE_URL || 'http://localhost:3001';
            res.json({
                shortUrl: `${baseUrl}/s/${shortCode}`,
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

        // Redirect to the original URL
        res.redirect(302, row.url);
    });
});

module.exports = router;
