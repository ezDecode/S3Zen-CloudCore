/**
 * ShareModal Component
 * Modal for generating and sharing presigned URLs
 */

import { useState } from 'react';
import { X, Link2, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { generateShareableLink } from '../../services/aws/s3Service';

export const ShareModal = ({ isOpen, onClose, item }) => {
    const [url, setUrl] = useState('');
    const [expiresIn, setExpiresIn] = useState(3600); // 1 hour default
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleGenerate = async () => {
        setIsLoading(true);
        try {
            const result = await generateShareableLink(item.key, expiresIn);
            if (result.success) {
                setUrl(result.url);
                toast.success('Shareable link generated');
            } else {
                toast.error(`Failed to generate link: ${result.error}`);
            }
        } catch (error) {
            toast.error('Failed to generate link');
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-lg border border-white/20"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-white/10">
                            <div className="flex items-center gap-2">
                                <Link2 className="w-5 h-5 text-purple-400" />
                                <h2 className="text-lg font-bold text-white">Share File</h2>
                            </div>
                            <button
                                onClick={handleClose}
                                className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
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
                                <select
                                    value={expiresIn}
                                    onChange={(e) => setExpiresIn(parseInt(e.target.value))}
                                    className="w-full px-3 py-2.5 text-sm bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50 transition-all"
                                >
                                    <option value={3600}>1 hour</option>
                                    <option value={10800}>3 hours</option>
                                    <option value={21600}>6 hours</option>
                                    <option value={43200}>12 hours</option>
                                    <option value={86400}>24 hours</option>
                                    <option value={604800}>7 days</option>
                                </select>
                            </div>

                            {/* Generate Button */}
                            {!url && (
                                <button
                                    onClick={handleGenerate}
                                    disabled={isLoading}
                                    className="w-full py-2.5 px-4 text-sm bg-linear-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                                        <p className="text-xs text-white/60 mb-1.5">Shareable link:</p>
                                        <p className="text-xs text-white break-all font-mono">{url}</p>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleCopy}
                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-sm bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
                                        >
                                            {copied ? (
                                                <>
                                                    <Check className="w-4 h-4" />
                                                    <span>Copied!</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="w-4 h-4" />
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
                                Anyone with this link can download the file until it expires.
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
