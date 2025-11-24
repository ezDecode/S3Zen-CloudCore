/**
 * Input Validation and Sanitization Utilities
 * Prevents XSS, path traversal, and injection attacks
 * 
 * SECURITY: All user input must be validated and sanitized
 */

/**
 * Sanitize file/folder names to prevent path traversal attacks
 * Blocks: ../, ..\, %2e%2e, null bytes, etc.
 */
export const sanitizeFileName = (name) => {
    if (!name || typeof name !== 'string') {
        return '';
    }

    // Remove any path traversal sequences
    let sanitized = name
        .replace(/\.\./g, '') // Remove ..
        .replace(/\\/g, '') // Remove backslashes
        .replace(/%2e/gi, '') // Remove URL encoded dots
        .replace(/%2f/gi, '') // Remove URL encoded slashes
        .replace(/%5c/gi, '') // Remove URL encoded backslashes
        .replace(/\0/g, '') // Remove null bytes
        .replace(/[\x00-\x1f\x7f]/g, ''); // Remove control characters

    // Remove leading/trailing slashes and dots
    sanitized = sanitized.replace(/^[./]+|[./]+$/g, '');

    // Limit length
    if (sanitized.length > 255) {
        sanitized = sanitized.substring(0, 255);
    }

    return sanitized.trim();
};

/**
 * Sanitize S3 key/path to prevent path traversal
 */
export const sanitizeS3Path = (path) => {
    if (!path || typeof path !== 'string') {
        return '';
    }

    // Split path into segments
    const segments = path.split('/').filter(Boolean);

    // Sanitize each segment
    const sanitizedSegments = segments.map(segment => {
        return sanitizeFileName(segment);
    }).filter(segment => segment.length > 0);

    return sanitizedSegments.join('/');
};

/**
 * Validate S3 bucket name format
 */
export const isValidBucketName = (bucketName) => {
    if (!bucketName || typeof bucketName !== 'string') {
        return false;
    }

    // AWS S3 bucket name rules
    const bucketRegex = /^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/;

    return (
        bucketRegex.test(bucketName) &&
        !bucketName.includes('..') &&
        !/^\d+\.\d+\.\d+\.\d+$/.test(bucketName) // Not an IP address
    );
};

/**
 * Validate AWS region format
 */
export const isValidRegion = (region) => {
    if (!region || typeof region !== 'string') {
        return false;
    }

    // AWS region format: xx-xxxx-N
    const regionRegex = /^[a-z]{2}-(central|north|south|east|west|northeast|northwest|southeast|southwest)-\d+$/;
    return regionRegex.test(region);
};

/**
 * Escape HTML to prevent XSS when displaying user input
 */
export const escapeHTML = (str) => {
    if (!str || typeof str !== 'string') {
        return '';
    }

    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
};

/**
 * Validate URL format and security
 * Prevents javascript:, data:, file: URLs
 */
export const isValidURL = (url) => {
    if (!url || typeof url !== 'string') {
        return false;
    }

    try {
        const parsed = new URL(url);

        // Only allow http/https
        if (!['http:', 'https:'].includes(parsed.protocol)) {
            return false;
        }

        // Block localhost/internal IPs in production
        if (import.meta.env.PROD) {
            const hostname = parsed.hostname.toLowerCase();
            if (
                hostname === 'localhost' ||
                hostname.startsWith('127.') ||
                hostname.startsWith('192.168.') ||
                hostname.startsWith('10.') ||
                hostname.startsWith('172.16.') ||
                hostname === '0.0.0.0' ||
                hostname.endsWith('.local')
            ) {
                return false;
            }
        }

        return true;
    } catch {
        return false;
    }
};

/**
 * Validate file size (prevent extremely large uploads)
 */
export const isValidFileSize = (size, maxSizeGB = 5) => {
    const maxBytes = maxSizeGB * 1024 * 1024 * 1024;
    return size > 0 && size <= maxBytes;
};

/**
 * Check if path contains dangerous patterns
 */
