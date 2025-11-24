/**
 * CloudCore URL Shortener - Cloudflare Worker
 * Serverless URL shortening service using Cloudflare Workers + KV
 * 
 * Routes:
 * - GET /s/:id → Redirect to long URL
 * - POST /api/create → Create short URL
 */

// Security configuration
const CONFIG = {
    // API key for creating short URLs (set in Worker environment variables)
    API_KEY_HEADER: 'X-CloudCore-API-Key',

    // Allowed domains for CORS
    ALLOWED_ORIGINS: [
        'http://localhost:5173',
        'http://localhost:3000',
        'https://cloudcore.app',
        // Add your production domains here
    ],

    // Max URL length to prevent abuse
    MAX_URL_LENGTH: 2048,

    // Default expiry (7 days in seconds)
    DEFAULT_EXPIRY: 604800,

    // Max expiry (30 days in seconds)
    MAX_EXPIRY: 2592000,

    // Short ID length
    SHORT_ID_LENGTH: 8,

    // Allowed URL schemes to prevent open redirect
    ALLOWED_SCHEMES: ['https://', 'http://'],

    // Blocked domains (add malicious domains here)
    BLOCKED_DOMAINS: [],
};

// Base62 characters for short ID generation
const BASE62 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

/**
 * Main Worker handler
 */
export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);

        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return handleCORS(request);
        }

        try {
            // Route: GET /s/:id - Redirect
            if (request.method === 'GET' && url.pathname.startsWith('/s/')) {
                return handleRedirect(request, env, url);
            }

            // Route: POST /api/create - Create short URL
            if (request.method === 'POST' && url.pathname === '/api/create') {
                return handleCreate(request, env);
            }

            // Route: GET /api/stats/:id - Get URL stats (optional)
            if (request.method === 'GET' && url.pathname.startsWith('/api/stats/')) {
                return handleStats(request, env, url);
            }

            // 404 for unknown routes
            return jsonResponse({ error: 'Not found' }, 404);

        } catch (error) {
            console.error('Worker error:', error);
            return jsonResponse({ error: 'Internal server error' }, 500);
        }
    }
};

/**
 * Handle redirect from short URL to long URL
 */
async function handleRedirect(request, env, url) {
    const shortId = url.pathname.split('/s/')[1];

    if (!shortId || shortId.length === 0) {
        return new Response('Invalid short URL', { status: 400 });
    }

    // Lookup in KV
    const data = await env.SHORTLINKS.get(shortId, { type: 'json' });

    if (!data) {
        return new Response('Short URL not found or expired', { status: 404 });
    }

    // Increment visit count (fire and forget)
    incrementVisits(env, shortId, data);

    // 302 redirect to long URL
    return Response.redirect(data.longUrl, 302);
}

/**
 * Handle creation of short URL
 */
