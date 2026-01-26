/**
 * API Client Module
 * Base HTTP client with authentication handling
 */

import { getAuthToken } from '../authTokenService';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Make authenticated API request (with 401 retry)
 */
export const apiRequest = async (endpoint, options = {}, retryCount = 0) => {
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

    // Handle 401 - try refresh and retry once
    if (response.status === 401 && retryCount === 0) {
        console.warn('[API] Got 401, attempting token refresh and retry');
        const newToken = await getAuthToken(true); // Force refresh

        if (newToken) {
            return apiRequest(endpoint, options, retryCount + 1);
        }
        throw Object.assign(new Error('Authentication required'), { code: 'NO_AUTH', status: 401 });
    }

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

// ... existing code ...

const api = {
    get: (endpoint, options = {}) => apiRequest(endpoint, { ...options, method: 'GET' }),
    post: (endpoint, body, options = {}) => apiRequest(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),
    put: (endpoint, body, options = {}) => apiRequest(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),
    delete: (endpoint, options = {}) => apiRequest(endpoint, { ...options, method: 'DELETE' }),
};

export { api, API_BASE };
