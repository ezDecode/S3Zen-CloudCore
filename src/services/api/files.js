/**
 * Files API Module
 * All file operations via backend (credentials never in browser)
 */

import { apiRequest, apiUpload } from './client.js';

export const files = {
    /**
     * Upload file via backend (with compression for images)
     */
    upload: async (file, options = {}) => {
        const { bucketId, makePublic, path, onProgress } = options;

        const formData = new FormData();
        formData.append('file', file);
        if (bucketId) formData.append('bucketId', bucketId);
        if (makePublic) formData.append('makePublic', 'true');
        if (path) formData.append('path', path);

        try {
            const result = await apiUpload('/api/files/upload', formData, onProgress);
            return { success: true, file: result.file };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    /**
     * Delete files/folders
     * @param {string[]} keys - Array of S3 keys to delete
     */
    delete: async (keys, bucketId = null) => {
        try {
            const result = await apiRequest('/api/files/delete', {
                method: 'POST',
                body: JSON.stringify({ keys, bucketId })
            });
            return { success: result.success, deleted: result.deleted, failed: result.failed };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    /**
     * Rename file or folder
     */
    rename: async (oldKey, newName, bucketId = null) => {
        try {
            const result = await apiRequest('/api/files/rename', {
                method: 'POST',
                body: JSON.stringify({ oldKey, newName, bucketId })
            });
            return { success: true, newKey: result.newKey };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    /**
     * Create folder
     */
    createFolder: async (path, bucketId = null) => {
        try {
            const result = await apiRequest('/api/files/create-folder', {
                method: 'POST',
                body: JSON.stringify({ path, bucketId })
            });
            return { success: true, key: result.key };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    /**
     * Move file to different folder
     */
    move: async (sourceKey, destinationFolder, bucketId = null) => {
        try {
            const result = await apiRequest('/api/files/move', {
                method: 'POST',
                body: JSON.stringify({ sourceKey, destinationFolder, bucketId })
            });
            return { success: true, newKey: result.newKey };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    /**
     * Get upload history for cross-device sync
     * @param {Object} options - { limit, offset }
     */
    getHistory: async (options = {}) => {
        try {
            const { limit = 50, offset = 0 } = options;
            const result = await apiRequest(`/api/files/history?limit=${limit}&offset=${offset}`);
            return {
                success: true,
                files: result.files,
                total: result.total,
                limit: result.limit,
                offset: result.offset,
            };
        } catch (error) {
            return { success: false, error: error.message, files: [] };
        }
    },

    /**
     * Remove item from history (doesn't delete from S3)
     */
    removeFromHistory: async (key) => {
        try {
            await apiRequest(`/api/files/history/${encodeURIComponent(key)}`, {
                method: 'DELETE'
            });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
};
