const { customAlphabet } = require('nanoid');

// Use URL-safe characters (alphanumeric)
const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
// Increased from 6 to 8 characters for better collision resistance
// 62^8 = 218 trillion possible combinations
const nanoid = customAlphabet(alphabet, 8);

// Track recently generated codes for collision detection
const recentCodes = new Set();
const MAX_RECENT_CODES = 10000; // Keep last 10k codes in memory

/**
 * Generate a unique short code with collision detection
 * @param {Function} checkExists - Optional async function to check if code exists in DB
 * @returns {string} Unique short code
 */
async function generateShortCode(checkExists = null) {
    let attempts = 0;
    const maxAttempts = 5;
    
    while (attempts < maxAttempts) {
        const code = nanoid();
        
        // Check in-memory cache first (fast)
        if (recentCodes.has(code)) {
            attempts++;
            continue;
        }
        
        // Check database if function provided (slower)
        if (checkExists) {
            const exists = await checkExists(code);
            if (exists) {
                attempts++;
                continue;
            }
        }
        
        // Code is unique, add to cache
        recentCodes.add(code);
        
        // Limit cache size
        if (recentCodes.size > MAX_RECENT_CODES) {
            // Remove oldest entry (first in Set)
            const firstCode = recentCodes.values().next().value;
            recentCodes.delete(firstCode);
        }
        
        return code;
    }
    
    // If we exhausted attempts, throw error
    throw new Error('Failed to generate unique short code after multiple attempts');
}

module.exports = { generateShortCode };
