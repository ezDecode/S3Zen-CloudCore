/**
 * BucketManager Service
 * Handles all API calls to backend bucket CRUD endpoints
 * Includes JWT token management with retry logic
 */

import { supabaseAuth } from './supabaseClient';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class BucketManagerService {
    constructor() {
        this.maxRetries = 1;
        this.retryDelay = 500;
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
        try {
            const token = await this.getAuthToken();
            
            if (!token) {
                const error = new Error('Authentication required. Please sign in again.');
                error.code = 'NO_AUTH_TOKEN';
                throw error;
            }
            
            console.log(`[BucketService] Making request to ${endpoint}`);
            
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
                
                // Handle 401 with retry logic
                if (response.status === 401 && retryCount < this.maxRetries) {
                    console.warn(`[BucketService] 401 received, retrying (${retryCount + 1}/${this.maxRetries})...`);
                    
                    // Wait before retry
                    await new Promise(resolve => setTimeout(resolve, this.retryDelay));
                    
                    // Force token refresh
                    await supabaseAuth.refreshSession();
                    
                    // Retry request
                    return this.makeRequest(endpoint, options, retryCount + 1);
                }
                
                if (response.status === 401) {
                    const authError = new Error(error.error?.message || 'Authentication failed');
                    authError.code = 'UNAUTHORIZED';
                    authError.status = 401;
                    throw authError;
                }
                
                throw new Error(error.error?.message || error.message || `API error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            // Don't retry on non-auth errors
            if (error.code !== 'UNAUTHORIZED' || retryCount >= this.maxRetries) {
                console.error('[BucketService] Request failed:', error.message);
                throw error;
            }
            
            // This shouldn't be reached, but just in case
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
