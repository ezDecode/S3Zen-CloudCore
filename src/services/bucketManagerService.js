/**
 * BucketManager Service
 * Handles all API calls to backend bucket CRUD endpoints
 * Includes JWT token management with retry logic
 */

import { supabaseAuth } from './supabaseClient';
import { mockBucketService } from './mockBucketService';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Token refresh buffer (refresh if < 5 minutes remaining)
const TOKEN_REFRESH_BUFFER_SECONDS = 300;

class BucketManagerService {
    constructor() {
        this.maxRetries = 1;
        this.retryDelay = 500;
        this.useMock = false;
        this._refreshPromise = null; // Prevent concurrent refreshes
    }

    async getAuthToken(forceRefresh = false) {
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

            const now = Date.now() / 1000;
            const expiresAt = session.expires_at;
            const timeRemaining = expiresAt - now;

            // Log token info for debugging (first/last 10 chars only)
            const tokenPreview = `${session.access_token.substring(0, 10)}...${session.access_token.substring(session.access_token.length - 10)}`;
            console.log('[BucketService] Token retrieved:', tokenPreview, 'expires:', new Date(expiresAt * 1000).toISOString());

            // Proactively refresh if token is expired or near expiry
            if (forceRefresh || timeRemaining < TOKEN_REFRESH_BUFFER_SECONDS) {
                console.warn(`[BucketService] Token ${timeRemaining < 0 ? 'expired' : 'expiring soon'}, refreshing...`);
                return await this._refreshToken();
            }

            return session.access_token;
        } catch (error) {
            console.error('[BucketService] Failed to get auth token:', error);
            return null;
        }
    }

    async _refreshToken() {
        // Prevent concurrent refresh attempts
        if (this._refreshPromise) {
            return this._refreshPromise;
        }

        this._refreshPromise = (async () => {
            try {
                const { data: { session: refreshedSession }, error: refreshError } = await supabaseAuth.refreshSession();

                if (refreshError || !refreshedSession?.access_token) {
                    console.error('[BucketService] Token refresh failed:', refreshError);
                    return null;
                }

                console.log('[BucketService] Token refreshed successfully');
                return refreshedSession.access_token;
            } finally {
                this._refreshPromise = null;
            }
        })();

        return this._refreshPromise;
    }

    async makeRequest(endpoint, options = {}, retryCount = 0) {
        // If already in mock mode, use mock directly (logic handled in wrapper methods)
        if (this.useMock) {
            throw new Error('Using mock service');
        }

        try {
            const token = await this.getAuthToken();

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
                const newToken = await this.getAuthToken(true); // Force refresh

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

