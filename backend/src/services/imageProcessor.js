/**
 * Image Processor - Compress/optimize images with sharp
 * 
 * Features:
 * - Concurrency limiting to prevent memory exhaustion
 * - Skip processing for large files (stream directly to S3)
 * - Memory-efficient processing
 * - Aggressive compression settings for better file size reduction
 * - Auto-conversion to WebP if significantly smaller
 */
const sharp = require('sharp');
const { imageProcessingLimiter } = require('../utils/concurrency');

const SUPPORTED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];

// Configuration from env or defaults
const CONFIG = {
    quality: {
        jpeg: parseInt(process.env.IMAGE_QUALITY_JPEG || '75'),
        webp: parseInt(process.env.IMAGE_QUALITY_WEBP || '75'),
        avif: parseInt(process.env.IMAGE_QUALITY_AVIF || '55'),
        png: parseInt(process.env.IMAGE_QUALITY_PNG || '8') // compression level 0-9
    },
    maxWidth: parseInt(process.env.IMAGE_MAX_WIDTH || '2048'),
    maxHeight: parseInt(process.env.IMAGE_MAX_HEIGHT || '2048'),
    // Skip processing for files larger than 50MB to avoid memory issues
    maxProcessSize: parseInt(process.env.IMAGE_MAX_PROCESS_SIZE || (50 * 1024 * 1024).toString()),
    // Minimum file size to even attempt compression (under 10KB is likely already optimized)
    minProcessSize: parseInt(process.env.IMAGE_MIN_PROCESS_SIZE || (10 * 1024).toString())
};

const isImageType = (type) => SUPPORTED.includes(type?.toLowerCase());

/**
 * Check if file should be processed (not too large, not too small)
 */
const shouldProcess = (buffer, mimeType) => {
    return isImageType(mimeType) &&
        buffer.length >= CONFIG.minProcessSize &&
        buffer.length <= CONFIG.maxProcessSize;
};

/**
 * Create a base pipeline with common settings
 */
const createPipeline = (buffer) => {
    let pipeline = sharp(buffer, {
        limitInputPixels: 268402689, // ~16384 x 16384
        sequentialRead: true, // Memory efficient mode
        failOnError: false, // Don't fail on corrupt images
    });

    // Remove metadata (EXIF, etc.) to reduce size - do this early
    pipeline = pipeline.rotate(); // Auto-rotate based on EXIF first
    return pipeline;
};

/**
 * Apply resizing if needed
 */
const applyResize = async (pipeline, width, height) => {
    if (width > CONFIG.maxWidth || height > CONFIG.maxHeight) {
        return pipeline.resize(CONFIG.maxWidth, CONFIG.maxHeight, {
            withoutEnlargement: true,
            fit: 'inside',
            kernel: 'lanczos3' // High quality resizing
        });
    }
    return pipeline;
};

/**
 * Optimization Helpers
 */
const optimizeJpeg = (pipeline) => {
    return pipeline.clone().jpeg({
        quality: CONFIG.quality.jpeg,
        progressive: true,
        mozjpeg: true,
        trellisQuantisation: true,
        overshootDeringing: true,
        optimizeScans: true,
    }).toBuffer();
};

const optimizeWebp = (pipeline) => {
    return pipeline.clone().webp({
        quality: CONFIG.quality.webp,
        effort: 6, // Max compression effort
        lossless: false,
    }).toBuffer();
};

const optimizePng = (pipeline) => {
    return pipeline.clone().png({
        compressionLevel: CONFIG.quality.png,
        palette: true,
        effort: 10,
    }).toBuffer();
};

const optimizeAvif = (pipeline) => {
    return pipeline.clone().avif({
        quality: CONFIG.quality.avif,
        effort: 6,
        lossless: false,
    }).toBuffer();
};

/**
 * Process image buffer with concurrency limiting
 */
async function processBuffer(buffer, mimeType) {
    // Skip logic...
    if (!shouldProcess(buffer, mimeType)) {
        console.log(`[ImageProcessor] Skipping: ${mimeType}, size: ${buffer.length}`);
        return { buffer, mimeType, size: buffer.length, wasProcessed: false };
    }

    return imageProcessingLimiter.run(async () => {
        const startTime = Date.now();
        const originalSize = buffer.length;

        try {
            const pipeline = createPipeline(buffer);
            const meta = await pipeline.metadata();

            console.log(`[ImageProcessor] Processing: ${meta.width}x${meta.height} ${mimeType} (${Math.round(originalSize / 1024)}KB)`);

            // Apply resizing to the main pipeline
            const resizedPipeline = await applyResize(pipeline, meta.width, meta.height);

            let out, outType = mimeType;
            const type = mimeType.toLowerCase();

            // Strategy Selection
            if (type === 'image/jpeg' || type === 'image/jpg') {
                // Strategy: Try Optimized JPEG vs WebP -> Pick Smaller
                const [jpegResult, webpResult] = await Promise.all([
                    optimizeJpeg(resizedPipeline),
                    optimizeWebp(resizedPipeline)
                ]);

                if (webpResult.length < jpegResult.length && webpResult.length < originalSize) {
                    out = webpResult;
                    outType = 'image/webp';
                } else if (jpegResult.length < originalSize) {
                    out = jpegResult;
                    outType = 'image/jpeg';
                } else {
                    out = buffer;
                }
            }
            else if (type === 'image/png') {
                // Strategy: Try Optimized PNG vs WebP -> Pick Smaller
                const [pngResult, webpResult] = await Promise.all([
                    optimizePng(resizedPipeline),
                    optimizeWebp(resizedPipeline)
                ]);

                if (webpResult.length < pngResult.length && webpResult.length < originalSize) {
                    out = webpResult;
                    outType = 'image/webp';
                } else if (pngResult.length < originalSize) {
                    out = pngResult;
                    outType = 'image/png';
                } else {
                    out = buffer;
                }
            }
            else if (type === 'image/webp') {
                out = await optimizeWebp(resizedPipeline);
            }
            else if (type === 'image/avif') {
                out = await optimizeAvif(resizedPipeline);
            }
            else if (type === 'image/gif') {
                // Try WebP for GIFs too (often much smaller even for animations)
                // but fall back safely if it fails or is larger (unlikely for WebP vs GIF)
                try {
                    const webpResult = await optimizeWebp(resizedPipeline);
                    if (webpResult.length < originalSize) {
                        out = webpResult;
                        outType = 'image/webp';
                    } else {
                        out = buffer;
                    }
                } catch {
                    out = buffer;
                }
            }
            else {
                out = await resizedPipeline.toBuffer();
            }

            // Results analysis
            const processingTime = Date.now() - startTime;
            const savings = originalSize - out.length;
            const savingsPercent = Math.round((savings / originalSize) * 100);

            if (savings > 0) {
                console.log(`[ImageProcessor] Compressed: ${Math.round(originalSize / 1024)}KB -> ${Math.round(out.length / 1024)}KB (${outType}, ${savingsPercent}% saved) in ${processingTime}ms`);
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
                console.log(`[ImageProcessor] No savings, using original. (Processed: ${Math.round(out.length / 1024)}KB vs Original: ${Math.round(originalSize / 1024)}KB)`);
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
