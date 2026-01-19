/**
 * Files API Module
 * Handles file operations via backend
 */

import { apiUpload } from './client.js';

export const files = {
    /**
     * Upload file via backend (with compression for images)
     * @param {File} file - File to upload
     * @param {Object} options - Upload options
     */
    upload: async (file, options = {}) => {
        const { bucketId, makePublic, onProgress } = options;

        const formData = new FormData();
        formData.append('file', file);
        if (bucketId) formData.append('bucketId', bucketId);
        if (makePublic) formData.append('makePublic', 'true');

        try {
            const result = await apiUpload('/api/files/upload', formData, onProgress);
            return { success: true, file: result.file };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
};
