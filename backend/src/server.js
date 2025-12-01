const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const app = express();

// Security: HTTPS enforcement in production
if (process.env.NODE_ENV === 'production') {
    app.use((req, res, next) => {
        if (req.header('x-forwarded-proto') !== 'https') {
            res.redirect(`https://${req.header('host')}${req.url}`);
        } else {
            next();
        }
    });
}

// Security: HTTP headers
app.use(helmet());

// Security: CORS with whitelist
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
    origin: (origin, callback) => {
        // SECURITY: In production, require API key for origin-less requests
        // In development, allow origin-less requests for testing
        if (!origin) {
            if (process.env.NODE_ENV === 'production') {
                // Check for API key in header
                const apiKey = callback.req?.headers['x-api-key'];
                if (apiKey && apiKey === process.env.API_KEY) {
                    return callback(null, true);
                }
                return callback(new Error('API key required for origin-less requests'));
            }
            return callback(null, true); // Allow in development
        }
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST'],
    optionsSuccessStatus: 200
}));

// Security: Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per window
    message: { error: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(limiter);

// Security: Limit request body size
app.use(express.json({ limit: '10kb' }));

// Routes
const shortenerRouter = require('./routes/shortener');
app.use('/', shortenerRouter);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✓ URL Shortener running on port ${PORT}`);
    console.log(`✓ Base URL: ${process.env.BASE_URL || `http://localhost:${PORT}`}`);
});
