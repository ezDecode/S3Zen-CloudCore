/**
 * ShareModal Component
 * Modal for generating and sharing presigned URLs
 */

import { useState } from 'react';
import { Cancel01Icon, Link01Icon, Copy01Icon, Tick02Icon, ArrowDown01Icon } from 'hugeicons-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { generateShareableLink } from '../../services/aws/s3Service';
import { shortenUrl } from '../../services/urlShortener';
import { Button } from '../ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu';

const EXPIRATION_OPTIONS = [
    { value: 3600, label: '1 hour' },
    { value: 10800, label: '3 hours' },
    { value: 21600, label: '6 hours' },
    { value: 43200, label: '12 hours' },
    { value: 86400, label: '24 hours' },
    { value: 604800, label: '7 days' }
];

export const ShareModal = ({ isOpen, onClose, item }) => {

    const [url, setUrl] = useState('');
    const [expiresIn, setExpiresIn] = useState(3600); // 1 hour default
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isCopying, setIsCopying] = useState(false);

    const handleGenerate = async () => {
        setIsLoading(true);
        try {
            // Step 1: Generate presigned URL from S3
            const result = await generateShareableLink(item.key, expiresIn);

            if (!result.success) {
                toast.error(`Failed to generate link: ${result.error}`);
                setIsLoading(false);
                return;
            }

            // Step 2: Shorten the long presigned URL
            const shortenResult = await shortenUrl(result.url);

            if (!shortenResult.success) {
                // If shortener fails, show warning but still use the long URL
                console.warn('URL shortener failed:', shortenResult.error);
                toast.warning('Using full URL (shortener unavailable)');
                setUrl(result.url);
            } else {
                // Use the shortened URL
                setUrl(shortenResult.shortUrl);
                toast.success('Short link generated');
            }
        } catch (error) {
            toast.error('Failed to generate link');
            console.error('Generate link error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = async () => {
        setIsCopying(true);
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            toast.success('Link copied to clipboard');
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            toast.error('Failed to copy link');
            console.error('Copy error:', error);
        } finally {
            setTimeout(() => setIsCopying(false), 300);
        }
    };

    const handleClose = () => {
        setUrl('');
        setCopied(false);
        onClose();
    };

    if (!item) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={handleClose}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-zinc-900/98 backdrop-blur-2xl rounded-2xl shadow-2xl w-full max-w-lg border border-white/10 z-50 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-white/10">
                            <div className="flex items-center gap-2">
                                <Link01Icon className="w-5 h-5 text-purple-400" />
                                <h2 className="text-lg font-normal text-white">Share File</h2>
                            </div>
                            <Button
                                onClick={handleClose}
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                            >
                                <Cancel01Icon className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Content */}
                        <div className="p-5 space-y-4">
                            <div>
                                <p className="text-sm text-white/70">File: <span className="font-normal text-white">{item.name}</span></p>
                            </div>

                            {/* Expiration */}
                            <div>
                                <label className="block text-xs font-normal text-white/70 mb-1.5">
                                    Link expires in
                                </label>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-between bg-white/5 border-white/10 hover:border-purple-500/50 hover:bg-white/10"
                                        >
                                            <span className="text-sm">
                                                {EXPIRATION_OPTIONS.find(opt => opt.value === expiresIn)?.label || '1 hour'}
                                            </span>
                                            <ArrowDown01Icon className="w-4 h-4 opacity-40" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] bg-zinc-900 border-zinc-800 p-2">
                                        {EXPIRATION_OPTIONS.map((option) => (
                                            <DropdownMenuItem
                                                key={option.value}
                                                className="cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800 rounded-md px-3 py-2 mb-1 last:mb-0"
                                                onSelect={() => setExpiresIn(option.value)}
                                            >
                                                {option.label}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* Generate Button */}
                            {!url && (
                                <Button
                                    onClick={handleGenerate}
                                    disabled={isLoading}
                                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                                >
                                    {isLoading ? 'Generating...' : 'Generate Link'}
                                </Button>
                            )}

                            {/* Generated URL */}
                            {url && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-3"
                                >
                                    <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <p className="text-xs text-white/60">Shareable link:</p>
                                        </div>
                                        <p className="text-xs text-white break-all font-mono">{url}</p>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            onClick={handleCopy}
                                            disabled={isCopying}
                                            variant="secondary"
                                            className="flex-1"
                                        >
                                            {isCopying ? (
                                                <>
                                                    <motion.div
                                                        animate={{ rotate: 360 }}
                                                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                                                    />
                                                    <span>Copying...</span>
                                                </>
                                            ) : copied ? (
                                                <>
                                                    <Tick02Icon className="w-4 h-4" />
                                                    <span>Copied!</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Copy01Icon className="w-4 h-4" />
                                                    <span>Copy Link</span>
                                                </>
                                            )}
                                        </Button>

                                        <Button
                                            onClick={handleGenerate}
                                            disabled={isLoading}
                                            variant="secondary"
                                        >
                                            Regenerate
                                        </Button>
                                    </div>
                                </motion.div>
                            )}

                            <p className="text-xs text-white/50 text-center">
                                Anyone with this link can download the file until it expires.
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
