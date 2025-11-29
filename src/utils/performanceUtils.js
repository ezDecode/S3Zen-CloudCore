/**
 * Performance Monitoring Utilities
 * Track and optimize application performance
 */

/**
 * Measure execution time of async operations
 */
export const measurePerformance = async (name, operation) => {
    const startTime = performance.now();
    try {
        const result = await operation();
        const duration = performance.now() - startTime;
        console.log(`⚡ ${name}: ${duration.toFixed(2)}ms`);
        return result;
    } catch (error) {
        const duration = performance.now() - startTime;
        console.error(`❌ ${name} failed after ${duration.toFixed(2)}ms:`, error);
        throw error;
    }
};

/**
 * Batch processor with concurrency control
 * Processes items in parallel batches for optimal throughput
 */
export const processBatch = async (items, processor, concurrency = 5) => {
    const results = [];
    
    for (let i = 0; i < items.length; i += concurrency) {
        const batch = items.slice(i, i + concurrency);
        const batchResults = await Promise.all(
            batch.map(item => processor(item).catch(err => ({ error: err })))
        );
        results.push(...batchResults);
    }
    
    return results;
};

/**
 * Debounce function for performance optimization
 */
export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

/**
 * Throttle function for rate limiting
 */
export const throttle = (func, limit) => {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

/**
 * Memory-efficient chunk processor
 * Processes large arrays in chunks to avoid memory issues
 */
export const processInChunks = async (array, chunkSize, processor) => {
    const results = [];
    
    for (let i = 0; i < array.length; i += chunkSize) {
        const chunk = array.slice(i, i + chunkSize);
        const chunkResult = await processor(chunk, i);
        results.push(chunkResult);
    }
    
    return results;
};

/**
 * Retry logic with exponential backoff
 */
export const retryWithBackoff = async (
    operation,
    maxRetries = 3,
    baseDelay = 1000
) => {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            if (attempt === maxRetries - 1) throw error;
            
            const delay = baseDelay * Math.pow(2, attempt);
            console.log(`Retry attempt ${attempt + 1} after ${delay}ms`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
};
