/**
 * FileThumbnail Component
 * Displays image thumbnails for files in list view
 */

import { memo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getPreviewUrl } from '../../services/aws/s3Service';
import { FileIcon } from '../file-explorer/FileIcon';
import { getFileType } from '../../utils/fileTypeUtils';

const THUMBNAIL_CACHE = new Map();
const THUMBNAIL_EXPIRY = 50 * 60 * 1000; // 50 minutes (presigned URLs expire in 1 hour)

export const FileThumbnail = memo(({ item, size = 'sm' }) => {
    const [thumbnailUrl, setThumbnailUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(false);

    const fileType = getFileType(item.name);
    const isImage = fileType === 'image';

    // Size classes
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-12 h-12'
    };

    useEffect(() => {
        if (!isImage || item.type === 'folder') {
            return;
        }

        const loadThumbnail = async () => {
            // Check cache
            const cached = THUMBNAIL_CACHE.get(item.key);
            if (cached && Date.now() - cached.timestamp < THUMBNAIL_EXPIRY) {
                setThumbnailUrl(cached.url);
                return;
            }

            setIsLoading(true);
            setError(false);

            try {
                const result = await getPreviewUrl(item.key);
                if (result.success) {
                    THUMBNAIL_CACHE.set(item.key, {
                        url: result.url,
                        timestamp: Date.now()
                    });
                    setThumbnailUrl(result.url);
                } else {
                    setError(true);
                }
            } catch (err) {
                setError(true);
            } finally {
                setIsLoading(false);
            }
        };

        loadThumbnail();
    }, [item.key, item.name, isImage, item.type]);

    // Non-image files show regular icon
    if (!isImage || item.type === 'folder') {
        return (
            <FileIcon 
                filename={item.name} 
                isFolder={item.type === 'folder'} 
                className={sizeClasses[size]} 
            />
        );
    }

    // Loading state
    if (isLoading) {
        return (
            <div className={`${sizeClasses[size]} rounded bg-white/10 animate-pulse`} />
        );
    }

    // Error or no thumbnail - show file icon
    if (error || !thumbnailUrl) {
        return (
            <FileIcon 
                filename={item.name} 
                isFolder={false} 
                className={sizeClasses[size]} 
            />
        );
    }

    // Show thumbnail
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`${sizeClasses[size]} rounded overflow-hidden bg-white/5 shrink-0`}
        >
            <img
                src={thumbnailUrl}
                alt={item.name}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={() => setError(true)}
            />
        </motion.div>
    );
});

FileThumbnail.displayName = 'FileThumbnail';

// Clear expired cache entries periodically
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of THUMBNAIL_CACHE.entries()) {
        if (now - value.timestamp > THUMBNAIL_EXPIRY) {
            THUMBNAIL_CACHE.delete(key);
        }
    }
}, 5 * 60 * 1000); // Clean every 5 minutes
