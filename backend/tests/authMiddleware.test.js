/**
 * Authentication Middleware Tests
 * ============================================================================
 * Tests for JWT/Supabase authentication middleware.
 * 
 * TEST COVERAGE:
 * - Token extraction from Authorization header
 * - Token format validation
 * - Token expiration checking
 * - Missing/invalid token handling
 * - 401/403 response codes
 * - User info attachment to request
 * - Secure logging (no token exposure)
 * ============================================================================
 */

const { describe, it, expect, vi, beforeEach, afterEach } = require('vitest');

// Mock jose before importing middleware
vi.mock('jose', () => ({
    createRemoteJWKSet: vi.fn(() => vi.fn()),
    jwtVerify: vi.fn()
}));

// Mock supabase
vi.mock('@supabase/supabase-js', () => ({
    createClient: vi.fn(() => ({
        auth: {
            getSession: vi.fn()
        },
        from: vi.fn(() => ({
            select: vi.fn(() => ({
                eq: vi.fn(() => ({
                    eq: vi.fn(() => ({
                        single: vi.fn()
                    }))
                }))
            }))
        }))
    }))
}));

// Set up env before importing middleware
process.env.SUPABASE_URL = 'https://test-project.supabase.co';
process.env.SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';

const { jwtVerify } = require('jose');
const {
    requireAuth,
    optionalAuth,
    verifyTokenStandalone,
    getTokenExpiration,
    clearJWKSCache,
    _testing
} = require('../src/middleware/authMiddleware');

