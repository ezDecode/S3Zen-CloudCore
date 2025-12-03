/**
 * Encryption Service Tests
 * ============================================================================
 * Tests for AES-256-GCM encryption service using property-based testing
 * with fast-check library.
 * 
 * TEST COVERAGE:
 * - Credential round-trip (encrypt -> decrypt)
 * - IV uniqueness across encryptions
 * - Key validation
 * - Error handling
 * - Secure logging (no plaintext in logs)
 * ============================================================================
 */

const { describe, it, expect, beforeAll, afterAll, beforeEach } = require('vitest');
const fc = require('fast-check');

// Store original env
const originalEnv = { ...process.env };

// Set up test encryption key before importing module
const TEST_ENCRYPTION_KEY = 'a'.repeat(64); // Valid 32-byte hex key
process.env.ENCRYPTION_KEY = TEST_ENCRYPTION_KEY;

// Import after setting env
const {
    encrypt,
    decrypt,
    encryptCredentials,
    decryptCredentials,
    validateConfiguration,
    generateEncryptionKey,
    clearKeyCache,
    _testing
} = require('../src/services/encryptionService');

describe('Encryption Service', () => {
    beforeAll(() => {
        process.env.ENCRYPTION_KEY = TEST_ENCRYPTION_KEY;
    });

    afterAll(() => {
        // Restore original env
        process.env = originalEnv;
        clearKeyCache();
    });

    beforeEach(() => {
        // Reset key cache before each test
        clearKeyCache();
        process.env.ENCRYPTION_KEY = TEST_ENCRYPTION_KEY;
    });

    // ==========================================================================
    // Configuration Validation Tests
    // ==========================================================================
    describe('validateConfiguration', () => {
        it('should succeed with valid encryption key', () => {
            const result = validateConfiguration();
            expect(result.success).toBe(true);
        });

        it('should fail when encryption key is missing', () => {
            clearKeyCache();
            delete process.env.ENCRYPTION_KEY;
            
            const result = validateConfiguration();
            expect(result.success).toBe(false);
            expect(result.error).toContain('ENCRYPTION_KEY');
        });

        it('should fail when encryption key is too short', () => {
            clearKeyCache();
            process.env.ENCRYPTION_KEY = 'tooshort';
            
            const result = validateConfiguration();
            expect(result.success).toBe(false);
            expect(result.error).toContain('64 hexadecimal');
        });

        it('should fail when encryption key contains invalid characters', () => {
            clearKeyCache();
            process.env.ENCRYPTION_KEY = 'g'.repeat(64); // 'g' is not valid hex
            
            const result = validateConfiguration();
            expect(result.success).toBe(false);
        });
    });

    // ==========================================================================
    // Basic Encryption/Decryption Tests
    // ==========================================================================
    describe('encrypt and decrypt', () => {
        it('should encrypt and decrypt a simple string', () => {
            const original = 'Hello, World!';
            const { ciphertext, iv } = encrypt(original);
            const decrypted = decrypt(ciphertext, iv, false);
            
            expect(decrypted).toBe(original);
        });

        it('should encrypt and decrypt an object', () => {
            const original = { key: 'value', nested: { data: 123 } };
            const { ciphertext, iv } = encrypt(original);
            const decrypted = decrypt(ciphertext, iv, true);
            
            expect(decrypted).toEqual(original);
        });

        it('should return base64 encoded strings', () => {
            const { ciphertext, iv } = encrypt('test');
            
            // Base64 pattern
            const base64Pattern = /^[A-Za-z0-9+/]+=*$/;
            expect(ciphertext).toMatch(base64Pattern);
            expect(iv).toMatch(base64Pattern);
        });
    });

    // ==========================================================================
    // Property-Based Tests: Round-Trip
    // ==========================================================================
    describe('Property: Round-trip encryption', () => {
        it('should always decrypt to original string', () => {
            fc.assert(
                fc.property(fc.string(), (original) => {
                    const { ciphertext, iv } = encrypt(original);
                    const decrypted = decrypt(ciphertext, iv, false);
                    return decrypted === original;
                }),
                { numRuns: 100 }
            );
        });

        it('should always decrypt to original object', () => {
            fc.assert(
                fc.property(
                    fc.record({
                        key: fc.string(),
                        number: fc.integer(),
                        bool: fc.boolean(),
                        nullable: fc.option(fc.string())
                    }),
                    (original) => {
                        const { ciphertext, iv } = encrypt(original);
                        const decrypted = decrypt(ciphertext, iv, true);
                        return JSON.stringify(decrypted) === JSON.stringify(original);
                    }
                ),
                { numRuns: 100 }
            );
        });
    });

    // ==========================================================================
    // Property-Based Tests: IV Uniqueness
    // ==========================================================================
    describe('Property: IV uniqueness', () => {
        it('should generate unique IVs for each encryption', () => {
            const ivSet = new Set();
            const iterations = 1000;

            for (let i = 0; i < iterations; i++) {
                const { iv } = encrypt('test');
                ivSet.add(iv);
            }

            // All IVs should be unique
            expect(ivSet.size).toBe(iterations);
        });

        it('should produce different ciphertexts for same plaintext', () => {
            const plaintext = 'same message';
            const results = [];

            for (let i = 0; i < 100; i++) {
                const { ciphertext } = encrypt(plaintext);
                results.push(ciphertext);
            }

            // All ciphertexts should be unique (due to different IVs)
            const uniqueCiphertexts = new Set(results);
            expect(uniqueCiphertexts.size).toBe(100);
        });
    });

    // ==========================================================================
    // Credential Encryption Tests
    // ==========================================================================
    describe('encryptCredentials and decryptCredentials', () => {
        it('should encrypt and decrypt valid credentials', () => {
            const credentials = {
                accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
                secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'
            };

            const { ciphertext, iv } = encryptCredentials(credentials);
            const decrypted = decryptCredentials(ciphertext, iv);

            expect(decrypted.accessKeyId).toBe(credentials.accessKeyId);
            expect(decrypted.secretAccessKey).toBe(credentials.secretAccessKey);
        });

        it('should handle credentials with session token', () => {
            const credentials = {
                accessKeyId: 'ASIAIOSFODNN7EXAMPLE',
                secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
                sessionToken: 'AQoDYXdzEJr...'
            };

            const { ciphertext, iv } = encryptCredentials(credentials);
            const decrypted = decryptCredentials(ciphertext, iv);

            expect(decrypted.sessionToken).toBe(credentials.sessionToken);
        });

        it('should throw on missing accessKeyId', () => {
            expect(() => encryptCredentials({
                secretAccessKey: 'secret'
            })).toThrow('accessKeyId is required');
        });

        it('should throw on missing secretAccessKey', () => {
            expect(() => encryptCredentials({
                accessKeyId: 'AKIAIOSFODNN7EXAMPLE'
            })).toThrow('secretAccessKey is required');
        });

        it('should throw on invalid accessKeyId format', () => {
            expect(() => encryptCredentials({
                accessKeyId: 'invalid-key-format',
                secretAccessKey: 'secret'
            })).toThrow('Invalid accessKeyId format');
        });
    });

    // ==========================================================================
    // Property-Based Tests: Credential Round-Trip
    // ==========================================================================
    describe('Property: Credential round-trip', () => {
        // Generator for valid AWS access key IDs
        const accessKeyIdArb = fc.stringOf(
            fc.constantFrom(...'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('')),
            { minLength: 16, maxLength: 32 }
        );

        // Generator for secret access keys
        const secretKeyArb = fc.string({ minLength: 1, maxLength: 100 });

        it('should always round-trip credentials correctly', () => {
            fc.assert(
                fc.property(
                    accessKeyIdArb,
                    secretKeyArb,
                    fc.option(fc.string()),
                    (accessKeyId, secretAccessKey, sessionToken) => {
                        const credentials = {
                            accessKeyId,
                            secretAccessKey,
                            sessionToken: sessionToken || undefined
                        };

                        const { ciphertext, iv } = encryptCredentials(credentials);
                        const decrypted = decryptCredentials(ciphertext, iv);

                        return (
                            decrypted.accessKeyId === accessKeyId &&
                            decrypted.secretAccessKey === secretAccessKey
                        );
                    }
                ),
                { numRuns: 50 }
            );
        });
    });

    // ==========================================================================
    // Tamper Detection Tests
    // ==========================================================================
    describe('Tamper detection', () => {
        it('should detect tampered ciphertext', () => {
            const { ciphertext, iv } = encrypt('sensitive data');
            
            // Tamper with ciphertext
            const decoded = Buffer.from(ciphertext, 'base64');
            decoded[0] = decoded[0] ^ 0xFF; // Flip bits
            const tamperedCiphertext = decoded.toString('base64');

            expect(() => decrypt(tamperedCiphertext, iv)).toThrow();
        });

        it('should detect tampered IV', () => {
            const { ciphertext, iv } = encrypt('sensitive data');
            
            // Tamper with IV
            const decoded = Buffer.from(iv, 'base64');
            decoded[0] = decoded[0] ^ 0xFF;
            const tamperedIv = decoded.toString('base64');

            expect(() => decrypt(ciphertext, tamperedIv)).toThrow();
        });

        it('should reject invalid IV length', () => {
            const { ciphertext } = encrypt('test');
            const shortIv = Buffer.from('tooshort').toString('base64');

            expect(() => decrypt(ciphertext, shortIv)).toThrow();
        });
    });

    // ==========================================================================
    // Key Generation Tests
    // ==========================================================================
    describe('generateEncryptionKey', () => {
        it('should generate valid 64-character hex keys', () => {
            const key = generateEncryptionKey();
            
            expect(key).toHaveLength(64);
            expect(key).toMatch(/^[a-f0-9]{64}$/);
        });

        it('should generate unique keys', () => {
            const keys = new Set();
            
            for (let i = 0; i < 100; i++) {
                keys.add(generateEncryptionKey());
            }

            expect(keys.size).toBe(100);
        });
    });

    // ==========================================================================
    // Secure Logging Tests
    // ==========================================================================
    describe('Secure logging', () => {
        it('should sanitize sensitive fields in log data', () => {
            const { sanitizeLogData } = _testing;

            const sensitive = {
                accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
                secretAccessKey: 'secret123',
                password: 'mypassword',
                normalField: 'visible'
            };

            const sanitized = sanitizeLogData(sensitive);

            expect(sanitized.accessKeyId).toBe('[REDACTED]');
            expect(sanitized.secretAccessKey).toBe('[REDACTED]');
            expect(sanitized.password).toBe('[REDACTED]');
            expect(sanitized.normalField).toBe('visible');
        });

        it('should sanitize nested sensitive fields', () => {
            const { sanitizeLogData } = _testing;

            const nested = {
                user: {
                    credentials: {
                        accessKeyId: 'secret'
                    }
                },
                metadata: {
                    timestamp: '2024-01-01'
                }
            };

            const sanitized = sanitizeLogData(nested);

            expect(sanitized.user.credentials).toBe('[REDACTED]');
            expect(sanitized.metadata.timestamp).toBe('2024-01-01');
        });
    });

    // ==========================================================================
    // Edge Cases
    // ==========================================================================
    describe('Edge cases', () => {
        it('should handle empty string', () => {
            const { ciphertext, iv } = encrypt('');
            const decrypted = decrypt(ciphertext, iv, false);
            expect(decrypted).toBe('');
        });

        it('should handle very long strings', () => {
            const longString = 'x'.repeat(100000);
            const { ciphertext, iv } = encrypt(longString);
            const decrypted = decrypt(ciphertext, iv, false);
            expect(decrypted).toBe(longString);
        });

        it('should handle Unicode characters', () => {
            const unicode = '日本語テスト🎉🚀';
            const { ciphertext, iv } = encrypt(unicode);
            const decrypted = decrypt(ciphertext, iv, false);
            expect(decrypted).toBe(unicode);
        });

        it('should handle special characters in credentials', () => {
            const credentials = {
                accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
                secretAccessKey: 'wJa+lr/XU=tn$FE@MI#K7M%DENG^bPx&RfiCY*EX'
            };

            const { ciphertext, iv } = encryptCredentials(credentials);
            const decrypted = decryptCredentials(ciphertext, iv);

            expect(decrypted.secretAccessKey).toBe(credentials.secretAccessKey);
        });
    });
});
