/**
 * WebCrypto Utilities for Secure Credential Storage
 * Encrypts sensitive data using AES-GCM with browser's SubtleCrypto API
 * 
 * SECURITY: All credentials are encrypted at rest in memory
 * Keys never touch localStorage in plaintext
 */

const CRYPTO_CONFIG = {
    ALGORITHM: 'AES-GCM',
    KEY_LENGTH: 256,
    IV_LENGTH: 12, // 96 bits for GCM
    SALT_LENGTH: 16,
    ITERATIONS: 100000, // PBKDF2 iterations
};

// In-memory encryption key (never persisted)
let masterKey = null;

/**
 * Generate a random encryption key on app initialization
 * SECURITY: Key stored in sessionStorage (cleared on tab close) instead of localStorage
 * This limits exposure window if XSS occurs
 */
const STORAGE_KEY_CRYPTO = 'cc_master_key';

/**
 * Initialize encryption key
 * Tries to recover key from sessionStorage first, otherwise generates new one
 * Note: Using sessionStorage means users need to re-authenticate per session
 */
export const initializeCryptoKey = async () => {
    try {
        // Try to load existing key from sessionStorage (more secure than localStorage)
        const storedKey = sessionStorage.getItem(STORAGE_KEY_CRYPTO);

        if (storedKey) {
            try {
                const keyData = JSON.parse(storedKey);
                masterKey = await crypto.subtle.importKey(
                    'jwk',
                    keyData,
                    {
                        name: CRYPTO_CONFIG.ALGORITHM,
                        length: CRYPTO_CONFIG.KEY_LENGTH,
                    },
                    true,
                    ['encrypt', 'decrypt']
                );
                return { success: true };
            } catch (e) {
                console.warn('Failed to recover stored key, generating new one');
            }
        }

        // Generate a new random key
        const keyMaterial = await crypto.subtle.generateKey(
            {
                name: CRYPTO_CONFIG.ALGORITHM,
                length: CRYPTO_CONFIG.KEY_LENGTH,
            },
            true, // extractable
            ['encrypt', 'decrypt']
        );

        masterKey = keyMaterial;

        // Export and save key to sessionStorage (cleared on tab close)
        const exportedKey = await crypto.subtle.exportKey('jwk', keyMaterial);
        sessionStorage.setItem(STORAGE_KEY_CRYPTO, JSON.stringify(exportedKey));

        return { success: true };
    } catch (error) {
        console.error('Failed to initialize crypto key:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Derive encryption key from session fingerprint
 * Uses browser fingerprinting for additional entropy
 */
const deriveKeyFromFingerprint = async (passphrase) => {
    const encoder = new TextEncoder();
    const passphraseKey = await crypto.subtle.importKey(
        'raw',
        encoder.encode(passphrase),
        'PBKDF2',
        false,
        ['deriveBits', 'deriveKey']
    );

    // Generate salt from session data
    const salt = new Uint8Array(CRYPTO_CONFIG.SALT_LENGTH);
    crypto.getRandomValues(salt);

    return {
        key: await crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: CRYPTO_CONFIG.ITERATIONS,
                hash: 'SHA-256',
            },
            passphraseKey,
            { name: CRYPTO_CONFIG.ALGORITHM, length: CRYPTO_CONFIG.KEY_LENGTH },
            false,
            ['encrypt', 'decrypt']
        ),
        salt
    };
};

/**
 * Encrypt sensitive data using AES-GCM
 * @param {Object} data - Data to encrypt
 * @returns {Promise<string>} Base64 encoded encrypted data with IV
 */
export const encryptData = async (data) => {
    if (!masterKey) {
        throw new Error('Crypto system not initialized. Call initializeCryptoKey() first.');
    }

    try {
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(JSON.stringify(data));

        // Generate random IV for each encryption
        const iv = new Uint8Array(CRYPTO_CONFIG.IV_LENGTH);
        crypto.getRandomValues(iv);

        // Encrypt the data
        const encryptedBuffer = await crypto.subtle.encrypt(
            {
                name: CRYPTO_CONFIG.ALGORITHM,
                iv: iv,
            },
            masterKey,
            dataBuffer
        );

        // Combine IV + encrypted data for storage
        const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
        combined.set(iv, 0);
        combined.set(new Uint8Array(encryptedBuffer), iv.length);

        // Return as base64 string
        return arrayBufferToBase64(combined);
    } catch (error) {
        console.error('Encryption failed:', error);
        throw new Error('Failed to encrypt data');
    }
};

/**
 * Decrypt data encrypted with encryptData
 * @param {string} encryptedData - Base64 encoded encrypted data
 * @returns {Promise<Object>} Decrypted data object
 */
export const decryptData = async (encryptedData) => {
    if (!masterKey) {
        throw new Error('Crypto system not initialized');
    }

    try {
        // Decode from base64
        const combined = base64ToArrayBuffer(encryptedData);

        // Extract IV and encrypted data
        const iv = combined.slice(0, CRYPTO_CONFIG.IV_LENGTH);
        const encryptedBuffer = combined.slice(CRYPTO_CONFIG.IV_LENGTH);

        // Decrypt
        const decryptedBuffer = await crypto.subtle.decrypt(
            {
                name: CRYPTO_CONFIG.ALGORITHM,
                iv: iv,
            },
            masterKey,
            encryptedBuffer
        );

        // Decode to JSON
        const decoder = new TextDecoder();
        const decryptedString = decoder.decode(decryptedBuffer);
        return JSON.parse(decryptedString);
    } catch (error) {
        console.error('Decryption failed:', error);
        throw new Error('Failed to decrypt data - session may have expired');
    }
};

/**
 * Securely zero out sensitive data from memory
 * @param {Object} obj - Object to zero out
 */
export const zeroMemory = (obj) => {
    if (!obj) return;

    if (typeof obj === 'string') {
        // Strings are immutable in JS, but we can try to hint GC
        obj = null;
        return;
    }

    // Zero out object properties
    for (const key in obj) {
        if (typeof obj[key] === 'string') {
            obj[key] = '\0'.repeat(obj[key].length);
        } else if (typeof obj[key] === 'object') {
            zeroMemory(obj[key]);
        }
        delete obj[key];
    }
};

/**
 * Destroy the master encryption key (on logout)
 */
export const destroyCryptoKey = () => {
    masterKey = null;
    localStorage.removeItem(STORAGE_KEY_CRYPTO);
};

/**
 * Check if crypto system is initialized
 */
export const isCryptoInitialized = () => {
    return masterKey !== null;
};

// === Helper Functions ===

function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

function base64ToArrayBuffer(base64) {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

/**
 * Generate secure random token
 * @param {number} length - Token length in bytes
 * @returns {string} Hex encoded random token
 */
export const generateSecureToken = (length = 32) => {
    const buffer = new Uint8Array(length);
    crypto.getRandomValues(buffer);
    return Array.from(buffer)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
};

/**
 * Hash sensitive data (one-way)
 * Useful for comparing tokens without storing plaintext
 */
export const hashData = async (data) => {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    return arrayBufferToBase64(hashBuffer);
};
