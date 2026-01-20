/**
 * BucketManager Service
 * Handles all API calls to backend bucket CRUD endpoints
 * Includes JWT token management with retry logic
 */

import { supabaseAuth } from './supabaseClient';
import { mockBucketService } from './mockBucketService';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class BucketManagerService {
    constructor() {
        this.maxRetries = 1;
        this.retryDelay = 500;
        this.useMock = false;
    }
    async getAuthToken() {
        try {
            const { data: { session }, error } = await supabaseAuth.getSession();

            if (error) {
                console.error('[BucketService] Session error:', error);
                return null;
            }

            if (!session?.access_token) {
                console.warn('[BucketService] No access token in session');
                return null;
            }

            // Log token info for debugging (first/last 10 chars only)
            const tokenPreview = `${session.access_token.substring(0, 10)}...${session.access_token.substring(session.access_token.length - 10)}`;
            console.log('[BucketService] Token retrieved:', tokenPreview, 'expires:', new Date(session.expires_at * 1000).toISOString());

            // Verify token hasn't expired
            const expiresAt = session.expires_at;
            if (expiresAt && Date.now() / 1000 > expiresAt) {
                console.warn('[BucketService] Token expired, attempting refresh');
                const { data: { session: refreshedSession }, error: refreshError } = await supabaseAuth.refreshSession();

                if (refreshError || !refreshedSession?.access_token) {
                    console.error('[BucketService] Token refresh failed:', refreshError);
                    return null;
                }

                console.log('[BucketService] Token refreshed successfully');
                return refreshedSession.access_token;
            }

            return session.access_token;
        } catch (error) {
            console.error('[BucketService] Failed to get auth token:', error);
            return null;
        }
    }

    async makeRequest(endpoint, options = {}, retryCount = 0) {
        // If already in mock mode, use mock directly (logic handled in wrapper methods)
        if (this.useMock) {
            throw new Error('Using mock service');
        }

        try {
            const token = await this.getAuthToken();

            // Allow requests without token if we are testing connection or other public endpoints
            // but usually we need auth. If no token and not mock, maybe just fail?
            // For now, proceed.

            const response = await fetch(`${API_BASE}${endpoint}`, {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                // If connection refused (which fetch throws, not returns !ok usually, but let's handle 500s etc)
                // fetch only throws on network failure.
                // on 404/500 it returns response.
                const error = await response.json().catch(() => ({}));
                throw new Error(error.error?.message || error.message || `API error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.warn(`[BucketService] Request to ${endpoint} failed:`, error);

            // Check if it's a connection error (Failed to fetch)
            if (error.message.includes('Failed to fetch') || error.message.includes('Network error')) {
                console.log('[BucketService] Backend unreachable, switching to LocalStorage Mock Service');
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
            bucket_name: data.bucketName,
            access_key_id: data.accessKeyId,
            secret_access_key: data.secretAccessKey,
            region: data.region || 'us-east-1',
            is_default: data.isDefault !== false
        };
        return this.createBucket(bucketData);
    }
}

export default new BucketManagerService();

