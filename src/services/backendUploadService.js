/**
 * Backend Upload Service
 * Uploads files through the backend for compression and processing
 */

import { supabase } from '../../lib/supabase';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

/**
 * Upload file via backend (with compression for images)
 * @param {File} file - File to upload
 * @param {Object} options - Upload options
 * @param {string} options.bucketId - Specific bucket ID (optional)
 * @param {boolean} options.makePublic - Make file public (optional)
 * @param {Function} options.onProgress - Progress callback
 * @returns {Promise<{success: boolean, file?: Object, error?: string}>}
 */
export async function uploadViaBackend(file, options = {}) {
    const { bucketId, makePublic, onProgress } = options;

    try {
        // Get auth token
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
            return { success: false, error: 'Not authenticated' };
        }

        // Create form data
        const formData = new FormData();
        formData.append('file', file);
        if (bucketId) formData.append('bucketId', bucketId);
        if (makePublic) formData.append('makePublic', 'true');

        // Use XMLHttpRequest for progress tracking
        return new Promise((resolve) => {
            const xhr = new XMLHttpRequest();

            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable && onProgress) {
                    onProgress({ loaded: e.loaded, total: e.total, percentage: (e.loaded / e.total) * 100 });
                }
            };

            xhr.onload = () => {
                try {
                    const response = JSON.parse(xhr.responseText);
                    if (xhr.status === 200 && response.success) {
                        resolve({ success: true, file: response.file });
                    } else {
                        resolve({ success: false, error: response.error?.message || 'Upload failed' });
                    }
                } catch {
                    resolve({ success: false, error: 'Invalid response' });
                }
            };

            xhr.onerror = () => resolve({ success: false, error: 'Network error' });
            xhr.ontimeout = () => resolve({ success: false, error: 'Upload timeout' });

            xhr.open('POST', `${BACKEND_URL}/api/files/upload`);
            xhr.setRequestHeader('Authorization', `Bearer ${session.access_token}`);
            xhr.timeout = 5 * 60 * 1000; // 5 min timeout
            xhr.send(formData);
        });
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Check if backend upload is available
 */
export async function isBackendAvailable() {
    try {
        const res = await fetch(`${BACKEND_URL}/health`, { method: 'GET' });
        return res.ok;
    } catch {
        return false;
    }
}
