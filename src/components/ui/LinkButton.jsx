/**
 * LinkButton Component
 * 
 * A reusable component for displaying short URLs with an interactive tooltip
 * showing both the short URL and AWS S3 URL on hover/focus.
 * 
 * Features:
 * - Shows truncated short URL by default
 * - Tooltip on hover/focus with copy actions
 * - Keyboard accessible with proper ARIA attributes
 * - Fast, non-blocking tooltip
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { Copy, Check, ExternalLink, Link, CloudOff } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Truncate URL for display
 */
const truncateUrl = (url, maxLength = 32) => {
    if (!url) return '';
    if (url.length <= maxLength) return url;

    // Remove protocol for display
    const withoutProtocol = url.replace(/^https?:\/\//, '');
    if (withoutProtocol.length <= maxLength) return withoutProtocol;

    return withoutProtocol.substring(0, maxLength - 3) + '...';
};

/**
 * Build AWS S3 URL from metadata
 */
const buildAwsUrl = (s3Bucket, s3Key, s3Region) => {
    if (!s3Bucket || !s3Key) return null;
    const region = s3Region || 'us-east-1';
    return `https://${s3Bucket}.s3.${region}.amazonaws.com/${s3Key}`;
};

export const LinkButton = ({
    shortUrl,
    shortCode,
    s3Bucket,
    s3Key,
    s3Region,
    awsUrl: providedAwsUrl,
    className = '',
    size = 'default', // 'sm' | 'default' | 'lg'
    showIcon = true,
    onCopy,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [copiedField, setCopiedField] = useState(null);
    const [tooltipPosition, setTooltipPosition] = useState('bottom');
    const buttonRef = useRef(null);
    const tooltipRef = useRef(null);
    const timeoutRef = useRef(null);

    // Compute AWS URL from metadata if not provided
    const awsUrl = providedAwsUrl || buildAwsUrl(s3Bucket, s3Key, s3Region);

    // Calculate tooltip position based on available space
    const calculatePosition = useCallback(() => {
        if (!buttonRef.current) return 'bottom';
        const rect = buttonRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        return (spaceBelow < 180 && spaceAbove > spaceBelow) ? 'top' : 'bottom';
    }, []);

    // Open tooltip with position calculation
    const openTooltip = useCallback(() => {
        setTooltipPosition(calculatePosition());
        setIsOpen(true);
    }, [calculatePosition]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    // Handle open with delay
    const handleMouseEnter = useCallback(() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        // Small delay to prevent accidental triggers
        timeoutRef.current = setTimeout(openTooltip, 100);
    }, [openTooltip]);

    const handleMouseLeave = useCallback(() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        // Delay closing to allow moving to tooltip
        timeoutRef.current = setTimeout(() => setIsOpen(false), 150);
    }, []);

    const handleFocus = useCallback(() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        openTooltip();
    }, [openTooltip]);

    const handleBlur = useCallback((e) => {
        // Don't close if focus moves to tooltip
        if (tooltipRef.current?.contains(e.relatedTarget)) return;
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setIsOpen(false), 100);
    }, []);

    // Copy to clipboard
    const copyToClipboard = async (text, field) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedField(field);
            toast.success(`${field === 'short' ? 'Short URL' : 'S3 URL'} copied!`);
            onCopy?.(text, field);

            setTimeout(() => setCopiedField(null), 2000);
        } catch {
            toast.error('Failed to copy');
        }
    };

    // Size classes
    const sizeClasses = {
        sm: 'text-xs py-1 px-2',
        default: 'text-sm py-1.5 px-3',
        lg: 'text-base py-2 px-4',
    };

    const iconSizes = {
        sm: 'w-3 h-3',
        default: 'w-4 h-4',
        lg: 'w-5 h-5',
    };

    return (
        <div className="relative inline-block">
            {/* Main Button */}
            <button
                ref={buttonRef}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onClick={() => copyToClipboard(shortUrl, 'short')}
                className={`
                    inline-flex items-center gap-1.5
                    bg-white border-2 border-[var(--border-color)]
                    font-mono truncate max-w-[200px]
                    hover:bg-[var(--color-yellow)] 
                    focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-1
                    transition-all duration-150
                    shadow-[2px_2px_0_var(--border-color)]
                    hover:shadow-[3px_3px_0_var(--border-color)]
                    active:shadow-[1px_1px_0_var(--border-color)]
                    active:translate-x-[1px] active:translate-y-[1px]
                    ${sizeClasses[size]}
                    ${className}
                `}
                aria-label={`Short URL: ${shortUrl}. Click to copy.`}
                aria-haspopup="dialog"
                aria-expanded={isOpen}
            >
                {showIcon && <Link className={`${iconSizes[size]} flex-shrink-0 text-[var(--color-primary)]`} />}
                <span className="truncate">{truncateUrl(shortUrl)}</span>
            </button>

            {/* Tooltip */}
            {isOpen && (
                <div
                    ref={tooltipRef}
                    role="dialog"
                    aria-label="URL details"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    className={`
                        absolute z-50 
                        w-72 p-3
                        bg-white border-3 border-[var(--border-color)]
                        shadow-[4px_4px_0_var(--border-color)]
                        animate-in fade-in-0 zoom-in-95 duration-150
                        ${tooltipPosition === 'top'
                            ? 'bottom-full mb-2'
                            : 'top-full mt-2'
                        }
                        left-0
                    `}
                >
                    {/* Short URL Section */}
                    <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold uppercase text-[var(--color-text-muted)]">
                                Short URL
                            </span>
                            <span className="text-[10px] font-mono text-[var(--color-primary)]">
                                {shortCode}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <code className="flex-1 text-xs font-mono bg-[var(--color-cream)] px-2 py-1.5 border border-[var(--border-color)] truncate">
                                {shortUrl}
                            </code>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    copyToClipboard(shortUrl, 'short');
                                }}
                                className={`
                                    w-8 h-8 flex items-center justify-center flex-shrink-0
                                    border-2 border-[var(--border-color)]
                                    transition-colors
                                    ${copiedField === 'short'
                                        ? 'bg-[var(--color-success)] text-white'
                                        : 'bg-white hover:bg-[var(--color-yellow)]'
                                    }
                                `}
                                aria-label="Copy short URL"
                            >
                                {copiedField === 'short' ? (
                                    <Check className="w-4 h-4" />
                                ) : (
                                    <Copy className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* AWS S3 URL Section */}
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold uppercase text-[var(--color-text-muted)]">
                                S3 URL
                            </span>
                            {awsUrl && (
                                <a
                                    href={awsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[10px] text-[var(--color-primary)] hover:underline flex items-center gap-0.5"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    Open <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                            )}
                        </div>
                        {awsUrl ? (
                            <div className="flex items-center gap-2">
                                <code className="flex-1 text-xs font-mono bg-[var(--color-cream)] px-2 py-1.5 border border-[var(--border-color)] truncate">
                                    {awsUrl}
                                </code>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        copyToClipboard(awsUrl, 'aws');
                                    }}
                                    className={`
                                        w-8 h-8 flex items-center justify-center flex-shrink-0
                                        border-2 border-[var(--border-color)]
                                        transition-colors
                                        ${copiedField === 'aws'
                                            ? 'bg-[var(--color-success)] text-white'
                                            : 'bg-white hover:bg-[var(--color-yellow)]'
                                        }
                                    `}
                                    aria-label="Copy S3 URL"
                                >
                                    {copiedField === 'aws' ? (
                                        <Check className="w-4 h-4" />
                                    ) : (
                                        <Copy className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] bg-[var(--color-cream)] px-2 py-1.5 border border-[var(--border-color)]">
                                <CloudOff className="w-3 h-3" />
                                <span>S3 metadata not available</span>
                            </div>
                        )}
                    </div>

                    {/* Keyboard hint */}
                    <div className="mt-2 pt-2 border-t border-[var(--border-color)]">
                        <p className="text-[10px] text-[var(--color-text-muted)] text-center">
                            Press <kbd className="px-1 py-0.5 bg-[var(--color-cream)] border border-[var(--border-color)] rounded text-[9px]">Tab</kbd> to navigate
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LinkButton;
