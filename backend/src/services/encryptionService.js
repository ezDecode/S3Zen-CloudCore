const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const KEY_LENGTH = 32;

let encryptionKey = null;

const secureLog = {
    info: (message, data = {}) => {
        console.log(`[EncryptionService] ${message}`, sanitizeLogData(data));
    },
    error: (message, error = {}) => {
        const sanitized = error instanceof Error
            ? { name: error.name, message: error.message, stack: error.stack }
            : sanitizeLogData(error);
        console.error(`[EncryptionService] ERROR: ${message}`, sanitized);
    },
    warn: (message, data = {}) => {
        console.warn(`[EncryptionService] WARN: ${message}`, sanitizeLogData(data));
    }
};

function sanitizeLogData(data) {
    if (!data || typeof data !== 'object') {
        return data;
    }

    // Fields that should never be logged
    const sensitiveFields = [
        'accessKeyId',
        'secretAccessKey',
        'sessionToken',
        'password',
        'secret',
        'key',
        'token',
        'credentials',
        'encrypted_credentials',
        'encryptedCredentials',
        'ciphertext',
        'plaintext',
        'iv',
        'authTag'
    ];

    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
        const lowerKey = key.toLowerCase();
        if (sensitiveFields.some(field => lowerKey.includes(field.toLowerCase()))) {
            sanitized[key] = '[REDACTED]';
        } else if (typeof value === 'object' && value !== null) {
            sanitized[key] = sanitizeLogData(value);
        } else {
            sanitized[key] = value;
        }
    }
    return sanitized;
}

function getEncryptionKey() {
    if (encryptionKey) {
        return encryptionKey;
    }

    const envKey = process.env.ENCRYPTION_KEY;

    if (!envKey) {
        throw new Error(
            'ENCRYPTION_KEY environment variable is not set. ' +
            'Generate a 32-byte hex key: openssl rand -hex 32'
        );
    }

    if (!/^[a-fA-F0-9]{64}$/.test(envKey)) {
        throw new Error(
            'ENCRYPTION_KEY must be exactly 64 hexadecimal characters (32 bytes). ' +
            'Generate with: openssl rand -hex 32'
        );
    }

    encryptionKey = Buffer.from(envKey, 'hex');

    if (encryptionKey.length !== KEY_LENGTH) {
        throw new Error(`Encryption key must be ${KEY_LENGTH} bytes`);
    }

    secureLog.info('Encryption key initialized successfully');
    return encryptionKey;
}

function generateIV() {
    return crypto.randomBytes(IV_LENGTH);
}

function encrypt(data) {
    try {
        const key = getEncryptionKey();
        const iv = generateIV();

        const plaintext = typeof data === 'object' 
            ? JSON.stringify(data) 
            : String(data);

        const cipher = crypto.createCipheriv(ALGORITHM, key, iv, {
            authTagLength: AUTH_TAG_LENGTH
        });

        const encrypted = Buffer.concat([
            cipher.update(plaintext, 'utf8'),
            cipher.final()
        ]);

        const authTag = cipher.getAuthTag();
        const combined = Buffer.concat([encrypted, authTag]);

        secureLog.info('Data encrypted successfully', {
            ivLength: iv.length,
            ciphertextLength: combined.length
        });

        return {
            ciphertext: combined.toString('base64'),
            iv: iv.toString('base64')
        };
    } catch (error) {
        secureLog.error('Encryption failed', error);
        throw new Error('Failed to encrypt data');
    }
}

