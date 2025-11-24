/**
 * ShareModal Component
 * Modal for generating and sharing presigned URLs
 */

import { useState } from 'react';
import { Cancel01Icon, Link01Icon, Copy01Icon, Tick02Icon, ArrowDown01Icon } from 'hugeicons-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../common/Toast';
import { generateShareableLink } from '../../services/aws/s3Service';
import { shortenUrl } from '../../services/urlShortener';

export const ShareModal = ({ isOpen, onClose, item }) => {
    const toast = useToast();
    const [url, setUrl] = useState('');
    const [expiresIn, setExpiresIn] = useState(3600); // 1 hour default
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);

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

    const handleCopy = () => {
        navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success('Link copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={handleClose}>
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
                                <h2 className="text-lg font-bold text-white">Share File</h2>
                            </div>
                            <button
                                onClick={handleClose}
                                className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
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
                                        className="w-full px-4 py-3 pr-10 text-sm bg-white/5 border border-white/10 rounded-lg text-white appearance-none cursor-pointer focus:outline-none focus:border-purple-500/50 focus:bg-white/10 focus:ring-2 focus:ring-purple-500/10 transition-all"
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

                            {/* Generate Button */}
                            {!url && (
                                <button
                                    onClick={handleGenerate}
                                    disabled={isLoading}
                                    className="w-full py-2.5 px-4 text-sm bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 hover:shadow-lg hover:shadow-purple-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                                        </div>
                                        <p className="text-xs text-white break-all font-mono">{url}</p>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleCopy}
                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-sm bg-white/10 hover:bg-white/15 text-white rounded-lg transition-all hover:scale-[1.02] font-medium"
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
                                            className="px-4 py-2.5 text-sm bg-white/10 hover:bg-white/15 text-white rounded-lg transition-all font-medium"
                                        >
                                            Regenerate
                                        </button>
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
