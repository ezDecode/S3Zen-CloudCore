const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const shortenerRouter = require('./routes/shortener');
app.use('/', shortenerRouter);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`✓ URL Shortener running on port ${PORT}`);
    console.log(`✓ Base URL: ${process.env.BASE_URL || `http://localhost:${PORT}`}`);
});
