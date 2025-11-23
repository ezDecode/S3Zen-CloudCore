/**
 * Authentication Utilities
 * Handles AWS credentials storage and session management
 */

const STORAGE_KEYS = {
    CREDENTIALS: 'cloudcore_aws_credentials',
    SESSION_TIMESTAMP: 'cloudcore_session_timestamp',
    BUCKET_NAME: 'cloudcore_bucket_name',
    REGION: 'cloudcore_region'
};

const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Save AWS credentials to localStorage
 */
export const saveCredentials = (credentials) => {
    try {
        localStorage.setItem(STORAGE_KEYS.CREDENTIALS, JSON.stringify(credentials));
        localStorage.setItem(STORAGE_KEYS.SESSION_TIMESTAMP, Date.now().toString());
        return true;
    } catch (error) {
        console.error('Failed to save credentials:', error);
        return false;
    }
};

/**
 * Get stored AWS credentials
 */
export const getCredentials = () => {
    try {
        const credentials = localStorage.getItem(STORAGE_KEYS.CREDENTIALS);
        return credentials ? JSON.parse(credentials) : null;
    } catch (error) {
        console.error('Failed to get credentials:', error);
        return null;
    }
};

/**
 * Save bucket configuration
 */
export const saveBucketConfig = (bucketName, region) => {
    try {
        localStorage.setItem(STORAGE_KEYS.BUCKET_NAME, bucketName);
        localStorage.setItem(STORAGE_KEYS.REGION, region);
        return true;
    } catch (error) {
        console.error('Failed to save bucket config:', error);
        return false;
    }
};

/**
 * Get stored bucket configuration
 */
export const getBucketConfig = () => {
    try {
        const bucketName = localStorage.getItem(STORAGE_KEYS.BUCKET_NAME);
        const region = localStorage.getItem(STORAGE_KEYS.REGION);
        return bucketName && region ? { bucketName, region } : null;
    } catch (error) {
        console.error('Failed to get bucket config:', error);
        return null;
    }
};

/**
 * Clear all stored credentials and session data
 */
export const clearAuth = () => {
    try {
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        return true;
    } catch (error) {
        console.error('Failed to clear auth:', error);
        return false;
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
 * Update session timestamp
 */
export const updateSessionTimestamp = () => {
    try {
        localStorage.setItem(STORAGE_KEYS.SESSION_TIMESTAMP, Date.now().toString());
        return true;
    } catch (error) {
        console.error('Failed to update session timestamp:', error);
        return false;
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
