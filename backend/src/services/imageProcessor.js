/**
 * Image Processor - Compress/optimize images with sharp
 * 
 * Features:
 * - Concurrency limiting to prevent memory exhaustion
 * - Skip processing for large files (stream directly to S3)
 * - Memory-efficient processing
 */
const sharp = require('sharp');
const { imageProcessingLimiter } = require('../utils/concurrency');

const SUPPORTED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const QUALITY = { jpeg: 80, webp: 80, avif: 60 };
const MAX_WIDTH = 2048;

// Skip processing for files larger than 50MB to avoid memory issues
const MAX_PROCESS_SIZE = 50 * 1024 * 1024;

const isImageType = (type) => SUPPORTED.includes(type?.toLowerCase());

/**
 * Check if file should be processed (not too large)
 */
const shouldProcess = (buffer, mimeType) => {
    return isImageType(mimeType) && buffer.length <= MAX_PROCESS_SIZE;
};

/**
 * Process image buffer with concurrency limiting
 */
async function processBuffer(buffer, mimeType) {
    // Skip non-images and large files
    if (!shouldProcess(buffer, mimeType)) {
        return { buffer, mimeType, size: buffer.length, wasProcessed: false };
    }

    // Use concurrency limiter to prevent memory exhaustion
    return imageProcessingLimiter.run(async () => {
        try {
            // Enable sharp's memory management
            let img = sharp(buffer, {
                limitInputPixels: 268402689, // ~16384 x 16384
                sequentialRead: true, // Memory efficient mode
            });

            const meta = await img.metadata();

            if (meta.width > MAX_WIDTH) {
                img = img.resize(MAX_WIDTH, null, { withoutEnlargement: true, fit: 'inside' });
            }

            let out, outType = mimeType;

            switch (mimeType.toLowerCase()) {
                case 'image/jpeg':
                    out = await img.jpeg({ quality: QUALITY.jpeg }).toBuffer();
                    break;
                case 'image/png':
                    const webp = await img.webp({ quality: QUALITY.webp }).toBuffer();
                    const png = await img.png({ compressionLevel: 9 }).toBuffer();
                    out = webp.length < png.length ? (outType = 'image/webp', webp) : png;
                    break;
                case 'image/webp':
                    out = await img.webp({ quality: QUALITY.webp }).toBuffer();
                    break;
                case 'image/avif':
                    out = await img.avif({ quality: QUALITY.avif }).toBuffer();
                    break;
                default:
                    out = await img.toBuffer();
            }

            return { buffer: out, mimeType: outType, size: out.length, wasProcessed: true };
        } catch (e) {
            console.error('[ImageProcessor]', e.message);
            return { buffer, mimeType, size: buffer.length, wasProcessed: false };
        }
    });
}

module.exports = { processBuffer, isImageType, shouldProcess };
