const { createRemoteJWKSet, jwtVerify } = require('jose');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

let jwks = null;
let jwksLastFetch = 0;
const JWKS_CACHE_TTL = 10 * 60 * 1000;

const authLogger = {
    info: (message, data = {}) => {
        console.log(`[AuthMiddleware] ${message}`, sanitizeAuthLog(data));
    },
    warn: (message, data = {}) => {
        console.warn(`[AuthMiddleware] WARN: ${message}`, sanitizeAuthLog(data));
    },
    error: (message, data = {}) => {
        console.error(`[AuthMiddleware] ERROR: ${message}`, sanitizeAuthLog(data));
    }
};

/**
 * Sanitize auth-related data for logging
 * @param {Object} data - Data to sanitize
 * @returns {Object} Sanitized data
 */
function sanitizeAuthLog(data) {
    if (!data || typeof data !== 'object') {
        return data;
    }

    const sensitiveFields = [
        'token', 'jwt', 'access_token', 'refresh_token',
        'authorization', 'cookie', 'password', 'secret'
    ];

    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
        const lowerKey = key.toLowerCase();
        if (sensitiveFields.some(field => lowerKey.includes(field))) {
            sanitized[key] = '[REDACTED]';
        } else if (typeof value === 'object' && value !== null) {
            sanitized[key] = sanitizeAuthLog(value);
        } else {
            sanitized[key] = value;
        }
    }
    return sanitized;
}

function validateConfiguration() {
    const missing = [];
    
    if (!SUPABASE_URL) missing.push('SUPABASE_URL');
    if (!SUPABASE_ANON_KEY) missing.push('SUPABASE_ANON_KEY');
    if (!SUPABASE_SERVICE_ROLE_KEY) missing.push('SUPABASE_SERVICE_ROLE_KEY');

    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    try {
        new URL(SUPABASE_URL);
    } catch {
        throw new Error('SUPABASE_URL is not a valid URL');
    }
}

async function getJWKS() {
    const now = Date.now();
    
    if (jwks && (now - jwksLastFetch) < JWKS_CACHE_TTL) {
        return jwks;
    }

    try {
        const jwksUrl = new URL('/auth/v1/.well-known/jwks.json', SUPABASE_URL);
        jwks = createRemoteJWKSet(jwksUrl);
        jwksLastFetch = now;
        authLogger.info('JWKS refreshed successfully');
        return jwks;
    } catch (error) {
        authLogger.error('Failed to fetch JWKS', { error: error.message });
        
        if (jwks) {
            authLogger.warn('Using expired JWKS cache due to fetch failure');
            return jwks;
        }
        
        throw new Error('Unable to verify tokens: JWKS unavailable');
    }
}

function getAdminClient() {
    validateConfiguration();
    return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
            detectSessionInUrl: false
        }
    });
}

function extractToken(authHeader) {
    if (!authHeader) {
        return null;
    }

    const parts = authHeader.split(' ');
    
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
        return null;
    }

    const token = parts[1];

    if (!/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token)) {
        return null;
    }

    return token;
}

async function verifyToken(token) {
    const jwks = await getJWKS();

    try {
        const { payload } = await jwtVerify(token, jwks, {
            issuer: `${SUPABASE_URL}/auth/v1`,
        });

        return payload;
    } catch (error) {
        if (error.code === 'ERR_JWT_EXPIRED') {
            const expiredError = new Error('Token has expired');
            expiredError.code = 'TOKEN_EXPIRED';
            throw expiredError;
        }
        
        if (error.code === 'ERR_JWS_SIGNATURE_VERIFICATION_FAILED') {
            const signatureError = new Error('Invalid token signature');
            signatureError.code = 'INVALID_SIGNATURE';
            throw signatureError;
        }

        if (error.code === 'ERR_JWT_CLAIM_VALIDATION_FAILED') {
            const claimError = new Error('Token claim validation failed');
            claimError.code = 'INVALID_CLAIMS';
            throw claimError;
        }

        const genericError = new Error('Token verification failed');
        genericError.code = 'VERIFICATION_FAILED';
        throw genericError;
    }
}

async function validateSession(sessionId, userId) {
    if (!sessionId || !userId) {
        return false;
    }

    try {
        const adminClient = getAdminClient();
        
        const { data, error } = await adminClient
            .from('sessions')
            .select('id')
            .eq('id', sessionId)
            .eq('user_id', userId)
            .single();

        if (error) {
            authLogger.warn('Session validation failed', { 
                sessionId: sessionId.substring(0, 8) + '...', 
                error: error.message 
            });
            return false;
        }

        return !!data;
    } catch (error) {
        authLogger.error('Session validation error', { error: error.message });
        return true;
    }
}

async function getUserById(userId) {
    try {
        const adminClient = getAdminClient();
        const { data, error } = await adminClient.auth.admin.getUserById(userId);
        
        if (error) {
            authLogger.warn('Failed to get user', { userId, error: error.message });
            return null;
        }

        return data.user;
    } catch (error) {
        authLogger.error('Get user error', { error: error.message });
        return null;
    }
}

function sendAuthError(res, status, code, message) {
    res.status(status).json({
        error: {
            code,
            message,
            status
        }
    });
}

