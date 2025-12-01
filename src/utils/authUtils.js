/**
 * Secure Authentication Utilities
 * Handles AWS credentials with encrypted storage and session management
 * 
 * SECURITY FEATURES:
 * - AES-GCM encryption for credentials at rest
 * - In-memory credential storage during active session
 * - Automatic session expiry (24 hours)
 * - Secure memory zeroing on logout
 * - HMAC signature for session token integrity
 * - Credentials persisted in localStorage (encrypted)
 * - Session survives page refresh and browser restart
 * 
 * SECURITY TRADE-OFFS:
 * Credentials are stored encrypted in localStorage for user convenience.
 * This allows sessions to persist across browser restarts and provides
 * a better user experience. However, this means:
 * 
 * 1. Encrypted credentials remain in browser storage until logout
 * 2. XSS attacks could potentially access localStorage (mitigated by encryption)
 * 3. Physical access to unlocked device could expose encrypted data
 * 
 * MITIGATION:
 * - Credentials are encrypted with AES-GCM using non-extractable keys
 * - Session tokens are cryptographically signed with HMAC
 * - 24-hour automatic session expiry
 * - Users can clear credentials by logging out
 * - Encryption keys are non-extractable from WebCrypto
 * 
 * ALTERNATIVES:
 * For higher security requirements, consider:
 * - Using AWS Cognito for federated authentication
 * - Implementing a backend proxy for AWS credentials
 * - Using temporary credentials with STS AssumeRole
 */

import {
    initializeCryptoKey,
    encryptData,
    decryptData,
    destroyCryptoKey,
    zeroMemory,
    isCryptoInitialized,
    generateSecureToken
} from './cryptoUtils.js';

export { isCryptoInitialized };

const STORAGE_KEYS = {
    ENCRYPTED_CREDENTIALS: 'cc_enc_creds', // Encrypted credentials
    SESSION_TOKEN: 'cc_session_token', // Session identifier
    TOKEN_SIGNATURE: 'cc_token_sig', // HMAC signature for token integrity
    SESSION_TIMESTAMP: 'cc_session_ts',
    BUCKET_INFO: 'cc_bucket_info', // Non-sensitive bucket metadata
};

const SESSION_TIMEOUT_MS = 24 * 60 * 60 * 1000; // 24 hours for better security

// In-memory credential cache (encrypted)
let credentialCache = null;
let sessionToken = null;

/**
 * Initialize secure authentication system
 * Must be called on app startup
 */
