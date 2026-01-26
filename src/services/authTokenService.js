/**
 * Centralized Auth Token Service
 * 
 * Single source of truth for token management across all API services.
 * Handles token retrieval, proactive refresh, and concurrent refresh prevention.
 */

import { supabaseAuth } from './supabaseClient';

// Token refresh buffer (refresh if < 5 minutes remaining)
const TOKEN_REFRESH_BUFFER_SECONDS = 300;

// Singleton to prevent concurrent refresh attempts
let refreshPromise = null;

// Cache for token expiration info
let tokenCache = {
    token: null,
    expiresAt: 0,
};

/**
 * Refresh the auth token
 * @returns {Promise<string|null>} New access token or null on failure
 */
export const refreshToken = async () => {
    if (refreshPromise) {
        return refreshPromise;
    }

    refreshPromise = (async () => {
        try {
            const { data: { session: refreshed }, error } = await supabaseAuth.refreshSession();

            if (error || !refreshed?.access_token) {
                console.error('[AuthToken] Refresh failed:', error?.message || 'No session');
                tokenCache = { token: null, expiresAt: 0 };
                return null;
            }

            // Update cache
            tokenCache = {
                token: refreshed.access_token,
                expiresAt: refreshed.expires_at,
            };

            console.log('[AuthToken] Token refreshed successfully');
            return refreshed.access_token;
        } catch (error) {
            console.error('[AuthToken] Refresh error:', error.message);
            return null;
        } finally {
            refreshPromise = null;
        }
    })();

    return refreshPromise;
};

/**
 * Get auth token with proactive refresh
 * 
 * @param {boolean} forceRefresh - Force a token refresh
 * @returns {Promise<string|null>} Access token or null
 */
export const getAuthToken = async (forceRefresh = false) => {
    try {
        const { data: { session } } = await supabaseAuth.getSession();

        if (!session?.access_token) {
            console.warn('[AuthToken] No access token in session');
            tokenCache = { token: null, expiresAt: 0 };
            return null;
        }

        const now = Date.now() / 1000;
        const expiresAt = session.expires_at;
        const timeRemaining = expiresAt - now;

        // Update cache
        tokenCache = {
            token: session.access_token,
            expiresAt: expiresAt,
        };

        // Proactively refresh if token is expired or near expiry
        if (forceRefresh || timeRemaining < TOKEN_REFRESH_BUFFER_SECONDS) {
            const status = timeRemaining < 0 ? 'expired' : 'expiring soon';
            console.warn(`[AuthToken] Token ${status} (${Math.floor(timeRemaining)}s remaining), refreshing...`);
            return await refreshToken();
        }

        return session.access_token;
    } catch (error) {
        console.error('[AuthToken] Error getting token:', error.message);
        return null;
    }
};

/**
 * Get token expiration info (useful for UI indicators)
 * @returns {{ expiresAt: number, expiresIn: number, shouldRefresh: boolean } | null}
 */
export const getTokenExpiration = () => {
    if (!tokenCache.expiresAt) return null;

    const now = Date.now() / 1000;
    const expiresIn = tokenCache.expiresAt - now;

    return {
        expiresAt: tokenCache.expiresAt,
        expiresIn: Math.max(0, expiresIn),
        expiresInSeconds: Math.floor(Math.max(0, expiresIn)),
        shouldRefresh: expiresIn < TOKEN_REFRESH_BUFFER_SECONDS,
    };
};

/**
 * Clear token cache (call on logout)
 */
export const clearTokenCache = () => {
    tokenCache = { token: null, expiresAt: 0 };
    refreshPromise = null;
    console.log('[AuthToken] Cache cleared');
};

/**
 * Check if user is authenticated
 * @returns {Promise<boolean>}
 */
export const isAuthenticated = async () => {
    const token = await getAuthToken();
    return !!token;
};

export default {
    getAuthToken,
    refreshToken,
    getTokenExpiration,
    clearTokenCache,
    isAuthenticated,
};
