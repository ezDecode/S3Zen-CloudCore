/**
 * BucketManager Service
 * Handles all API calls to backend bucket CRUD endpoints
 * Uses centralized token management
 */

import { getAuthToken } from './authTokenService';
import { mockBucketService } from './mockBucketService';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class BucketManagerService {
    constructor() {
        this.maxRetries = 1;
        this.retryDelay = 500;
        this.useMock = false;
    }

    async makeRequest(endpoint, options = {}, retryCount = 0) {
        // If already in mock mode, use mock directly (logic handled in wrapper methods)
        if (this.useMock) {
            throw new Error('Using mock service');
        }

        try {
            const token = await getAuthToken();

            if (!token) {
                throw new Error('Invalid authentication token. Please sign in again.');
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
                console.warn('[BucketService] Got 401, attempting token refresh and retry');
                const newToken = await getAuthToken(true); // Force refresh

                if (newToken) {
                    return this.makeRequest(endpoint, options, retryCount + 1);
                }
                throw new Error('Invalid authentication token. Please sign in again.');
            }

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.error?.message || error.message || `API error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.warn(`[BucketService] Request to ${endpoint} failed:`, error);

            // Check if it's a connection error or uninitialized database
            if (
                error.message.includes('Failed to fetch') ||
                error.message.includes('Network error') ||
                error.message.includes('initialized') ||
                error.message.includes('configurations')
            ) {
                console.log('[BucketService] Backend issue or uninitialized DB, switching to LocalStorage Mock Service');
                this.useMock = true;
                throw new Error('SWITCH_TO_MOCK');
            }
            throw error;
        }
    }

    // Get all buckets for current user
    async getBuckets() {
        try {
            return await this.makeRequest('/api/buckets');
        } catch (e) {
            if (e.message === 'SWITCH_TO_MOCK' || this.useMock) return mockBucketService.getBuckets();
            throw e;
        }
    }

    // Get single bucket metadata
    async getBucket(bucketId) {
        try {
            return await this.makeRequest(`/api/buckets/${bucketId}`);
        } catch (e) {
            if (e.message === 'SWITCH_TO_MOCK' || this.useMock) {
                const { buckets } = mockBucketService.getBuckets();
                const bucket = buckets.find(b => b.id === bucketId);
                return { success: true, bucket };
            }
            throw e;
        }
    }

    // Get default bucket
    async getDefaultBucket() {
        try {
            return await this.makeRequest('/api/buckets/default');
        } catch (e) {
            if (e.message === 'SWITCH_TO_MOCK' || this.useMock) {
                const { buckets } = mockBucketService.getBuckets();
                return { success: true, bucket: buckets[0] }; // Return first as default
            }
            throw e;
        }
    }

    // Get bucket credentials (encrypted)
    async getBucketCredentials(bucketId) {
        try {
            return await this.makeRequest(`/api/buckets/${bucketId}/credentials`);
        } catch (e) {
            if (e.message === 'SWITCH_TO_MOCK' || this.useMock) return mockBucketService.getCredentials(bucketId);
            throw e;
        }
    }

    // Create new bucket
    async createBucket(data) {
        try {
            return await this.makeRequest('/api/buckets', {
                method: 'POST',
                body: JSON.stringify(data)
            });
        } catch (e) {
            if (e.message === 'SWITCH_TO_MOCK' || this.useMock) return mockBucketService.saveBucket(data);
            throw e;
        }
    }

    // Update bucket
    async updateBucket(bucketId, data) {
        try {
            return await this.makeRequest(`/api/buckets/${bucketId}`, {
                method: 'PUT',
                body: JSON.stringify(data)
            });
        } catch (e) {
            if (e.message === 'SWITCH_TO_MOCK' || this.useMock) return mockBucketService.updateBucket(bucketId, data);
            throw e;
        }
    }

    // Delete bucket
    async deleteBucket(bucketId) {
        try {
            return await this.makeRequest(`/api/buckets/${bucketId}`, {
                method: 'DELETE'
            });
        } catch (e) {
            if (e.message === 'SWITCH_TO_MOCK' || this.useMock) return mockBucketService.deleteBucket(bucketId);
            throw e;
        }
    }

    // Validate bucket access before saving
    async validateBucket(data) {
        // We use client-side validation now mostly, but keep this for compat
        try {
            return await this.makeRequest('/api/buckets/validate', {
                method: 'POST',
                body: JSON.stringify(data)
            });
        } catch (e) {
            if (e.message === 'SWITCH_TO_MOCK' || this.useMock) return { success: true }; // Skip backend validation in mock
            throw e;
        }
    }

    // Get bucket count for current user
    async getBucketCount() {
        try {
            return await this.makeRequest('/api/buckets/count');
        } catch (e) {
            if (e.message === 'SWITCH_TO_MOCK' || this.useMock) {
                const { buckets } = mockBucketService.getBuckets();
                return { count: buckets.length };
            }
            throw e;
        }
    }

    // Alias: Get user's buckets (for simplified UI)
    async getUserBuckets() {
        return this.getBuckets();
    }

    // Simplified add bucket method for the new UI
    async addBucket(data) {
        const bucketData = {
            bucketName: data.bucketName,
            displayName: data.displayName || data.bucketName, // Use bucket name as display name if not provided
            accessKeyId: data.accessKeyId,
            secretAccessKey: data.secretAccessKey,
            region: data.region || 'eu-north-1',
            isDefault: data.isDefault !== false
        };
        return this.createBucket(bucketData);
    }
}

export default new BucketManagerService();