function decrypt(ciphertext, iv, parseJson = true) {
    try {
        const key = getEncryptionKey();

        const combined = Buffer.from(ciphertext, 'base64');
        const ivBuffer = Buffer.from(iv, 'base64');

        if (ivBuffer.length !== IV_LENGTH) {
            throw new Error('Invalid IV length');
        }

        if (combined.length < AUTH_TAG_LENGTH) {
            throw new Error('Invalid ciphertext length');
        }

        const encryptedData = combined.subarray(0, -AUTH_TAG_LENGTH);
        const authTag = combined.subarray(-AUTH_TAG_LENGTH);

        const decipher = crypto.createDecipheriv(ALGORITHM, key, ivBuffer, {
            authTagLength: AUTH_TAG_LENGTH
        });

        decipher.setAuthTag(authTag);

        const decrypted = Buffer.concat([
            decipher.update(encryptedData),
            decipher.final()
        ]);

        const plaintext = decrypted.toString('utf8');

        secureLog.info('Data decrypted successfully');

        if (parseJson) {
            try {
                return JSON.parse(plaintext);
            } catch {
                return plaintext;
            }
        }

        return plaintext;
    } catch (error) {
        secureLog.error('Decryption failed', { errorType: error.name });
        throw new Error('Failed to decrypt data: authentication failed or data corrupted');
    }
}

function validateConfiguration() {
    try {
        getEncryptionKey();
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function encryptCredentials(credentials) {
    if (!credentials || typeof credentials !== 'object') {
        throw new Error('Credentials must be an object');
    }

    if (!credentials.accessKeyId || typeof credentials.accessKeyId !== 'string') {
        throw new Error('accessKeyId is required and must be a string');
    }

    if (!credentials.secretAccessKey || typeof credentials.secretAccessKey !== 'string') {
        throw new Error('secretAccessKey is required and must be a string');
    }

    if (!/^(AKIA|ASIA)[A-Z0-9]{16}$/.test(credentials.accessKeyId)) {
        throw new Error('Invalid accessKeyId format');
    }

    const credentialData = {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey
    };

    if (credentials.sessionToken) {
        if (typeof credentials.sessionToken !== 'string') {
            throw new Error('sessionToken must be a string');
        }
        credentialData.sessionToken = credentials.sessionToken;
    }

    secureLog.info('Encrypting credentials', { 
        hasSessionToken: !!credentials.sessionToken 
    });

    return encrypt(credentialData);
}

function decryptCredentials(ciphertext, iv) {
    const credentials = decrypt(ciphertext, iv, true);

    if (!credentials || typeof credentials !== 'object') {
        throw new Error('Invalid credential structure after decryption');
    }

    if (!credentials.accessKeyId || !credentials.secretAccessKey) {
        throw new Error('Missing required credential fields after decryption');
    }

    secureLog.info('Credentials decrypted successfully', {
        hasSessionToken: !!credentials.sessionToken
    });

    return credentials;
}

function rotateEncryption(ciphertext, iv, oldKeyHex) {
    try {
        if (!/^[a-fA-F0-9]{64}$/.test(oldKeyHex)) {
            throw new Error('Invalid old key format');
        }

        const oldKey = Buffer.from(oldKeyHex, 'hex');
        const combined = Buffer.from(ciphertext, 'base64');
        const ivBuffer = Buffer.from(iv, 'base64');
        const encryptedData = combined.subarray(0, -AUTH_TAG_LENGTH);
        const authTag = combined.subarray(-AUTH_TAG_LENGTH);

        const decipher = crypto.createDecipheriv(ALGORITHM, oldKey, ivBuffer, {
            authTagLength: AUTH_TAG_LENGTH
        });
        decipher.setAuthTag(authTag);

        const decrypted = Buffer.concat([
            decipher.update(encryptedData),
            decipher.final()
        ]);

        const plaintext = decrypted.toString('utf8');
        const result = encrypt(JSON.parse(plaintext));

        secureLog.info('Encryption key rotated successfully');

        return result;
    } catch (error) {
        secureLog.error('Key rotation failed', error);
        throw new Error('Failed to rotate encryption key');
    }
}

function generateEncryptionKey() {
    return crypto.randomBytes(KEY_LENGTH).toString('hex');
}

function clearKeyCache() {
    if (encryptionKey) {
        encryptionKey.fill(0);
        encryptionKey = null;
    }
    secureLog.info('Encryption key cache cleared');
}

module.exports = {
    encrypt,
    decrypt,
    encryptCredentials,
    decryptCredentials,
    validateConfiguration,
    rotateEncryption,
    generateEncryptionKey,
    clearKeyCache,
    _testing: {
        sanitizeLogData,
        generateIV,
        getEncryptionKey
    }
};
