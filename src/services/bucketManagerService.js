/**
 * BucketManager Service
 * Handles all API calls to backend bucket CRUD endpoints
 * Includes JWT token management
 */

import { supabaseAuth } from './supabaseClient';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class BucketManagerService {
    async getAuthToken() {
        try {
            const { data: { session } } = await supabaseAuth.getSession();
            if (!session?.access_token) {
                throw new Error('No active session');
            }
            return session.access_token;
        } catch (error) {
            console.error('Failed to get auth token:', error);
            throw error;
        }
    }

    async makeRequest(endpoint, options = {}) {
        try {
            const token = await this.getAuthToken();
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
                throw new Error(error.message || `API error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Request failed:', error);
            throw error;
        }
    }

    // Get all buckets for current user
    async getBuckets() {
        return this.makeRequest('/api/buckets');
    }

    // Get single bucket metadata
    async getBucket(bucketId) {
        return this.makeRequest(`/api/buckets/${bucketId}`);
    }

    // Get default bucket
    async getDefaultBucket() {
        return this.makeRequest('/api/buckets/default');
    }

    // Get bucket credentials (encrypted)
    async getBucketCredentials(bucketId) {
        return this.makeRequest(`/api/buckets/${bucketId}/credentials`);
    }

    // Create new bucket
    async createBucket(data) {
        return this.makeRequest('/api/buckets', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // Update bucket
    async updateBucket(bucketId, data) {
        return this.makeRequest(`/api/buckets/${bucketId}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    // Delete bucket
    async deleteBucket(bucketId) {
        return this.makeRequest(`/api/buckets/${bucketId}`, {
            method: 'DELETE'
        });
    }

    // Validate bucket access before saving
    async validateBucket(data) {
        return this.makeRequest('/api/buckets/validate', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
}

export default new BucketManagerService();
