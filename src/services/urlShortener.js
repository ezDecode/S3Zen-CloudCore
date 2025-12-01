/**
 * URL Shortener Service
 * Service to interact with the URL shortener backend
 */

// FIXED: Better production fallback handling
const getBackendUrl = () => {
    const envUrl = import.meta.env.VITE_BACKEND_URL;
    
    // In production, require environment variable
    if (import.meta.env.PROD && !envUrl) {
        console.error('VITE_BACKEND_URL not configured for production');
        throw new Error('Backend URL not configured');
    }
    
    // Development fallback
    return envUrl || 'http://localhost:3000';
};

const BACKEND_URL = getBackendUrl();

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

// REMOVED: getUrlStats function - backend endpoint not implemented
// If stats functionality is needed in the future, implement the backend endpoint first
