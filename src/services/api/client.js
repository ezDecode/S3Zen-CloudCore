/**
 * API Client Module
 * Base HTTP client with authentication handling
 */

import { supabase } from '../../lib/supabase';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Get auth token from Supabase session
 */
const getAuthToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.access_token) {
        console.warn('[API] No access token');
        return null;
    }

    // Check expiry
    if (session.expires_at && Date.now() / 1000 > session.expires_at) {
        const { data: { session: refreshed } } = await supabase.auth.refreshSession();
        return refreshed?.access_token || null;
    }

    return session.access_token;
};

/**
 * Make authenticated API request
 */
export const apiRequest = async (endpoint, options = {}) => {
    const token = await getAuthToken();

    if (!token) {
        throw Object.assign(new Error('Authentication required'), { code: 'NO_AUTH' });
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        const err = new Error(error.error?.message || error.message || `API error: ${response.status}`);
        err.status = response.status;
        err.code = error.error?.code;
        throw err;
    }

    return response.json();
};

/**
 * Make multipart form request with progress
 */
export const apiUpload = async (endpoint, formData, onProgress) => {
    const token = await getAuthToken();

    if (!token) {
        throw Object.assign(new Error('Authentication required'), { code: 'NO_AUTH' });
    }

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable && onProgress) {
                onProgress({ loaded: e.loaded, total: e.total, percentage: (e.loaded / e.total) * 100 });
            }
        };

        xhr.onload = () => {
            try {
                const response = JSON.parse(xhr.responseText);
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(response);
                } else {
                    reject(new Error(response.error?.message || 'Upload failed'));
                }
            } catch {
                reject(new Error('Invalid response'));
            }
        };

        xhr.onerror = () => reject(new Error('Network error'));
        xhr.ontimeout = () => reject(new Error('Upload timeout'));

        xhr.open('POST', `${API_BASE}${endpoint}`);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.timeout = 5 * 60 * 1000; // 5 min
        xhr.send(formData);
    });
};

export { API_BASE };