export const isDangerousPath = (path) => {
    if (!path || typeof path !== 'string') {
        return true;
    }

    const dangerousPatterns = [
        /\.\./,           // Path traversal
        /[\x00-\x1f]/,    // Control characters
        /[<>"']/,         // HTML/script injection
        /javascript:/i,   // JavaScript protocol
        /data:/i,         // Data URI
        /vbscript:/i,     // VBScript
        /on\w+=/i,        // Event handlers
    ];

    return dangerousPatterns.some(pattern => pattern.test(path));
};

/**
 * Validate folder name for creation
 */
export const isValidFolderName = (name) => {
    if (!name || typeof name !== 'string') {
        return false;
    }

    // Must not be empty after sanitization
    const sanitized = sanitizeFileName(name);
    if (sanitized.length === 0) {
        return false;
    }

    // Must not contain dangerous patterns
    if (isDangerousPath(sanitized)) {
        return false;
    }

    // Must not be special directories
    const reserved = ['.', '..', 'CON', 'PRN', 'AUX', 'NUL', 'COM1', 'LPT1'];
    if (reserved.includes(sanitized.toUpperCase())) {
        return false;
    }

    return true;
};

/**
 * Validate access key ID format
 */
export const isValidAccessKeyId = (accessKeyId) => {
    if (!accessKeyId || typeof accessKeyId !== 'string') {
        return false;
    }

    // AWS access key format: 20 alphanumeric characters starting with AKIA or ASIA
    return /^(AKIA|ASIA)[A-Z0-9]{16}$/.test(accessKeyId);
};

/**
 * Validate secret access key format
 */
export const isValidSecretAccessKey = (secretAccessKey) => {
    if (!secretAccessKey || typeof secretAccessKey !== 'string') {
        return false;
    }

    // AWS secret key: 40 base64 characters
    return secretAccessKey.length === 40 && /^[A-Za-z0-9/+=]+$/.test(secretAccessKey);
};

/**
 * Sanitize user input for display in UI
 * Prevents XSS attacks
 */
export const sanitizeForDisplay = (input) => {
    if (!input) return '';

    return String(input)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
};

/**
 * Validate content type for uploads
 * Prevent executable uploads
 */
export const isAllowedContentType = (contentType) => {
    if (!contentType) return false;

    // Block potentially dangerous types
    const blockedTypes = [
        'application/x-msdownload',
        'application/x-executable',
        'application/x-sharedlib',
        'application/x-sh',
        'text/x-sh',
        'application/x-bat',
    ];

    return !blockedTypes.includes(contentType.toLowerCase());
};

/**
 * Rate limiting key generator for client-side
 */
export const generateRateLimitKey = (operation) => {
    return `ratelimit_${operation}_${Date.now()}`;
};

/**
 * Extract file extension from filename (including the dot)
 * @param {string} filename - The filename to extract extension from
 * @returns {string} The extension with dot (e.g., '.pdf') or empty string if no extension
 */
export const getFileExtension = (filename) => {
    if (!filename || typeof filename !== 'string') {
        return '';
    }

    const lastDotIndex = filename.lastIndexOf('.');

    // No extension if no dot, or dot is at start/end
    if (lastDotIndex <= 0 || lastDotIndex === filename.length - 1) {
        return '';
    }

    return filename.substring(lastDotIndex);
};

/**
 * Get filename without extension
 * @param {string} filename - The filename to process
 * @returns {string} Filename without extension
 */
export const getFileNameWithoutExtension = (filename) => {
    if (!filename || typeof filename !== 'string') {
        return '';
    }

    const lastDotIndex = filename.lastIndexOf('.');

    // No extension, return as-is
    if (lastDotIndex <= 0) {
        return filename;
    }

    return filename.substring(0, lastDotIndex);
};

/**
 * Ensure filename has the original extension
 * If user provides name without extension, append the original extension
 * If user provides name with extension, use their extension
 * 
 * @param {string} newName - The new name provided by user
 * @param {string} originalFilename - The original filename with extension
 * @returns {string} New name with appropriate extension
 */
export const preserveFileExtension = (newName, originalFilename) => {
    if (!newName || typeof newName !== 'string') {
        return originalFilename;
    }

    if (!originalFilename || typeof originalFilename !== 'string') {
        return newName;
    }

    // Get original extension
    const originalExt = getFileExtension(originalFilename);

    // If original has no extension, return new name as-is
    if (!originalExt) {
        return newName;
    }

    // Get new name's extension (if any)
    const newExt = getFileExtension(newName);

    // If new name already has an extension, use it
    if (newExt) {
        return newName;
    }

    // Otherwise, append original extension
    return `${newName}${originalExt}`;
};

/**
 * Check if a filename has an extension
 * @param {string} filename - The filename to check
 * @returns {boolean} True if filename has an extension
 */
export const hasFileExtension = (filename) => {
    return getFileExtension(filename).length > 0;
};

