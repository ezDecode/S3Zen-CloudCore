/**
 * Download Manager Component
 * Manages and displays active and completed downloads
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Download01Icon, CheckmarkCircle02Icon, CancelCircleIcon, Cancel01Icon, ArrowShrink01Icon, ArrowExpand01Icon } from 'hugeicons-react';
import { useState } from 'react';

export const DownloadManager = ({ downloads, onRemove, onClear }) => {
    const [isMinimized, setIsMinimized] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);

    const activeDownloads = downloads.filter(d => d.status === 'downloading');
    const completedDownloads = downloads.filter(d => d.status === 'completed');
    const failedDownloads = downloads.filter(d => d.status === 'failed');

    if (downloads.length === 0) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="fixed bottom-20 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 w-auto sm:w-96 bg-zinc-900/98 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-40"
            >
                {/* Header */}
                <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-zinc-950/50">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        <h4 className="text-sm font-normal text-white">
                            Downloads {activeDownloads.length > 0 && `(${activeDownloads.length})`}
                        </h4>
                    </div>
                    <div className="flex items-center gap-1">
                        {downloads.length > 0 && (
                            <button
                                onClick={onClear}
                                className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/4 rounded-lg transition-colors duration-150 text-xs font-normal"
                                title="Clear all"
                            >
                                Clear
                            </button>
                        )}
                        <button
                            onClick={() => setIsMinimized(!isMinimized)}
                            className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                            title={isMinimized ? 'Expand' : 'Minimize'}
                        >
                            {isMinimized ? <ArrowExpand01Icon className="w-4 h-4" /> : <ArrowShrink01Icon className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                {/* Downloads List */}
                <AnimatePresence>
                    {!isMinimized && (
                        <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            className="p-4 space-y-3 max-h-80 overflow-y-auto custom-scrollbar"
                        >
                            {/* Active Downloads */}
                            {activeDownloads.map((download) => (
                                <motion.div
                                    key={download.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    className="space-y-2"
                                >
                                    <div className="flex justify-between items-start gap-2">
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                            <Download01Icon className="w-4 h-4 text-blue-400 shrink-0" />
                                            <span className="text-sm font-normal text-white truncate">
                                                {download.name}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className="text-xs font-normal text-zinc-400 tabular-nums">
                                                {download.progress}%
                                            </span>
                                            <button
                                                onClick={() => onRemove(download.id)}
                                                className="p-0.5 text-white/40 hover:text-white hover:bg-white/10 rounded transition-all"
                                            >
                                                <Cancel01Icon className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${download.progress}%` }}
                                            transition={{ duration: 0.3, ease: 'easeOut' }}
                                        />
                                    </div>
                                    {download.size && (
                                        <p className="text-xs text-white/40">
                                            {formatBytes(download.loaded || 0)} / {formatBytes(download.size)}
                                        </p>
                                    )}
                                </motion.div>
                            ))}

                            {/* Completed Downloads */}
                            {completedDownloads.map((download) => (
                                <motion.div
                                    key={download.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    className="flex items-center justify-between gap-2 p-2 bg-green-500/10 border border-green-500/20 rounded-lg"
                                >
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <CheckmarkCircle02Icon className="w-4 h-4 text-green-400 shrink-0" />
                                        <span className="text-sm text-white truncate">{download.name}</span>
                                    </div>
                                    <button
                                        onClick={() => onRemove(download.id)}
                                        className="p-0.5 text-white/40 hover:text-white hover:bg-white/10 rounded transition-all"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </motion.div>
                            ))}

                            {/* Failed Downloads */}
                            {failedDownloads.map((download) => (
                                <motion.div
                                    key={download.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    className="flex items-center justify-between gap-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg"
                                >
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <CancelCircleIcon className="w-4 h-4 text-red-400 shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-white truncate">{download.name}</p>
                                            <p className="text-xs text-red-400">{download.error || 'Download failed'}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => onRemove(download.id)}
                                        className="p-0.5 text-white/40 hover:text-white hover:bg-white/10 rounded transition-all"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </motion.div>
                            ))}

                            {downloads.length === 0 && (
                                <div className="text-center py-8">
                                    <p className="text-sm text-white/40">No downloads</p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </AnimatePresence>
    );
};

// Helper function to format bytes
const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};
