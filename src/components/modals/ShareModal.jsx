/**
 * ShareModal Component
 * Modal for generating and sharing presigned URLs
 */

import { useState } from 'react';
import { Cancel01Icon, Link01Icon, Copy01Icon, Tick02Icon, ArrowDown01Icon } from 'hugeicons-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../common/Toast';
import { generateShareableLink } from '../../services/aws/s3Service';
import { createShortUrl, isShortenerAvailable } from '../../services/urlShortener';

export const ShareModal = ({ isOpen, onClose, item }) => {
    const toast = useToast();
    const [url, setUrl] = useState(''); // Display URL (short or long)
    const [longUrl, setLongUrl] = useState(''); // Original presigned URL
    const [shortUrl, setShortUrl] = useState(''); // Shortened URL
    const [expiresIn, setExpiresIn] = useState(3600); // 1 hour default
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [useShortener, setUseShortener] = useState(true); // Toggle for URL shortening

    const handleGenerate = async () => {
        setIsLoading(true);
        try {
            // Generate presigned URL from S3
            const result = await generateShareableLink(item.key, expiresIn);

            if (!result.success) {
                toast.error(`Failed to generate link: ${result.error}`);
                setIsLoading(false);
                return;
            }

            const presignedUrl = result.url;
            setLongUrl(presignedUrl);

            // Try to shorten the URL if enabled and shortener is available
            if (useShortener && isShortenerAvailable()) {
                const shortResult = await createShortUrl(presignedUrl, expiresIn);

                if (shortResult.success) {
                    setShortUrl(shortResult.shortUrl);
                    setUrl(shortResult.shortUrl);
                    toast.success('Short link generated');
                } else {
                    // Fallback to long URL if shortening fails
                    console.warn('URL shortening failed:', shortResult.error);
                    setUrl(presignedUrl);
                    setShortUrl('');
                    toast.success('Shareable link generated (shortener unavailable)');
                }
            } else {
                // Use long URL directly
                setUrl(presignedUrl);
                setShortUrl('');
                toast.success('Shareable link generated');
            }
        } catch (error) {
            toast.error('Failed to generate link');
            console.error('Generate link error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success('Link copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleClose = () => {
        setUrl('');
        setLongUrl('');
        setShortUrl('');
        setCopied(false);
        onClose();
    };

    if (!item) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={handleClose}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-zinc-900/95 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-lg border border-white/20 z-50"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-white/10">
                            <div className="flex items-center gap-2">
                                <Link01Icon className="w-5 h-5 text-purple-400" />
                                <h2 className="text-lg font-bold text-white">Share File</h2>
                            </div>
                            <button
                                onClick={handleClose}
                                className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <Cancel01Icon className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-5 space-y-4">
                            <div>
                                <p className="text-sm text-white/70">File: <span className="font-medium text-white">{item.name}</span></p>
                            </div>

                            {/* Expiration */}
                            <div>
                                <label className="block text-xs font-medium text-white/70 mb-1.5">
                                    Link expires in
                                </label>
                                <div className="relative">
                                    <select
                                        value={expiresIn}
                                        onChange={(e) => setExpiresIn(parseInt(e.target.value))}
                                        className="w-full px-4 py-3 pr-10 text-sm bg-white/5 border border-white/10 rounded-lg text-white appearance-none cursor-pointer focus:outline-none focus:border-purple-500/50 focus:bg-white/10 focus:ring-2 focus:ring-purple-500/20 transition-all"
                                        style={{
                                            backgroundImage: 'none'
                                        }}
                                    >
                                        <option value={3600} className="bg-zinc-900 text-white py-2">1 hour</option>
                                        <option value={10800} className="bg-zinc-900 text-white py-2">3 hours</option>
                                        <option value={21600} className="bg-zinc-900 text-white py-2">6 hours</option>
                                        <option value={43200} className="bg-zinc-900 text-white py-2">12 hours</option>
                                        <option value={86400} className="bg-zinc-900 text-white py-2">24 hours</option>
                                        <option value={604800} className="bg-zinc-900 text-white py-2">7 days</option>
                                    </select>
                                    <ArrowDown01Icon className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none w-4 h-4" />
                                </div>
                            </div>

                            {/* URL Shortener Toggle */}
                            {isShortenerAvailable() && (
                                <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg">
                                    <div>
                                        <p className="text-sm font-medium text-white">Use Short URL</p>
                                        <p className="text-xs text-white/60 mt-0.5">Create a shorter, more shareable link</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setUseShortener(!useShortener)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${useShortener ? 'bg-purple-600' : 'bg-white/20'
                                            }`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${useShortener ? 'translate-x-6' : 'translate-x-1'
                                                }`}
                                        />
                                    </button>
                                </div>
                            )}

                            {/* Generate Button */}
                            {!url && (
                                <button
                                    onClick={handleGenerate}
                                    disabled={isLoading}
                                    className="w-full py-2.5 px-4 text-sm bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? 'Generating...' : 'Generate Link'}
                                </button>
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
                                            {shortUrl && (
                                                <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-md border border-purple-500/30">
                                                    Short URL
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-white break-all font-mono">{url}</p>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleCopy}
                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-sm bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
                                        >
                                            {copied ? (
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
                                        </button>

                                        <button
                                            onClick={handleGenerate}
                                            disabled={isLoading}
                                            className="px-4 py-2.5 text-sm bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
                                        >
                                            Regenerate
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            <p className="text-xs text-white/50 text-center">
                                {shortUrl
                                    ? 'This short link will redirect to your file. Anyone with this link can download the file until it expires.'
                                    : 'Anyone with this link can download the file until it expires.'
                                }
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
