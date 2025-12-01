/**
 * Application Constants
 * Centralized configuration for magic numbers and constants
 */

// File Upload Configuration
export const FILE_UPLOAD = {
    LARGE_FILE_THRESHOLD: 100 * 1024 * 1024, // 100MB
    MAX_FILE_SIZE: 5 * 1024 * 1024 * 1024, // 5GB
    MAX_CONCURRENT_UPLOADS: 6, // Optimal for modern browsers
    MULTIPART_SIZE: 25 * 1024 * 1024, // 25MB parts for multipart upload
    MULTIPART_QUEUE_SIZE: 10, // Concurrent part uploads
};

// Cache Configuration
export const CACHE = {
    PREVIEW_DURATION: 5 * 60 * 1000, // 5 minutes
    PREVIEW_MAX_ITEMS: 100, // LRU cache size
    CLEANUP_INTERVAL: 5 * 60 * 1000, // 5 minutes
};

// Session Configuration
export const SESSION = {
    TIMEOUT_MS: 24 * 60 * 60 * 1000, // 24 hours
    UPDATE_INTERVAL: 5 * 60 * 1000, // Update timestamp every 5 minutes
};

// Rate Limiting Configuration
export const RATE_LIMIT = {
    LIST_MAX_TOKENS: 10,
    LIST_REFILL_RATE: 2, // tokens per second
    
    UPLOAD_MAX_TOKENS: 20,
    UPLOAD_REFILL_RATE: 5,
    
    DOWNLOAD_MAX_TOKENS: 30,
    DOWNLOAD_REFILL_RATE: 10,
    
    DELETE_MAX_TOKENS: 20,
    DELETE_REFILL_RATE: 5,
    
    COPY_MAX_TOKENS: 15,
    COPY_REFILL_RATE: 3,
};

// S3 Configuration
export const S3 = {
    MAX_KEYS_PER_REQUEST: 1000, // AWS S3 limit
    DELETE_BATCH_SIZE: 1000, // AWS S3 limit
    MAX_CONCURRENT_COPIES: 50, // Optimal for folder operations
    CONNECTION_TIMEOUT: 30000, // 30 seconds
    SOCKET_TIMEOUT: 30000, // 30 seconds
    MAX_ATTEMPTS: 3, // Retry attempts
};

// UI Configuration
export const UI = {
    TOAST_DURATION: 2000, // 2 seconds
    TOAST_SUCCESS_DURATION: 2000,
    TOAST_ERROR_DURATION: 4000,
    
    DEBOUNCE_DELAY: 300, // 300ms
    THROTTLE_DELAY: 1000, // 1 second
    
    ANIMATION_DURATION: 0.3, // seconds
    ANIMATION_DELAY: 0.15, // seconds
    ANIMATION_EASE: [0.4, 0, 0.2, 1], // cubic-bezier
};

// Storage Keys
export const STORAGE_KEYS = {
    ENCRYPTED_CREDENTIALS: 'cc_enc_creds',
    SESSION_TOKEN: 'cc_session_token',
    TOKEN_SIGNATURE: 'cc_token_sig',
    SESSION_TIMESTAMP: 'cc_session_ts',
    BUCKET_INFO: 'cc_bucket_info',
    FAVORITES: 'cc_enc_favorites',
    THEME: 'cc_theme',
};

// Validation Limits
export const VALIDATION = {
    MAX_FILENAME_LENGTH: 255,
    MAX_PATH_LENGTH: 1024,
    ACCESS_KEY_LENGTH: 20,
    SECRET_KEY_LENGTH: 40,
    MIN_BUCKET_NAME_LENGTH: 3,
    MAX_BUCKET_NAME_LENGTH: 63,
};

// URL Shortener Configuration
export const URL_SHORTENER = {
    SHORT_CODE_LENGTH: 8, // Increased from 6 for better collision resistance
    MAX_GENERATION_ATTEMPTS: 5,
    RECENT_CODES_CACHE_SIZE: 10000,
    DEFAULT_EXPIRY: 3600, // 1 hour in seconds
};

// Performance Configuration
export const PERFORMANCE = {
    VIRTUAL_SCROLL_THRESHOLD: 100, // Enable virtual scrolling after this many items
    LAZY_LOAD_THRESHOLD: 50, // Lazy load after this many items
    STATS_REFRESH_INTERVAL: 60000, // 1 minute
};

// Z-Index Scale
export const Z_INDEX = {
    BASE: 0,
    DROPDOWN: 10,
    STICKY: 20,
    FIXED: 30,
    MODAL_BACKDROP: 40,
    MODAL: 50,
    POPOVER: 60,
    TOOLTIP: 70,
    NOTIFICATION: 80,
    SHARE_MODAL: 110, // Highest priority modal
};

// File Type Categories
export const FILE_TYPES = {
    IMAGES: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'],
    VIDEOS: ['mp4', 'webm', 'mov', 'avi', 'mkv', 'm4v'],
    AUDIO: ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac'],
    DOCUMENTS: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf'],
    CODE: ['js', 'jsx', 'ts', 'tsx', 'json', 'html', 'css', 'py', 'java', 'c', 'cpp', 'go', 'rs', 'md'],
    ARCHIVES: ['zip', 'rar', '7z', 'tar', 'gz', 'bz2'],
};

// Error Messages
export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Network error - check your connection',
    AUTH_FAILED: 'Authentication failed',
    INVALID_CREDENTIALS: 'Invalid credentials',
    BUCKET_NOT_FOUND: 'Bucket not found',
    ACCESS_DENIED: 'Access denied to bucket',
    FILE_TOO_LARGE: 'File size exceeds maximum allowed (5GB)',
    INVALID_FILE_PATH: 'Invalid file path - contains dangerous patterns',
    SESSION_EXPIRED: 'Session expired - please login again',
    RATE_LIMITED: 'Too many requests - please slow down',
};

export default {
    FILE_UPLOAD,
    CACHE,
    SESSION,
    RATE_LIMIT,
    S3,
    UI,
    STORAGE_KEYS,
    VALIDATION,
    URL_SHORTENER,
    PERFORMANCE,
    Z_INDEX,
    FILE_TYPES,
    ERROR_MESSAGES,
};
