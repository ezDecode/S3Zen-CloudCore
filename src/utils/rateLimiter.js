/**
 * Client-side Rate Limiter for S3 Operations
 * Prevents excessive API calls and manages AWS API limits
 * 
 * FEATURES:
 * - Token bucket algorithm for smooth rate limiting
 * - Per-operation rate limits
 * - Automatic token refill
 * - Queue management for throttled requests
 */

class RateLimiter {
    constructor(maxTokens, refillRate) {
        this.maxTokens = maxTokens;
        this.tokens = maxTokens;
        this.refillRate = refillRate; // tokens per second
        this.lastRefill = Date.now();
        this.queue = [];
    }

    /**
     * Refill tokens based on time elapsed
     */
    refill() {
        const now = Date.now();
        const elapsed = (now - this.lastRefill) / 1000; // seconds
        const tokensToAdd = elapsed * this.refillRate;
        
        this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
        this.lastRefill = now;
    }

    /**
     * Try to consume a token
     * Returns true if successful, false if rate limited
     */
    tryConsume(tokens = 1) {
        this.refill();
        
        if (this.tokens >= tokens) {
            this.tokens -= tokens;
            return true;
        }
        
        return false;
    }

    /**
     * Wait until tokens are available
     * Returns a promise that resolves when operation can proceed
     */
    async waitForToken(tokens = 1) {
        return new Promise((resolve) => {
            const attempt = () => {
                if (this.tryConsume(tokens)) {
                    resolve();
                } else {
                    // Calculate wait time
                    const tokensNeeded = tokens - this.tokens;
                    const waitTime = (tokensNeeded / this.refillRate) * 1000;
                    setTimeout(attempt, Math.min(waitTime, 100)); // Check at least every 100ms
                }
            };
            attempt();
        });
    }

    /**
     * Get current token count
     */
    getTokens() {
        this.refill();
        return this.tokens;
    }
}

// Rate limiters for different S3 operations
// AWS S3 limits: 3,500 PUT/COPY/POST/DELETE per second, 5,500 GET/HEAD per second
const limiters = {
    // List operations: 10 per second (conservative)
    list: new RateLimiter(10, 2),
    
    // Upload operations: 20 per second (allows bursts)
    upload: new RateLimiter(20, 5),
    
    // Download operations: 30 per second
    download: new RateLimiter(30, 10),
    
    // Delete operations: 20 per second
    delete: new RateLimiter(20, 5),
    
    // Copy/rename operations: 15 per second
    copy: new RateLimiter(15, 3),
};

/**
 * Rate limit an S3 operation
 * @param {string} operation - Operation type (list, upload, download, delete, copy)
 * @param {Function} fn - Function to execute
 * @param {number} tokens - Number of tokens to consume (default: 1)
 * @returns {Promise} Result of the function
 */
export const rateLimitOperation = async (operation, fn, tokens = 1) => {
    const limiter = limiters[operation];
    
    if (!limiter) {
        console.warn(`Unknown operation type: ${operation}`);
        return fn();
    }
    
    // Wait for rate limit
    await limiter.waitForToken(tokens);
    
    // Execute operation
    return fn();
};

/**
 * Check if operation can proceed without waiting
 * @param {string} operation - Operation type
 * @param {number} tokens - Number of tokens needed
 * @returns {boolean} True if operation can proceed
 */
export const canProceed = (operation, tokens = 1) => {
    const limiter = limiters[operation];
    if (!limiter) return true;
    
    return limiter.getTokens() >= tokens;
};

/**
 * Get current rate limit status
 * @param {string} operation - Operation type
 * @returns {Object} Status object with tokens and percentage
 */
export const getRateLimitStatus = (operation) => {
    const limiter = limiters[operation];
    if (!limiter) return null;
    
    const tokens = limiter.getTokens();
    const percentage = (tokens / limiter.maxTokens) * 100;
    
    return {
        tokens: Math.floor(tokens),
        maxTokens: limiter.maxTokens,
        percentage: Math.floor(percentage),
        available: tokens >= 1
    };
};

/**
 * Reset all rate limiters (useful for testing)
 */
export const resetRateLimiters = () => {
    Object.values(limiters).forEach(limiter => {
        limiter.tokens = limiter.maxTokens;
        limiter.lastRefill = Date.now();
    });
};

export default rateLimitOperation;
