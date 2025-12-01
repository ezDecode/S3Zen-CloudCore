/**
 * Standardized Error Handling Utilities
 * Provides consistent error handling patterns across the application
 * 
 * PATTERN: All async operations should return { success: boolean, data?: any, error?: string }
 */

/**
 * Standard error response format
 * @typedef {Object} ErrorResponse
 * @property {boolean} success - Always false for errors
 * @property {string} error - Human-readable error message
 * @property {string} [code] - Optional error code for programmatic handling
 * @property {any} [details] - Optional additional error details
 */

/**
 * Standard success response format
 * @typedef {Object} SuccessResponse
 * @property {boolean} success - Always true for success
 * @property {any} [data] - Optional response data
 * @property {string} [message] - Optional success message
 */

/**
 * Wrap an async function with standardized error handling
 * @param {Function} fn - Async function to wrap
 * @param {string} [context] - Context for error messages
 * @returns {Function} Wrapped function that returns standardized response
 */
export const withErrorHandling = (fn, context = 'Operation') => {
    return async (...args) => {
        try {
            const result = await fn(...args);
            
            // If result is already in standard format, return it
            if (typeof result === 'object' && 'success' in result) {
                return result;
            }
            
            // Otherwise, wrap in success response
            return {
                success: true,
                data: result
            };
        } catch (error) {
            console.error(`${context} failed:`, error);
            
            return {
                success: false,
                error: error.message || `${context} failed`,
                code: error.code,
                details: error.details
            };
        }
    };
};

/**
 * Create a standardized error response
 * @param {string} message - Error message
 * @param {string} [code] - Error code
 * @param {any} [details] - Additional details
 * @returns {ErrorResponse}
 */
export const createError = (message, code = null, details = null) => {
    const error = {
        success: false,
        error: message
    };
    
    if (code) error.code = code;
    if (details) error.details = details;
    
    return error;
};

/**
 * Create a standardized success response
 * @param {any} [data] - Response data
 * @param {string} [message] - Success message
 * @returns {SuccessResponse}
 */
export const createSuccess = (data = null, message = null) => {
    const response = {
        success: true
    };
    
    if (data !== null) response.data = data;
    if (message) response.message = message;
    
    return response;
};

/**
 * Handle AWS SDK errors with user-friendly messages
 * @param {Error} error - AWS SDK error
 * @returns {ErrorResponse}
 */
export const handleAWSError = (error) => {
    const errorMap = {
        'NoSuchBucket': 'Bucket not found',
        'AccessDenied': 'Access denied to bucket',
        'InvalidAccessKeyId': 'Invalid access key',
        'SignatureDoesNotMatch': 'Invalid secret key',
        'NetworkingError': 'Network error - check your connection',
        'TimeoutError': 'Request timed out',
        'ThrottlingException': 'Too many requests - please slow down',
    };
    
    const message = errorMap[error.name] || error.message || 'AWS operation failed';
    
    return createError(message, error.name, {
        statusCode: error.$metadata?.httpStatusCode,
        requestId: error.$metadata?.requestId
    });
};

/**
 * Handle network errors
 * @param {Error} error - Network error
 * @returns {ErrorResponse}
 */
export const handleNetworkError = (error) => {
    if (!navigator.onLine) {
        return createError('No internet connection', 'OFFLINE');
    }
    
    if (error.name === 'AbortError') {
        return createError('Request cancelled', 'CANCELLED');
    }
    
    return createError('Network error - please try again', 'NETWORK_ERROR');
};

/**
 * Validate response and convert to standard format
 * @param {Response} response - Fetch API response
 * @returns {Promise<SuccessResponse|ErrorResponse>}
 */
export const validateResponse = async (response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return createError(
            errorData.error || `HTTP ${response.status}: ${response.statusText}`,
            `HTTP_${response.status}`
        );
    }
    
    const data = await response.json().catch(() => null);
    return createSuccess(data);
};

/**
 * Retry an operation with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} baseDelay - Base delay in ms
 * @returns {Promise<any>}
 */
export const withRetry = async (fn, maxRetries = 3, baseDelay = 1000) => {
    let lastError;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            
            if (attempt < maxRetries) {
                const delay = baseDelay * Math.pow(2, attempt);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    
    throw lastError;
};

/**
 * Error codes for programmatic handling
 */
export const ERROR_CODES = {
    // Network errors
    OFFLINE: 'OFFLINE',
    NETWORK_ERROR: 'NETWORK_ERROR',
    TIMEOUT: 'TIMEOUT',
    CANCELLED: 'CANCELLED',
    
    // Auth errors
    INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
    SESSION_EXPIRED: 'SESSION_EXPIRED',
    ACCESS_DENIED: 'ACCESS_DENIED',
    
    // AWS errors
    BUCKET_NOT_FOUND: 'NoSuchBucket',
    INVALID_ACCESS_KEY: 'InvalidAccessKeyId',
    INVALID_SECRET_KEY: 'SignatureDoesNotMatch',
    THROTTLED: 'ThrottlingException',
    
    // Validation errors
    INVALID_INPUT: 'INVALID_INPUT',
    FILE_TOO_LARGE: 'FILE_TOO_LARGE',
    INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
    
    // Generic errors
    UNKNOWN_ERROR: 'UNKNOWN_ERROR',
};

export default {
    withErrorHandling,
    createError,
    createSuccess,
    handleAWSError,
    handleNetworkError,
    validateResponse,
    withRetry,
    ERROR_CODES,
};
