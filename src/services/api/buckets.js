/**
 * Buckets API Module
 * Handles all bucket CRUD operations
 */

import { apiRequest } from './client.js';

export const buckets = {
    /** List all buckets for current user */
    list: () => apiRequest('/api/buckets'),

    /** Get single bucket by ID */
    get: (bucketId) => apiRequest(`/api/buckets/${bucketId}`),

    /** Get default bucket */
    getDefault: () => apiRequest('/api/buckets/default'),

    /** Get bucket credentials (decrypted server-side) */
    getCredentials: (bucketId) => apiRequest(`/api/buckets/${bucketId}/credentials`),

    /** Create new bucket */
    create: (data) => apiRequest('/api/buckets', {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    /** Update bucket */
    update: (bucketId, data) => apiRequest(`/api/buckets/${bucketId}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),

    /** Delete bucket */
    delete: (bucketId) => apiRequest(`/api/buckets/${bucketId}`, {
        method: 'DELETE'
    }),

    /** Validate bucket access */
    validate: (data) => apiRequest('/api/buckets/validate', {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    /** Get bucket count */
    count: () => apiRequest('/api/buckets/count')
};
