/**
 * Image Processor - Compress/optimize images with sharp
 * 
 * Features:
 * - Concurrency limiting to prevent memory exhaustion
 * - Skip processing for large files (stream directly to S3)
 * - Memory-efficient processing
 * - Aggressive compression settings for better file size reduction
 */
const sharp = require('sharp');
const { imageProcessingLimiter } = require('../utils/concurrency');

const SUPPORTED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];

// More aggressive compression settings
const QUALITY = {
    jpeg: 75,  // reduced from 80
    webp: 75,  // reduced from 80
    avif: 55,  // reduced from 60
    png: 8     // compression level (0-9, higher = more compression)
};

// Max dimensions - resize larger images
const MAX_WIDTH = 2048;
const MAX_HEIGHT = 2048;

// Skip processing for files larger than 50MB to avoid memory issues
const MAX_PROCESS_SIZE = 50 * 1024 * 1024;

// Minimum file size to even attempt compression (under 10KB is likely already optimized)
const MIN_PROCESS_SIZE = 10 * 1024;

const isImageType = (type) => SUPPORTED.includes(type?.toLowerCase());

/**
 * Check if file should be processed (not too large, not too small)
 */
const shouldProcess = (buffer, mimeType) => {
    return isImageType(mimeType) &&
        buffer.length >= MIN_PROCESS_SIZE &&
        buffer.length <= MAX_PROCESS_SIZE;
};

/**
 * Process image buffer with concurrency limiting
 */
async function processBuffer(buffer, mimeType) {
    // Skip non-images, large files, and already tiny files
    if (!shouldProcess(buffer, mimeType)) {
        console.log(`[ImageProcessor] Skipping: ${mimeType}, size: ${buffer.length}`);
        return { buffer, mimeType, size: buffer.length, wasProcessed: false };
    }

    // Use concurrency limiter to prevent memory exhaustion
    return imageProcessingLimiter.run(async () => {
        const startTime = Date.now();
        const originalSize = buffer.length;

        try {
            // Enable sharp's memory management
            let pipeline = sharp(buffer, {
                limitInputPixels: 268402689, // ~16384 x 16384
                sequentialRead: true, // Memory efficient mode
                failOnError: false, // Don't fail on corrupt images
            });

            const meta = await pipeline.metadata();

            // Log input info
            console.log(`[ImageProcessor] Processing: ${meta.width}x${meta.height} ${mimeType} (${Math.round(originalSize / 1024)}KB)`);

            // Resize if too large
            if (meta.width > MAX_WIDTH || meta.height > MAX_HEIGHT) {
                pipeline = pipeline.resize(MAX_WIDTH, MAX_HEIGHT, {
                    withoutEnlargement: true,
                    fit: 'inside',
                    kernel: 'lanczos3' // High quality resizing
                });
            }

            // Remove metadata (EXIF, etc.) to reduce size
            pipeline = pipeline.rotate(); // Auto-rotate based on EXIF, then strip

            let out, outType = mimeType;

            switch (mimeType.toLowerCase()) {
                case 'image/jpeg':
                case 'image/jpg':
                    out = await pipeline
                        .jpeg({
                            quality: QUALITY.jpeg,
                            progressive: true, // Progressive loading
                            mozjpeg: true, // Use mozjpeg for better compression
                            trellisQuantisation: true,
                            overshootDeringing: true,
                            optimizeScans: true,
                        })
                        .toBuffer();
                    outType = 'image/jpeg';
                    break;

                case 'image/png':
                    // Try both WebP and PNG, use smaller one
                    const [webpResult, pngResult] = await Promise.all([
                        pipeline.clone().webp({
                            quality: QUALITY.webp,
                            effort: 6, // Max compression effort
                            lossless: false,
                        }).toBuffer(),
                        pipeline.clone().png({
                            compressionLevel: QUALITY.png,
                            palette: true, // Use palette if possible
                            effort: 10, // Max compression effort
                        }).toBuffer()
                    ]);

                    // Choose the smaller output
                    if (webpResult.length < pngResult.length && webpResult.length < originalSize) {
                        out = webpResult;
                        outType = 'image/webp';
                    } else if (pngResult.length < originalSize) {
                        out = pngResult;
                        outType = 'image/png';
                    } else {
                        // Original is smaller, return it
                        out = buffer;
                        outType = mimeType;
                    }
                    break;

                case 'image/webp':
                    out = await pipeline
                        .webp({
                            quality: QUALITY.webp,
                            effort: 6,
                            lossless: false,
                        })
                        .toBuffer();
                    break;

                case 'image/avif':
                    out = await pipeline
                        .avif({
                            quality: QUALITY.avif,
                            effort: 6,
                            lossless: false,
                        })
                        .toBuffer();
                    break;

                case 'image/gif':
                    // GIFs are tricky - try WebP animated or just pass through
                    try {
                        out = await pipeline
                            .webp({
                                quality: QUALITY.webp,
                                effort: 6,
                            })
                            .toBuffer();
                        outType = 'image/webp';
                    } catch {
                        // Fall back to original
                        out = buffer;
                        outType = mimeType;
                    }
                    break;

                default:
                    out = await pipeline.toBuffer();
            }

            // Check if compression actually helped
            const processingTime = Date.now() - startTime;
            const savings = originalSize - out.length;
            const savingsPercent = Math.round((savings / originalSize) * 100);

            if (savings > 0) {
                console.log(`[ImageProcessor] Compressed: ${Math.round(originalSize / 1024)}KB -> ${Math.round(out.length / 1024)}KB (${savingsPercent}% saved) in ${processingTime}ms`);
                return {
                    buffer: out,
                    mimeType: outType,
                    size: out.length,
                    wasProcessed: true,
                    originalSize,
                    savings,
                    savingsPercent
                };
            } else {
                // Compression made it larger - return original
                console.log(`[ImageProcessor] No savings, using original (processed was ${Math.round(out.length / 1024)}KB vs original ${Math.round(originalSize / 1024)}KB)`);
                return { buffer, mimeType, size: buffer.length, wasProcessed: false };
            }

        } catch (e) {
            console.error('[ImageProcessor] Error:', e.message);
            return { buffer, mimeType, size: buffer.length, wasProcessed: false, error: e.message };
        }
    });
}

/**
 * Get info about an image without processing it
 */
async function getImageInfo(buffer) {
    try {
        const meta = await sharp(buffer).metadata();
        return {
            width: meta.width,
            height: meta.height,
            format: meta.format,
            size: buffer.length,
            hasAlpha: meta.hasAlpha,
            isAnimated: meta.pages > 1,
        };
    } catch (e) {
        return null;
    }
}

module.exports = { processBuffer, isImageType, shouldProcess, getImageInfo };