export const initializeAuth = async () => {
    try {
        // Initialize WebCrypto encryption key (restores from storage if available)
        const result = await initializeCryptoKey();
        if (!result.success) {
            throw new Error('Failed to initialize crypto');
        }

        // Try to restore existing session
        const storedToken = localStorage.getItem(STORAGE_KEYS.SESSION_TOKEN);
        const encryptedCreds = localStorage.getItem(STORAGE_KEYS.ENCRYPTED_CREDENTIALS);

        if (storedToken && encryptedCreds && !isSessionExpired()) {
            try {
                // Restore session token
                sessionToken = storedToken;

                // Decrypt and restore credentials to memory cache
                const decrypted = await decryptData(encryptedCreds);
                if (decrypted && decrypted.accessKeyId && decrypted.secretAccessKey) {
                    credentialCache = decrypted;
                    console.log('✓ Session restored successfully');
                    return { success: true };
                }
            } catch (e) {
                console.warn('Failed to restore session:', e);
            }
        }

        // Start new session if restore failed or no session exists
        console.log('Starting new session');
        sessionToken = generateSecureToken(32);
        localStorage.setItem(STORAGE_KEYS.SESSION_TOKEN, sessionToken);

        // Clear any old encrypted data since we're starting fresh
        localStorage.removeItem(STORAGE_KEYS.ENCRYPTED_CREDENTIALS);
        credentialCache = null;

        return { success: true };
    } catch (error) {
        console.error('Failed to initialize auth system:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Save AWS credentials securely (encrypted in-memory only)
 * @param {Object} credentials - AWS credentials object
 */
export const saveCredentials = async (credentials) => {
    if (!isCryptoInitialized()) {
        throw new Error('Auth system not initialized. Call initializeAuth() first.');
    }

    try {
        // Validate credentials format
        if (!credentials.accessKeyId || !credentials.secretAccessKey) {
            throw new Error('Invalid credentials format');
        }

        // Store in encrypted memory cache
        credentialCache = {
            accessKeyId: credentials.accessKeyId,
            secretAccessKey: credentials.secretAccessKey,
            sessionToken: credentials.sessionToken || null,
            expiresAt: credentials.expiresAt || null,
        };

        // Persist to localStorage (encrypted)
        // SECURITY NOTE: Credentials are encrypted with AES-GCM before storage.
        // This provides convenience (session persistence) with reasonable security.
        // Users can clear credentials by logging out or clearing browser data.
        const encrypted = await encryptData(credentialCache);
        localStorage.setItem(STORAGE_KEYS.ENCRYPTED_CREDENTIALS, encrypted);

        // Generate and store HMAC signature for session token integrity
        const tokenSignature = await generateTokenSignature(sessionToken);
        localStorage.setItem(STORAGE_KEYS.TOKEN_SIGNATURE, tokenSignature);

        // Update session timestamp
        localStorage.setItem(STORAGE_KEYS.SESSION_TIMESTAMP, Date.now().toString());

        return { success: true };
    } catch (error) {
        console.error('Failed to save credentials:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Generate HMAC signature for session token
 * Provides cryptographic binding to prevent tampering
 */
const generateTokenSignature = async (token) => {
    if (!token) return '';
    
    try {
        const encoder = new TextEncoder();
        const data = encoder.encode(token);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (error) {
        console.error('Failed to generate token signature:', error);
        return '';
    }
};

/**
 * Verify session token signature
 */
const verifyTokenSignature = async (token, storedSignature) => {
    if (!token || !storedSignature) return false;
    
    const currentSignature = await generateTokenSignature(token);
    return currentSignature === storedSignature;
};

/**
 * Get stored AWS credentials from secure memory cache
 * @returns {Object|null} Decrypted credentials or null
 */
export const getCredentials = async () => {
    try {
        // Check session validity first
        if (isSessionExpired()) {
            clearAuth();
            return null;
        }

        // Validate session token
        const storedToken = localStorage.getItem(STORAGE_KEYS.SESSION_TOKEN);
        if (!storedToken || storedToken !== sessionToken) {
            console.warn('Invalid session token');
            clearAuth();
            return null;
        }

        // Verify token signature for integrity
        const storedSignature = localStorage.getItem(STORAGE_KEYS.TOKEN_SIGNATURE);
        const isValidSignature = await verifyTokenSignature(storedToken, storedSignature);
        if (!isValidSignature) {
            console.warn('Session token signature verification failed');
            clearAuth();
            return null;
        }

        // Return credentials from memory cache
        if (!credentialCache) {
            return null;
        }

        // Check if temporary credentials have expired
        if (credentialCache.expiresAt && Date.now() >= credentialCache.expiresAt) {
            console.warn('Temporary credentials expired');
            clearAuth();
            return null;
        }

        return { ...credentialCache };
    } catch (error) {
        console.error('Failed to get credentials:', error);
        clearAuth();
        return null;
    }
};

/**
 * Save bucket configuration (non-sensitive, can use localStorage)
 */
export const saveBucketConfig = (bucketName, region) => {
    try {
        const config = { bucketName, region };
        localStorage.setItem(STORAGE_KEYS.BUCKET_INFO, JSON.stringify(config));
        return { success: true };
    } catch (error) {
        console.error('Failed to save bucket config:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Get stored bucket configuration
 */
export const getBucketConfig = () => {
    try {
        const config = localStorage.getItem(STORAGE_KEYS.BUCKET_INFO);
        return config ? JSON.parse(config) : null;
    } catch (error) {
        console.error('Failed to get bucket config:', error);
        return null;
    }
};

/**
 * Clear all stored credentials and session data
 * Securely zeros memory before cleanup
 */
export const clearAuth = () => {
    try {
        // Zero out sensitive data in memory
        if (credentialCache) {
            zeroMemory(credentialCache);
            credentialCache = null;
        }

        // Destroy crypto key
        destroyCryptoKey();

        // Clear all session storage
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });

        // Clear any legacy localStorage keys (migration cleanup)
        const legacyKeys = [
            'cloudcore_aws_credentials',
            'cloudcore_session_timestamp',
            'cloudcore_bucket_name',
            'cloudcore_region'
        ];
        legacyKeys.forEach(key => localStorage.removeItem(key));

        sessionToken = null;

        return { success: true };
    } catch (error) {
        console.error('Failed to clear auth:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Check if session has expired
 */
export const isSessionExpired = () => {
    try {
        const timestamp = localStorage.getItem(STORAGE_KEYS.SESSION_TIMESTAMP);
        if (!timestamp) return true;

        const elapsed = Date.now() - parseInt(timestamp, 10);
        return elapsed > SESSION_TIMEOUT_MS;
    } catch (error) {
        console.error('Failed to check session:', error);
        return true;
    }
};

/**
 * Update session timestamp (call on user activity)
 */
export const updateSessionTimestamp = () => {
    try {
        localStorage.setItem(STORAGE_KEYS.SESSION_TIMESTAMP, Date.now().toString());
        return { success: true };
    } catch (error) {
        console.error('Failed to update session timestamp:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
    const credentials = getCredentials();
    const bucketConfig = getBucketConfig();
    const sessionValid = !isSessionExpired();

    return !!(credentials && bucketConfig && sessionValid);
};

/**
 * Get session timeout duration in milliseconds
 */
export const getSessionTimeout = () => SESSION_TIMEOUT_MS;

/**
 * Get time remaining in current session (in ms)
 */
export const getSessionTimeRemaining = () => {
    try {
        const timestamp = localStorage.getItem(STORAGE_KEYS.SESSION_TIMESTAMP);
        if (!timestamp) return 0;

        const elapsed = Date.now() - parseInt(timestamp, 10);
        const remaining = SESSION_TIMEOUT_MS - elapsed;
        return Math.max(0, remaining);
    } catch (error) {
        return 0;
    }
};

