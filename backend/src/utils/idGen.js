const { customAlphabet } = require('nanoid');

// Use URL-safe characters (alphanumeric)
const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const nanoid = customAlphabet(alphabet, 6);

function generateShortCode() {
    return nanoid();
}

module.exports = { generateShortCode };
