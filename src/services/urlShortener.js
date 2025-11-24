/**
 * URL Shortener Service
 * Frontend service for interacting with CloudCore URL Shortener Worker
 */

// Configuration - Update these after deploying the Worker
const SHORTENER_CONFIG = {
    // Worker URL (update after deployment)
    workerUrl: import.meta.env.VITE_SHORTENER_URL || 'https://go.cloudcore.app',

    // API Key (set in .env file for security)
    apiKey: import.meta.env.VITE_SHORTENER_API_KEY || '',

    // Timeout for requests (ms)
    timeout: 10000,
};

/**
 * Create a short URL from a long URL
 * @param {string} longUrl - The long URL to shorten (e.g., S3 presigned URL)
 * @param {number} expirySeconds - Expiry time in seconds (default: 7 days)
 * @returns {Promise<{success: boolean, shortUrl?: string, error?: string}>}
 */
export const createShortUrl = async (longUrl, expirySeconds = 604800) => {
    // Validate configuration
    if (!SHORTENER_CONFIG.workerUrl) {
        console.error('URL Shortener not configured');
        return {
            success: false,
            error: 'URL Shortener is not configured. Please set VITE_SHORTENER_URL.'
        };
    }

    if (!SHORTENER_CONFIG.apiKey) {
        console.error('Shortener API key not configured');
        return {
            success: false,
            error: 'URL Shortener API key is not configured. Please set VITE_SHORTENER_API_KEY.'
        };
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), SHORTENER_CONFIG.timeout);

        const response = await fetch(`${SHORTENER_CONFIG.workerUrl}/api/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CloudCore-API-Key': SHORTENER_CONFIG.apiKey,
            },
            body: JSON.stringify({
                longUrl,
                expirySeconds,
            }),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP ${response.status}`);
        }

        const data = await response.json();

        return {
            success: true,
            shortUrl: data.shortUrl,
            shortId: data.shortId,
            expiresAt: data.expiresAt,
            expiresIn: data.expiresIn,
        };

    } catch (error) {
        console.error('Failed to create short URL:', error);

        let errorMessage = 'Failed to create short URL';

        if (error.name === 'AbortError') {
            errorMessage = 'Request timeout - shortener service took too long to respond';
        } else if (error.message) {
            errorMessage = error.message;
        }

        return {
            success: false,
            error: errorMessage,
        };
    }
};

/**
 * Get statistics for a short URL (optional feature)
 * @param {string} shortId - The short URL ID
 * @returns {Promise<{success: boolean, stats?: object, error?: string}>}
 */
export const getShortUrlStats = async (shortId) => {
    if (!SHORTENER_CONFIG.workerUrl) {
        return {
            success: false,
            error: 'URL Shortener is not configured'
        };
    }

    try {
        const response = await fetch(`${SHORTENER_CONFIG.workerUrl}/api/stats/${shortId}`);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP ${response.status}`);
        }

        const stats = await response.json();

        return {
            success: true,
            stats,
        };

    } catch (error) {
        console.error('Failed to get short URL stats:', error);
        return {
            success: false,
            error: error.message || 'Failed to get stats',
        };
    }
};

/**
 * Check if URL shortener is configured and available
 * @returns {boolean}
 */
export const isShortenerAvailable = () => {
    return !!(SHORTENER_CONFIG.workerUrl && SHORTENER_CONFIG.apiKey);
};

/**
 * Get the shortener worker URL
 * @returns {string}
 */
export const getShortenerUrl = () => {
    return SHORTENER_CONFIG.workerUrl;
};
