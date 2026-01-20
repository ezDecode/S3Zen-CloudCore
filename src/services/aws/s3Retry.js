/**
 * S3 Retry Utilities
 * 
 * Provides retry logic with exponential backoff and jitter for AWS S3 operations.
 * Improves reliability for transient failures and network issues.
 */

// Default retry configuration
const DEFAULT_CONFIG = {
    maxAttempts: 3,
    baseDelayMs: 200,
    maxDelayMs: 10000,
    jitterFactor: 0.2, // 20% jitter
    retryableErrors: [
        'NetworkingError',
        'TimeoutError',
        'ThrottlingException',
        'ProvisionedThroughputExceededException',
        'RequestTimeout',
        'ServiceUnavailable',
        'InternalError',
        'SlowDown',
        'ECONNRESET',
        'ETIMEDOUT',
        'ENOTFOUND',
        'EPIPE',
    ],
    retryableStatusCodes: [408, 429, 500, 502, 503, 504],
};

/**
 * Calculate delay with exponential backoff and jitter
 */
const calculateDelay = (attempt, config) => {
    const { baseDelayMs, maxDelayMs, jitterFactor } = config;

    // Exponential backoff: delay = base * 2^attempt
    const exponentialDelay = baseDelayMs * Math.pow(2, attempt);

    // Cap at max delay
    const cappedDelay = Math.min(exponentialDelay, maxDelayMs);

    // Add jitter (randomize ± jitterFactor%)
    const jitter = cappedDelay * jitterFactor * (Math.random() * 2 - 1);

    return Math.max(0, cappedDelay + jitter);
};

/**
 * Check if an error is retryable
 */
const isRetryable = (error, config) => {
    const { retryableErrors, retryableStatusCodes } = config;

    // Check error name/code
    if (retryableErrors.includes(error.name) || retryableErrors.includes(error.code)) {
        return true;
    }

    // Check HTTP status code
    const statusCode = error.$metadata?.httpStatusCode || error.statusCode;
    if (statusCode && retryableStatusCodes.includes(statusCode)) {
        return true;
    }

    // Check for network errors
    if (error.message?.includes('NetworkingError') ||
        error.message?.includes('timeout') ||
        error.message?.includes('ECONNRESET')) {
        return true;
    }

    return false;
};

/**
 * Sleep for a given duration
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Execute an S3 operation with retry logic
 * 
 * @param {Function} operation - Async function to execute
 * @param {Object} options - Retry options
 * @returns {Promise} - Result of the operation
 */
export const withRetry = async (operation, options = {}) => {
    const config = { ...DEFAULT_CONFIG, ...options };
    const { maxAttempts, onRetry } = config;

    let lastError;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error;

            // Check if we should retry
            const canRetry = attempt < maxAttempts - 1 && isRetryable(error, config);

            if (!canRetry) {
                throw error;
            }

            // Calculate delay
            const delay = calculateDelay(attempt, config);

            // Log retry attempt
            console.warn(`[S3Retry] Attempt ${attempt + 1}/${maxAttempts} failed:`, {
                error: error.name || error.code,
                message: error.message,
                retryIn: `${delay.toFixed(0)}ms`
            });

            // Call retry callback if provided
            onRetry?.({ attempt, error, delay });

            // Wait before retrying
            await sleep(delay);
        }
    }

    throw lastError;
};

/**
 * Create an enhanced S3 client wrapper with built-in retry
 * 
 * @param {S3Client} client - AWS S3 Client instance
 * @param {Object} retryConfig - Retry configuration
 * @returns {Object} - Enhanced client with retry methods
 */
export const createRetryableClient = (client, retryConfig = {}) => {
    const config = { ...DEFAULT_CONFIG, ...retryConfig };

    return {
        /**
         * Send a command with automatic retry
         */
        send: async (command) => {
            return withRetry(() => client.send(command), config);
        },

        /**
         * Get the underlying client
         */
        getClient: () => client,

        /**
         * Update retry configuration
         */
        setRetryConfig: (newConfig) => {
            Object.assign(config, newConfig);
        }
    };
};

/**
 * Retry decorator for async functions
 * 
 * @param {Object} options - Retry options
 * @returns {Function} - Decorator function
 */
export const retryable = (options = {}) => {
    return (fn) => {
        return async (...args) => {
            return withRetry(() => fn(...args), options);
        };
    };
};

export default {
    withRetry,
    createRetryableClient,
    retryable,
    DEFAULT_CONFIG,
};
