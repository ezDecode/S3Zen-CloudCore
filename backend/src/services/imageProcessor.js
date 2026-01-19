/**
 * Image Processor - Compress/optimize images with sharp
 */
const sharp = require('sharp');

const SUPPORTED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const QUALITY = { jpeg: 80, webp: 80, avif: 60 };
const MAX_WIDTH = 2048;

const isImageType = (type) => SUPPORTED.includes(type?.toLowerCase());

async function processBuffer(buffer, mimeType) {
    if (!isImageType(mimeType)) {
        return { buffer, mimeType, size: buffer.length, wasProcessed: false };
    }

    try {
        let img = sharp(buffer);
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
}

module.exports = { processBuffer, isImageType };
