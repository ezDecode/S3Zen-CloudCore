const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Import services and middleware
const { validateConfiguration: validateEncryption } = require('./services/encryptionService');
const { validateConfig: validateSupabase, testConnection } = require('./config/supabase');

const app = express();

// ============================================================================
// Startup Validation
// ============================================================================
// Validate required configurations on startup
const startupValidation = () => {
    console.log('🔍 Validating configuration...');
    
    // Validate encryption configuration
    const encryptionResult = validateEncryption();
    if (!encryptionResult.success) {
        console.error('❌ Encryption configuration error:', encryptionResult.error);
        console.error('   Generate a key with: npm run generate:key');
        process.exit(1);
    }
    console.log('✓ Encryption configuration valid');

    // Validate Supabase configuration
    try {
        validateSupabase();
        console.log('✓ Supabase configuration valid');
    } catch (error) {
        console.error('❌ Supabase configuration error:', error.message);
        console.error('   Check your .env file for SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY');
        process.exit(1);
    }
};

// Run validation
startupValidation();

// ============================================================================
// Security: HTTPS Enforcement
// ============================================================================
if (process.env.NODE_ENV === 'production') {
    app.use((req, res, next) => {
        if (req.header('x-forwarded-proto') !== 'https') {
            res.redirect(`https://${req.header('host')}${req.url}`);
        } else {
            next();
        }
    });
}

// ============================================================================
// Security: HTTP Headers
// ============================================================================
app.use(helmet());

// ============================================================================
// Security: CORS Configuration
// ============================================================================
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) {
            if (process.env.NODE_ENV === 'production') {
                // In production, require API key for origin-less requests
                // Note: callback doesn't have access to req, so we'll handle this differently
                // For now, allow origin-less requests and validate API key in middleware
                return callback(null, true);
            }
            return callback(null, true);
        }
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
    optionsSuccessStatus: 200
}));

// ============================================================================
// Security: Rate Limiting
// ============================================================================
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // requests per window
    message: { 
        error: {
            code: 'RATE_LIMITED',
            message: 'Too many requests, please try again later',
            status: 429
        }
    },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(limiter);

// More restrictive rate limiting for auth-related endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30, // 30 attempts per window
    message: {
        error: {
            code: 'RATE_LIMITED',
            message: 'Too many authentication attempts, please try again later',
            status: 429
        }
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// ============================================================================
// Security: Request Body Size Limit
// ============================================================================
app.use(express.json({ limit: '10kb' }));

// ============================================================================
// Routes
// ============================================================================

// URL Shortener routes (existing)
const shortenerRouter = require('./routes/shortener');
app.use('/', shortenerRouter);

// Bucket management routes (new)
const bucketsRouter = require('./routes/buckets');
app.use('/api/buckets', authLimiter, bucketsRouter);

// ============================================================================
// Health Check
// ============================================================================
app.get('/health', async (req, res) => {
    const health = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    };

    // Optionally check database connection
    if (req.query.detailed === 'true') {
        const dbStatus = await testConnection();
        health.database = dbStatus.success ? 'connected' : 'disconnected';
        if (!dbStatus.success) {
            health.status = 'degraded';
        }
    }

    res.json(health);
});

// ============================================================================
// 404 Handler
// ============================================================================
app.use((req, res) => {
    res.status(404).json({
        error: {
            code: 'NOT_FOUND',
            message: 'Endpoint not found',
            status: 404
        }
    });
});

// ============================================================================
// Error Handler
// ============================================================================
app.use((err, req, res, next) => {
    // Log error (sanitized)
    console.error('[Server] Error:', {
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        path: req.path,
        method: req.method
    });

    // Send error response
    res.status(err.status || 500).json({
        error: {
            code: err.code || 'SERVER_ERROR',
            message: process.env.NODE_ENV === 'production' 
                ? 'An unexpected error occurred' 
                : err.message,
            status: err.status || 500
        }
    });
});

// ============================================================================
// Server Startup
// ============================================================================
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log('');
    console.log('🚀 CloudCore Backend Started');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✓ Port: ${PORT}`);
    console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`✓ Base URL: ${process.env.BASE_URL || `http://localhost:${PORT}`}`);
    console.log(`✓ CORS Origins: ${allowedOrigins.join(', ')}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('📚 API Endpoints:');
    console.log('   GET  /health              - Health check');
    console.log('   POST /api/buckets         - Create bucket config');
    console.log('   GET  /api/buckets         - List bucket configs');
    console.log('   GET  /api/buckets/default - Get default bucket');
    console.log('   GET  /api/buckets/:id     - Get bucket metadata');
    console.log('   GET  /api/buckets/:id/credentials - Get credentials');
    console.log('   PUT  /api/buckets/:id     - Update bucket config');
    console.log('   DELETE /api/buckets/:id   - Delete bucket config');
    console.log('   POST /api/buckets/validate - Validate bucket access');
    console.log('');
});
