/**
 * QuickShareButton Component
 * One-click shareable link generation with default expiration
 */

import { useState, memo } from 'react';
import { motion } from 'framer-motion';
import { Link01Icon, Tick02Icon, Loading03Icon } from 'hugeicons-react';
import { toast } from 'sonner';
import { generateShareableLink } from '../../services/aws/s3Service';
import { shortenUrl } from '../../services/urlShortener';

const DEFAULT_EXPIRATION = 3600; // 1 hour

export const QuickShareButton = memo(({ item, className = '' }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleQuickShare = async (e) => {
        e.stopPropagation();
        e.preventDefault();
        
        if (isLoading || copied) return;
        
        setIsLoading(true);
        
        try {
            // Generate presigned URL
            const result = await generateShareableLink(item.key, DEFAULT_EXPIRATION);
            
            if (!result.success) {
                toast.error('Failed to generate link');
                return;
            }

            // Try to shorten the URL
            let finalUrl = result.url;
            const shortenResult = await shortenUrl(result.url);
            
            if (shortenResult.success) {
                finalUrl = shortenResult.shortUrl;
            }

            // Copy to clipboard
            await navigator.clipboard.writeText(finalUrl);
            
            setCopied(true);
            toast.success('Link copied! Expires in 1 hour', {
                duration: 3000
            });
            
            // Reset after 2 seconds
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Quick share error:', error);
            toast.error('Failed to create share link');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.button
            onClick={handleQuickShare}
            disabled={isLoading}
            className={`p-2 rounded-lg transition-colors duration-150 ${
                copied 
                    ? 'bg-green-500/90 text-white' 
                    : 'bg-purple-500/90 hover:bg-purple-600 text-white'
            } ${className}`}
            title="Quick share (1 hour link)"
        >
            {isLoading ? (
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                    <Loading03Icon className="w-4 h-4" />
                </motion.div>
            ) : copied ? (
                <Tick02Icon className="w-4 h-4" />
            ) : (
                <Link01Icon className="w-4 h-4" />
            )}
        </motion.button>
    );
});

QuickShareButton.displayName = 'QuickShareButton';