function requireAuth(options = {}) {
    const {
        requireEmailVerified = false,
        validateSessionInDb = false
    } = options;

    return async (req, res, next) => {
        try {
            validateConfiguration();

            const token = extractToken(req.headers.authorization);

            if (!token) {
                return sendAuthError(res, 401, 'MISSING_TOKEN', 
                    'Authentication required. Please provide a valid Bearer token.');
            }

            let payload;
            try {
                payload = await verifyToken(token);
            } catch (error) {
                if (error.code === 'TOKEN_EXPIRED') {
                    return sendAuthError(res, 401, 'TOKEN_EXPIRED',
                        'Your session has expired. Please sign in again.');
                }
                return sendAuthError(res, 401, 'INVALID_TOKEN',
                    'Invalid authentication token. Please sign in again.');
            }

            const userId = payload.sub;
            const sessionId = payload.session_id;
            const email = payload.email;
            const emailVerified = payload.email_confirmed_at != null;
            const role = payload.role;

            if (!userId) {
                return sendAuthError(res, 401, 'INVALID_TOKEN',
                    'Token does not contain user information.');
            }

            if (validateSessionInDb && sessionId) {
                const sessionValid = await validateSession(sessionId, userId);
                if (!sessionValid) {
                    return sendAuthError(res, 401, 'SESSION_REVOKED',
                        'Your session has been revoked. Please sign in again.');
                }
            }

            if (requireEmailVerified && !emailVerified) {
                return sendAuthError(res, 403, 'EMAIL_NOT_VERIFIED',
                    'Please verify your email address to access this resource.');
            }

            req.user = {
                id: userId,
                email,
                emailVerified,
                role,
                sessionId,
                claims: payload
            };

            req.accessToken = token;

            authLogger.info('Authentication successful', {
                userId: userId.substring(0, 8) + '...',
                emailVerified,
                role
            });

            next();
        } catch (error) {
            authLogger.error('Authentication middleware error', { error: error.message });
            return sendAuthError(res, 500, 'AUTH_ERROR',
                'An error occurred during authentication. Please try again.');
        }
    };
}

function optionalAuth() {
    return async (req, res, next) => {
        try {
            validateConfiguration();

            const token = extractToken(req.headers.authorization);

            if (!token) {
                req.user = null;
                return next();
            }

            try {
                const payload = await verifyToken(token);
                
                req.user = {
                    id: payload.sub,
                    email: payload.email,
                    emailVerified: payload.email_confirmed_at != null,
                    role: payload.role,
                    sessionId: payload.session_id,
                    claims: payload
                };
                req.accessToken = token;
            } catch {
                req.user = null;
            }

            next();
        } catch (error) {
            authLogger.warn('Optional auth error', { error: error.message });
            req.user = null;
            next();
        }
    };
}

function requireOwnership(getResourceUserId) {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return sendAuthError(res, 401, 'MISSING_USER',
                    'Authentication required.');
            }

            const resourceUserId = await getResourceUserId(req);

            if (!resourceUserId) {
                return res.status(404).json({
                    error: {
                        code: 'NOT_FOUND',
                        message: 'Resource not found.',
                        status: 404
                    }
                });
            }

            if (resourceUserId !== req.user.id) {
                return sendAuthError(res, 403, 'FORBIDDEN',
                    'You do not have permission to access this resource.');
            }

            next();
        } catch (error) {
            authLogger.error('Ownership check error', { error: error.message });
            return res.status(500).json({
                error: {
                    code: 'SERVER_ERROR',
                    message: 'An error occurred while checking resource ownership.',
                    status: 500
                }
            });
        }
    };
}

async function verifyTokenStandalone(token) {
    try {
        validateConfiguration();

        if (!token) {
            return { success: false, error: 'No token provided' };
        }

        const payload = await verifyToken(token);

        return {
            success: true,
            user: {
                id: payload.sub,
                email: payload.email,
                emailVerified: payload.email_confirmed_at != null,
                role: payload.role,
                sessionId: payload.session_id,
                claims: payload
            }
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
            code: error.code
        };
    }
}

function getTokenExpiration(token) {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            return null;
        }

        const payload = JSON.parse(
            Buffer.from(parts[1], 'base64url').toString()
        );

        const exp = payload.exp;
        if (!exp) {
            return null;
        }

        const expiresAt = new Date(exp * 1000);
        const now = new Date();
        const expiresIn = Math.max(0, exp * 1000 - now.getTime());
        const shouldRefresh = expiresIn < 5 * 60 * 1000;

        return {
            expiresAt,
            expiresIn,
            expiresInSeconds: Math.floor(expiresIn / 1000),
            shouldRefresh
        };
    } catch {
        return null;
    }
}

function clearJWKSCache() {
    jwks = null;
    jwksLastFetch = 0;
    authLogger.info('JWKS cache cleared');
}

module.exports = {
    requireAuth,
    optionalAuth,
    requireOwnership,
    verifyTokenStandalone,
    getTokenExpiration,
    getAdminClient,
    getUserById,
    clearJWKSCache,
    _testing: {
        extractToken,
        verifyToken,
        validateSession,
        sanitizeAuthLog
    }
};
