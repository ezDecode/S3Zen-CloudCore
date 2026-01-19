/**
 * Links API Module
 * Handles URL shortening
 */

import { apiRequest, API_BASE } from './client.js';

export const links = {
    /**
     * Create a short URL
     * @param {Object} data - Link data
     * @param {string} data.url - URL to shorten
     * @param {string} data.s3Bucket - S3 bucket name (for permanent links)
     * @param {string} data.s3Key - S3 object key (for permanent links)
     * @param {string} data.s3Region - S3 region (for permanent links)
     * @param {boolean} data.permanent - Make link permanent
     */
    shorten: async (data) => {
        try {
            // This endpoint doesn't require auth
            const response = await fetch(`${API_BASE}/shorten`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                return { success: false, error: error.error || 'Failed to shorten URL' };
            }

            const result = await response.json();
            return { success: true, shortUrl: result.shortUrl, shortCode: result.shortCode };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
};
