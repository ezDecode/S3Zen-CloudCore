/**
 * Production-Ready Logging Utility
 * Replaces console.log/warn/error with proper logging levels
 * Automatically disabled in production builds
 */

const LOG_LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    NONE: 4
};

// Set log level based on environment
const currentLevel = import.meta.env.PROD 
    ? LOG_LEVELS.ERROR  // Only errors in production
    : LOG_LEVELS.DEBUG; // All logs in development

/**
 * Format log message with timestamp and context
 */
const formatMessage = (level, context, message, ...args) => {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level}]${context ? ` [${context}]` : ''}`;
    return [prefix, message, ...args];
};

/**
 * Logger class with context support
 */
class Logger {
    constructor(context = '') {
        this.context = context;
    }

    debug(message, ...args) {
        if (currentLevel <= LOG_LEVELS.DEBUG) {
            console.log(...formatMessage('DEBUG', this.context, message, ...args));
        }
    }

    info(message, ...args) {
        if (currentLevel <= LOG_LEVELS.INFO) {
            console.log(...formatMessage('INFO', this.context, message, ...args));
        }
    }

    warn(message, ...args) {
        if (currentLevel <= LOG_LEVELS.WARN) {
            console.warn(...formatMessage('WARN', this.context, message, ...args));
        }
    }

    error(message, ...args) {
        if (currentLevel <= LOG_LEVELS.ERROR) {
            console.error(...formatMessage('ERROR', this.context, message, ...args));
        }
    }

    /**
     * Create a child logger with additional context
     */
    child(childContext) {
        const newContext = this.context 
            ? `${this.context}:${childContext}`
            : childContext;
        return new Logger(newContext);
    }
}

// Export default logger
export const logger = new Logger();

// Export logger factory for creating contextual loggers
export const createLogger = (context) => new Logger(context);

// Export for testing
export { LOG_LEVELS };

export default logger;