describe('Authentication Middleware', () => {
    let mockReq;
    let mockRes;
    let mockNext;

    beforeEach(() => {
        mockReq = {
            headers: {}
        };
        mockRes = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis()
        };
        mockNext = vi.fn();
        vi.clearAllMocks();
        clearJWKSCache();
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    // ==========================================================================
    // Token Extraction Tests
    // ==========================================================================
    describe('Token extraction', () => {
        it('should extract token from valid Bearer header', () => {
            const { extractToken } = _testing;
            const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U';
            
            const result = extractToken(`Bearer ${token}`);
            expect(result).toBe(token);
        });

        it('should return null for missing header', () => {
            const { extractToken } = _testing;
            expect(extractToken(null)).toBeNull();
            expect(extractToken(undefined)).toBeNull();
        });

        it('should return null for non-Bearer auth', () => {
            const { extractToken } = _testing;
            expect(extractToken('Basic abc123')).toBeNull();
        });

        it('should return null for malformed header', () => {
            const { extractToken } = _testing;
            expect(extractToken('Bearer')).toBeNull();
            expect(extractToken('Bearer token extra')).toBeNull();
        });

        it('should return null for invalid JWT format', () => {
            const { extractToken } = _testing;
            expect(extractToken('Bearer not-a-jwt')).toBeNull();
            expect(extractToken('Bearer only.two')).toBeNull();
        });

        it('should handle case-insensitive Bearer prefix', () => {
            const { extractToken } = _testing;
            const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U';
            
            expect(extractToken(`bearer ${token}`)).toBe(token);
            expect(extractToken(`BEARER ${token}`)).toBe(token);
        });
    });

    // ==========================================================================
    // requireAuth Middleware Tests
    // ==========================================================================
    describe('requireAuth middleware', () => {
        it('should return 401 when no Authorization header', async () => {
            const middleware = requireAuth();
            await middleware(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    error: expect.objectContaining({
                        code: 'MISSING_TOKEN',
                        status: 401
                    })
                })
            );
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should return 401 for invalid token format', async () => {
            mockReq.headers.authorization = 'Bearer invalid-token';
            
            const middleware = requireAuth();
            await middleware(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    error: expect.objectContaining({
                        code: 'MISSING_TOKEN'
                    })
                })
            );
        });

        it('should return 401 for expired token', async () => {
            mockReq.headers.authorization = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U';
            
            const expiredError = new Error('Token expired');
            expiredError.code = 'ERR_JWT_EXPIRED';
            jwtVerify.mockRejectedValue(expiredError);

            const middleware = requireAuth();
            await middleware(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    error: expect.objectContaining({
                        code: 'TOKEN_EXPIRED'
                    })
                })
            );
        });

        it('should return 401 for invalid signature', async () => {
            mockReq.headers.authorization = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U';
            
            const signatureError = new Error('Invalid signature');
            signatureError.code = 'ERR_JWS_SIGNATURE_VERIFICATION_FAILED';
            jwtVerify.mockRejectedValue(signatureError);

            const middleware = requireAuth();
            await middleware(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    error: expect.objectContaining({
                        code: 'INVALID_TOKEN'
                    })
                })
            );
        });

        it('should attach user info and call next on valid token', async () => {
            mockReq.headers.authorization = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U';
            
            const mockPayload = {
                sub: 'user-123',
                email: 'test@example.com',
                email_confirmed_at: '2024-01-01T00:00:00Z',
                role: 'authenticated',
                session_id: 'session-456'
            };
            jwtVerify.mockResolvedValue({ payload: mockPayload });

            const middleware = requireAuth();
            await middleware(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalled();
            expect(mockReq.user).toEqual({
                id: 'user-123',
                email: 'test@example.com',
                emailVerified: true,
                role: 'authenticated',
                sessionId: 'session-456',
                claims: mockPayload
            });
        });

        it('should return 403 when email verification required but not verified', async () => {
            mockReq.headers.authorization = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U';
            
            const mockPayload = {
                sub: 'user-123',
                email: 'test@example.com',
                email_confirmed_at: null, // Not verified
                role: 'authenticated'
            };
            jwtVerify.mockResolvedValue({ payload: mockPayload });

            const middleware = requireAuth({ requireEmailVerified: true });
            await middleware(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    error: expect.objectContaining({
                        code: 'EMAIL_NOT_VERIFIED',
                        status: 403
                    })
                })
            );
            expect(mockNext).not.toHaveBeenCalled();
        });
    });

    // ==========================================================================
    // optionalAuth Middleware Tests
    // ==========================================================================
    describe('optionalAuth middleware', () => {
        it('should continue with null user when no token', async () => {
            const middleware = optionalAuth();
            await middleware(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalled();
            expect(mockReq.user).toBeNull();
        });

        it('should attach user on valid token', async () => {
            mockReq.headers.authorization = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U';
            
            const mockPayload = {
                sub: 'user-123',
                email: 'test@example.com'
            };
            jwtVerify.mockResolvedValue({ payload: mockPayload });

            const middleware = optionalAuth();
            await middleware(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalled();
            expect(mockReq.user).not.toBeNull();
            expect(mockReq.user.id).toBe('user-123');
        });

        it('should continue with null user on invalid token', async () => {
            mockReq.headers.authorization = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U';
            
            jwtVerify.mockRejectedValue(new Error('Invalid'));

            const middleware = optionalAuth();
            await middleware(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalled();
            expect(mockReq.user).toBeNull();
        });
    });

    // ==========================================================================
    // Token Expiration Utility Tests
    // ==========================================================================
    describe('getTokenExpiration', () => {
        it('should return expiration info for valid token', () => {
            // Create a token with exp in the future
            const exp = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
            const payload = { exp };
            const token = `eyJhbGciOiJIUzI1NiJ9.${Buffer.from(JSON.stringify(payload)).toString('base64url')}.signature`;

            const result = getTokenExpiration(token);

            expect(result).not.toBeNull();
            expect(result.shouldRefresh).toBe(false);
            expect(result.expiresInSeconds).toBeGreaterThan(3000);
        });

        it('should indicate refresh needed when less than 5 minutes left', () => {
            // Create a token expiring in 2 minutes
            const exp = Math.floor(Date.now() / 1000) + 120;
            const payload = { exp };
            const token = `eyJhbGciOiJIUzI1NiJ9.${Buffer.from(JSON.stringify(payload)).toString('base64url')}.signature`;

            const result = getTokenExpiration(token);

            expect(result).not.toBeNull();
            expect(result.shouldRefresh).toBe(true);
        });

        it('should return null for invalid token', () => {
            expect(getTokenExpiration('invalid')).toBeNull();
            expect(getTokenExpiration('a.b')).toBeNull();
        });

        it('should return null for token without exp claim', () => {
            const payload = { sub: 'user-123' };
            const token = `eyJhbGciOiJIUzI1NiJ9.${Buffer.from(JSON.stringify(payload)).toString('base64url')}.signature`;

            const result = getTokenExpiration(token);
            expect(result).toBeNull();
        });
    });

    // ==========================================================================
    // Standalone Verification Tests
    // ==========================================================================
    describe('verifyTokenStandalone', () => {
        it('should return success with user on valid token', async () => {
            const mockPayload = {
                sub: 'user-123',
                email: 'test@example.com',
                email_confirmed_at: '2024-01-01T00:00:00Z',
                role: 'authenticated'
            };
            jwtVerify.mockResolvedValue({ payload: mockPayload });

            const result = await verifyTokenStandalone('valid-token');

            expect(result.success).toBe(true);
            expect(result.user.id).toBe('user-123');
            expect(result.user.email).toBe('test@example.com');
        });

        it('should return error on invalid token', async () => {
            jwtVerify.mockRejectedValue(new Error('Invalid'));

            const result = await verifyTokenStandalone('invalid-token');

            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });

        it('should return error when no token provided', async () => {
            const result = await verifyTokenStandalone(null);

            expect(result.success).toBe(false);
            expect(result.error).toBe('No token provided');
        });
    });

    // ==========================================================================
    // Secure Logging Tests
    // ==========================================================================
    describe('Secure logging', () => {
        it('should sanitize tokens in log data', () => {
            const { sanitizeAuthLog } = _testing;

            const sensitive = {
                token: 'secret-jwt-token',
                authorization: 'Bearer secret',
                user: 'visible'
            };

            const sanitized = sanitizeAuthLog(sensitive);

            expect(sanitized.token).toBe('[REDACTED]');
            expect(sanitized.authorization).toBe('[REDACTED]');
            expect(sanitized.user).toBe('visible');
        });

        it('should handle nested sensitive data', () => {
            const { sanitizeAuthLog } = _testing;

            const nested = {
                auth: {
                    access_token: 'secret',
                    refresh_token: 'also-secret'
                },
                metadata: 'visible'
            };

            const sanitized = sanitizeAuthLog(nested);

            expect(sanitized.auth.access_token).toBe('[REDACTED]');
            expect(sanitized.auth.refresh_token).toBe('[REDACTED]');
            expect(sanitized.metadata).toBe('visible');
        });
    });
});
