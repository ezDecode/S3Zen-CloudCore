/**
 * Concurrency Limiter
 * 
 * Limits parallel execution of async tasks to prevent memory exhaustion
 * and improve server stability during heavy load.
 */

/**
 * Create a concurrency limiter
 * 
 * @param {number} limit - Maximum concurrent operations
 * @returns {Object} - Limiter instance with run() method
 */
function createLimiter(limit = 3) {
    let running = 0;
    const queue = [];

    const next = () => {
        if (queue.length === 0 || running >= limit) return;

        const { fn, resolve, reject } = queue.shift();
        running++;

        fn()
            .then(resolve)
            .catch(reject)
            .finally(() => {
                running--;
                next();
            });
    };

    return {
        /**
         * Run an async function with concurrency limiting
         * 
         * @param {Function} fn - Async function to run
         * @returns {Promise} - Result of the function
         */
        run: (fn) => {
            return new Promise((resolve, reject) => {
                queue.push({ fn, resolve, reject });
                next();
            });
        },

        /**
         * Get current queue size
         */
        get pending() {
            return queue.length;
        },

        /**
         * Get number of currently running tasks
         */
        get active() {
            return running;
        },

        /**
         * Clear the queue (running tasks will complete)
         */
        clear: () => {
            queue.length = 0;
        }
    };
}

/**
 * Run multiple async functions with concurrency limit
 * 
 * @param {Function[]} fns - Array of async functions
 * @param {number} limit - Maximum concurrent operations
 * @returns {Promise<Array>} - Array of results
 */
async function mapWithLimit(fns, limit = 3) {
    const limiter = createLimiter(limit);
    return Promise.all(fns.map(fn => limiter.run(fn)));
}

/**
 * Global limiter for image processing
 * Limits to 2 concurrent image processing operations to prevent memory spikes
 */
const imageProcessingLimiter = createLimiter(2);

/**
 * Global limiter for S3 operations
 * Limits to 5 concurrent S3 operations
 */
const s3OperationsLimiter = createLimiter(5);

module.exports = {
    createLimiter,
    mapWithLimit,
    imageProcessingLimiter,
    s3OperationsLimiter
};