async function handleCreate(request, env) {
    // Validate API key
    const apiKey = request.headers.get(CONFIG.API_KEY_HEADER);

    if (!apiKey || apiKey !== env.API_KEY) {
        return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    // Validate origin
    const origin = request.headers.get('Origin');
    if (!isOriginAllowed(origin)) {
        return jsonResponse({ error: 'Forbidden origin' }, 403);
    }

    // Parse request body
    let body;
    try {
        body = await request.json();
    } catch (error) {
        return jsonResponse({ error: 'Invalid JSON' }, 400);
    }

    const { longUrl, expirySeconds } = body;

    // Validate long URL
    const validation = validateUrl(longUrl);
    if (!validation.valid) {
        return jsonResponse({ error: validation.error }, 400);
    }

    // Validate expiry
    const expiry = Math.min(
        expirySeconds || CONFIG.DEFAULT_EXPIRY,
        CONFIG.MAX_EXPIRY
    );

    // Generate unique short ID
    const shortId = await generateUniqueShortId(env);

    // Store in KV with expiry
    const data = {
        longUrl,
        shortId,
        createdAt: Date.now(),
        expiresAt: Date.now() + (expiry * 1000),
        visits: 0,
        lastVisit: null,
    };

    await env.SHORTLINKS.put(
        shortId,
        JSON.stringify(data),
        { expirationTtl: expiry }
    );

    // Return short URL
    const shortUrl = `${new URL(request.url).origin}/s/${shortId}`;

    return jsonResponse({
        success: true,
        shortUrl,
        shortId,
        longUrl,
        expiresAt: data.expiresAt,
        expiresIn: expiry,
    }, 200, origin);
}

/**
 * Handle stats retrieval (optional)
 */
async function handleStats(request, env, url) {
    const shortId = url.pathname.split('/api/stats/')[1];

    if (!shortId) {
        return jsonResponse({ error: 'Invalid short ID' }, 400);
    }

    const data = await env.SHORTLINKS.get(shortId, { type: 'json' });

    if (!data) {
        return jsonResponse({ error: 'Short URL not found or expired' }, 404);
    }

    // Return stats without revealing the long URL
    return jsonResponse({
        shortId,
        createdAt: data.createdAt,
        expiresAt: data.expiresAt,
        visits: data.visits || 0,
        lastVisit: data.lastVisit,
    });
}

/**
 * Generate a cryptographically random short ID
 */
function generateShortId(length = CONFIG.SHORT_ID_LENGTH) {
    const randomValues = new Uint8Array(length);
    crypto.getRandomValues(randomValues);

    let id = '';
    for (let i = 0; i < length; i++) {
        id += BASE62[randomValues[i] % BASE62.length];
    }

    return id;
}

/**
 * Generate unique short ID (check for collisions)
 */
async function generateUniqueShortId(env, maxAttempts = 10) {
    for (let i = 0; i < maxAttempts; i++) {
        const shortId = generateShortId();

        // Check if already exists
        const existing = await env.SHORTLINKS.get(shortId);

        if (!existing) {
            return shortId;
        }
    }

    throw new Error('Failed to generate unique short ID');
}

/**
 * Validate URL format and security
 */
function validateUrl(url) {
    if (!url || typeof url !== 'string') {
        return { valid: false, error: 'URL is required' };
    }

    if (url.length > CONFIG.MAX_URL_LENGTH) {
        return { valid: false, error: 'URL too long' };
    }

    // Check if URL starts with allowed scheme
    const hasValidScheme = CONFIG.ALLOWED_SCHEMES.some(scheme =>
        url.toLowerCase().startsWith(scheme)
    );

    if (!hasValidScheme) {
        return { valid: false, error: 'Invalid URL scheme' };
    }

    // Parse URL
    let parsedUrl;
    try {
        parsedUrl = new URL(url);
    } catch (error) {
        return { valid: false, error: 'Invalid URL format' };
    }

    // Check blocked domains
    if (CONFIG.BLOCKED_DOMAINS.includes(parsedUrl.hostname.toLowerCase())) {
        return { valid: false, error: 'Domain not allowed' };
    }

    // Additional security: prevent localhost/internal IPs in production
    const hostname = parsedUrl.hostname.toLowerCase();
    if (hostname === 'localhost' ||
        hostname.startsWith('127.') ||
        hostname.startsWith('192.168.') ||
        hostname.startsWith('10.') ||
        hostname === '0.0.0.0') {
        // Allow only in development
        // In production, you might want to block these
    }

    return { valid: true };
}

/**
 * Check if origin is allowed
 */
function isOriginAllowed(origin) {
    if (!origin) return false;
    return CONFIG.ALLOWED_ORIGINS.includes(origin) ||
        CONFIG.ALLOWED_ORIGINS.includes('*');
}

/**
 * Increment visit count (async, fire and forget)
 */
async function incrementVisits(env, shortId, data) {
    try {
        const updatedData = {
            ...data,
            visits: (data.visits || 0) + 1,
            lastVisit: Date.now(),
        };

        // Calculate remaining TTL
        const now = Date.now();
        const expiresAt = data.expiresAt || (now + CONFIG.DEFAULT_EXPIRY * 1000);
        const remainingTtl = Math.floor((expiresAt - now) / 1000);

        if (remainingTtl > 0) {
            await env.SHORTLINKS.put(
                shortId,
                JSON.stringify(updatedData),
                { expirationTtl: remainingTtl }
            );
        }
    } catch (error) {
        // Fail silently to not block redirect
        console.error('Failed to increment visits:', error);
    }
}

/**
 * Handle CORS preflight
 */
function handleCORS(request) {
    const origin = request.headers.get('Origin');

    if (!isOriginAllowed(origin)) {
        return new Response(null, { status: 403 });
    }

    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': origin,
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': `Content-Type, ${CONFIG.API_KEY_HEADER}`,
            'Access-Control-Max-Age': '86400',
        },
    });
}

/**
 * Create JSON response with CORS headers
 */
function jsonResponse(data, status = 200, origin = null) {
    const headers = {
        'Content-Type': 'application/json',
    };

    if (origin && isOriginAllowed(origin)) {
        headers['Access-Control-Allow-Origin'] = origin;
        headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS';
        headers['Access-Control-Allow-Headers'] = `Content-Type, ${CONFIG.API_KEY_HEADER}`;
    }

    return new Response(JSON.stringify(data), {
        status,
        headers,
    });
}
