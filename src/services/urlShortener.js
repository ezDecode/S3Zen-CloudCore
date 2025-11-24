/**
 * URL Shortener Service
 * Service to interact with the URL shortener backend
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

/**
 * Shorten a long URL using the backend URL shortener
 * @param {string} longUrl - The long URL to shorten
 * @returns {Promise<{success: boolean, shortUrl?: string, error?: string}>}
 */
export async function shortenUrl(longUrl) {
    try {
        const response = await fetch(`${BACKEND_URL}/shorten`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: longUrl }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return {
                success: false,
                error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
            };
        }

        const data = await response.json();
        return {
            success: true,
            shortUrl: data.shortUrl,
        };
    } catch (error) {
        console.error('URL shortener error:', error);
        return {
            success: false,
            error: error.message || 'Failed to connect to URL shortener service',
        };
    }
}

/**
 * Get statistics for all shortened URLs (requires admin API key)
 * @returns {Promise<{success: boolean, stats?: Array, error?: string}>}
 */
export async function getUrlStats() {
    try {
        const apiKey = import.meta.env.VITE_ADMIN_API_KEY;

        if (!apiKey) {
            return {
                success: false,
                error: 'Admin API key not configured',
            };
        }

        const response = await fetch(`${BACKEND_URL}/stats`, {
            method: 'GET',
            headers: {
                'x-api-key': apiKey,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return {
                success: false,
                error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
            };
        }

        const data = await response.json();
        return {
            success: true,
            stats: data.urls,
        };
    } catch (error) {
        console.error('Get stats error:', error);
        return {
            success: false,
            error: error.message || 'Failed to fetch URL statistics',
        };
    }
}
