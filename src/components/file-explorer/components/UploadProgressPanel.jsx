/**
 * UploadProgressPanel Component
 * Beautiful upload progress display with single progress bar and smooth animations
 * Progress is calculated based on file count: e.g., 20 files = 5% per completed file
 */

import { motion, AnimatePresence, animate } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import { 
    Cancel01Icon, 
    CheckmarkCircle02Icon, 
    File02Icon,
    ArrowUp02Icon,
    Minimize01Icon
} from 'hugeicons-react';
import { Button } from '../../ui/button';

// Format file size
const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

// Animated counter component for smooth number transitions
const AnimatedNumber = ({ value, className }) => {
    const [displayValue, setDisplayValue] = useState(value);
    
    useEffect(() => {
        const controls = animate(displayValue, value, {
            duration: 0.4,
            ease: 'easeOut',
            onUpdate: (latest) => setDisplayValue(Math.round(latest))
        });
        return () => controls.stop();
    }, [value]);
    
    return <span className={className}>{displayValue}</span>;
};

export const UploadProgressPanel = ({ uploadingFiles, onCancel }) => {
    const [isMinimized, setIsMinimized] = useState(false);
    const [showFileList, setShowFileList] = useState(false);
    
    // Calculate progress based on file count
    const { totalCount, completedCount, overallProgress, totalSize, uploadedSize, currentFile } = useMemo(() => {
        const total = uploadingFiles.length;
        const completed = uploadingFiles.filter(f => f.progress === 100).length;
        // Calculate overall progress based on individual file progress (more accurate)
        const avgProgress = total > 0 
            ? uploadingFiles.reduce((sum, f) => sum + f.progress, 0) / total 
            : 0;
        const totalBytes = uploadingFiles.reduce((sum, f) => sum + (f.size || 0), 0);
        const uploadedBytes = uploadingFiles.reduce((sum, f) => sum + ((f.size || 0) * f.progress / 100), 0);
        const current = uploadingFiles.find(f => f.progress > 0 && f.progress < 100);
        
        return {
            totalCount: total,
            completedCount: completed,
            overallProgress: avgProgress,
            totalSize: totalBytes,
            uploadedSize: uploadedBytes,
            currentFile: current
        };
    }, [uploadingFiles]);

    const isAllComplete = completedCount === totalCount && totalCount > 0;

    // Auto-close after all complete
    useEffect(() => {
        if (isAllComplete) {
            const timer = setTimeout(() => {
                onCancel?.();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isAllComplete, onCancel]);

    if (uploadingFiles.length === 0) return null;

    return (
        <AnimatePresence mode="wait">
            <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 30, scale: 0.95, transition: { duration: 0.2 } }}
                transition={{ type: 'spring', damping: 28, stiffness: 350 }}
                className="fixed bottom-6 right-6 z-50"
            >
                {/* Minimized View */}
                <AnimatePresence mode="wait">
                    {isMinimized ? (
                        <motion.div
                            key="minimized"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            onClick={() => setIsMinimized(false)}
                            className="w-14 h-14 rounded-full bg-zinc-900/95 backdrop-blur-xl border border-white/10 shadow-2xl cursor-pointer flex items-center justify-center relative group hover:bg-zinc-900 hover:border-white/[0.15] transition-colors duration-150"
                        >
                            <svg className="w-12 h-12 -rotate-90">
                                <circle
                                    cx="24" cy="24" r="20"
                                    stroke="currentColor" strokeWidth="3" fill="none"
                                    className="text-white/10"
                                />
                                <motion.circle
                                    cx="24" cy="24" r="20"
                                    stroke="currentColor" strokeWidth="3" fill="none"
                                    strokeLinecap="round"
                                    className={isAllComplete ? 'text-green-400' : 'text-blue-400'}
                                    initial={{ strokeDasharray: '0 126' }}
                                    animate={{ strokeDasharray: `${overallProgress * 1.26} 126` }}
                                    transition={{ duration: 0.5, ease: 'easeOut' }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                {isAllComplete ? (
                                    <CheckmarkCircle02Icon className="w-5 h-5 text-green-400" />
                                ) : (
                                    <span className="text-xs font-normal text-white">{Math.round(overallProgress)}%</span>
                                )}
                            </div>
                            
                            {/* Pulse effect when uploading */}
                            {!isAllComplete && (
                                <motion.div
                                    className="absolute inset-0 rounded-full bg-blue-500/20"
                                    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                />
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="expanded"
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="w-80 bg-zinc-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden"
                        >
                            {/* Header */}
                            <div className={`px-4 py-3 border-b border-white/5 ${
                                isAllComplete 
                                    ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10' 
                                    : 'bg-gradient-to-r from-blue-500/10 to-indigo-500/10'
                            }`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <motion.div
                                            animate={isAllComplete ? { scale: [1, 1.1, 1] } : { y: [0, -2, 0] }}
                                            transition={{ 
                                                duration: isAllComplete ? 0.5 : 1.5, 
                                                repeat: isAllComplete ? 0 : Infinity,
                                                ease: 'easeInOut'
                                            }}
                                            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                                                isAllComplete ? 'bg-green-500/20' : 'bg-blue-500/20'
                                            }`}
                                        >
                                            {isAllComplete ? (
                                                <CheckmarkCircle02Icon className="w-5 h-5 text-green-400" />
                                            ) : (
                                                <ArrowUp02Icon className="w-5 h-5 text-blue-400" />
                                            )}
                                        </motion.div>
                                        <div>
                                            <h3 className="text-sm font-normal text-white">
                                                {isAllComplete ? 'Upload Complete!' : 'Uploading...'}
                                            </h3>
                                            <p className="text-xs text-zinc-400">
                                                <AnimatedNumber value={completedCount} /> of {totalCount} files
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-1">
                                        <Button
                                            onClick={() => setIsMinimized(true)}
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-zinc-400"
                                        >
                                            <Minimize01Icon className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            onClick={onCancel}
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-zinc-400"
                                        >
                                            <Cancel01Icon className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Main Progress Section */}
                            <div className="p-4">
                                {/* Large Percentage Display */}
                                <div className="text-center mb-4">
                                    <motion.div
                                        className="relative inline-block"
                                        animate={isAllComplete ? { scale: [1, 1.05, 1] } : {}}
                                        transition={{ duration: 0.5 }}
                                    >
                                        <span className={`text-5xl font-normal tabular-nums ${
                                            isAllComplete ? 'text-green-400' : 'text-white'
                                        }`}>
                                            <AnimatedNumber value={Math.round(overallProgress)} />
                                        </span>
                                        <span className={`text-2xl font-normal ${
                                            isAllComplete ? 'text-green-400/70' : 'text-zinc-500'
                                        }`}>%</span>
                                    </motion.div>
                                    
                                    {totalSize > 0 && (
                                        <p className="text-xs text-zinc-500 mt-1">
                                            {formatSize(uploadedSize)} of {formatSize(totalSize)}
                                        </p>
                                    )}
                                </div>

                                {/* Single Progress Bar */}
                                <div className="relative h-3 w-full bg-zinc-800 rounded-full overflow-hidden">
                                    {/* Background gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-zinc-800 to-zinc-700/50" />
                                    
                                    {/* Progress fill */}
                                    <motion.div
                                        className={`absolute h-full rounded-full ${
                                            isAllComplete
                                                ? 'bg-gradient-to-r from-green-500 to-emerald-400'
                                                : 'bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500'
                                        }`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${overallProgress}%` }}
                                        transition={{ 
                                            duration: 0.6, 
                                            ease: [0.25, 0.46, 0.45, 0.94]
                                        }}
                                    />
                                    
                                    {/* Animated glow effect */}
                                    {!isAllComplete && overallProgress > 0 && (
                                        <motion.div
                                            className="absolute h-full w-20 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                            animate={{ 
                                                left: ['-20%', `${Math.min(overallProgress, 100)}%`]
                                            }}
                                            transition={{ 
                                                duration: 1.8, 
                                                repeat: Infinity,
                                                ease: 'easeInOut'
                                            }}
                                        />
                                    )}
                                    
                                    {/* Completion sparkle effect */}
                                    {isAllComplete && (
                                        <motion.div
                                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                                            initial={{ x: '-100%' }}
                                            animate={{ x: '200%' }}
                                            transition={{ 
                                                duration: 0.8,
                                                ease: 'easeOut'
                                            }}
                                        />
                                    )}
                                </div>

                                {/* File Counter Pills */}
                                <div className="flex items-center justify-center gap-2 mt-4">
                                    <motion.div
                                        layout
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10"
                                    >
                                        <div className={`w-2 h-2 rounded-full ${
                                            completedCount > 0 ? 'bg-green-400' : 'bg-zinc-600'
                                        }`} />
                                        <span className="text-xs text-zinc-300">
                                            <AnimatedNumber value={completedCount} className="font-normal" /> completed
                                        </span>
                                    </motion.div>
                                    
                                    {!isAllComplete && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20"
                                        >
                                            <motion.div
                                                className="w-2 h-2 rounded-full bg-blue-400"
                                                animate={{ scale: [1, 1.3, 1] }}
                                                transition={{ duration: 1, repeat: Infinity }}
                                            />
                                            <span className="text-xs text-blue-300">
                                                {totalCount - completedCount} remaining
                                            </span>
                                        </motion.div>
                                    )}
                                </div>

                                {/* Current File Indicator */}
                                {currentFile && !isAllComplete && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-4 p-3 rounded-xl bg-white/5 border border-white/10"
                                    >
                                        <div className="flex items-center gap-3">
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                                className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0"
                                            >
                                                <ArrowUp02Icon className="w-4 h-4 text-blue-400" />
                                            </motion.div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs text-zinc-500 mb-0.5">Currently uploading</p>
                                                <p className="text-sm text-white truncate font-normal">
                                                    {currentFile.name}
                                                </p>
                                            </div>
                                            <span className="text-sm font-normal text-blue-400 tabular-nums">
                                                {Math.round(currentFile.progress)}%
                                            </span>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Toggle File List Button */}
                                {totalCount > 1 && (
                                    <motion.button
                                        onClick={() => setShowFileList(!showFileList)}
                                        className="w-full mt-3 py-2 text-xs text-zinc-400 hover:text-white transition-colors flex items-center justify-center gap-1"
                                    >
                                        {showFileList ? 'Hide' : 'Show'} all files
                                        <motion.svg
                                            className="w-3 h-3"
                                            animate={{ rotate: showFileList ? 180 : 0 }}
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </motion.svg>
                                    </motion.button>
                                )}

                                {/* File List (Collapsible) */}
                                <AnimatePresence>
                                    {showFileList && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="mt-3 space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                                                {uploadingFiles.map((file, index) => {
                                                    const isComplete = file.progress === 100;
                                                    return (
                                                        <motion.div
                                                            key={file.id || file.name}
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: index * 0.03 }}
                                                            className={`flex items-center gap-2 p-2 rounded-lg ${
                                                                isComplete ? 'bg-green-500/10' : 'bg-white/5'
                                                            }`}
                                                        >
                                                            {isComplete ? (
                                                                <CheckmarkCircle02Icon className="w-4 h-4 text-green-400 flex-shrink-0" />
                                                            ) : (
                                                                <File02Icon className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                                                            )}
                                                            <span className="text-xs text-zinc-300 truncate flex-1">
                                                                {file.name}
                                                            </span>
                                                            <span className={`text-xs font-normal tabular-nums ${
                                                                isComplete ? 'text-green-400' : 'text-zinc-500'
                                                            }`}>
                                                                {Math.round(file.progress)}%
                                                            </span>
                                                        </motion.div>
                                                    );
                                                })}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Footer */}
                            {isAllComplete && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="px-4 py-3 border-t border-white/5 bg-green-500/5"
                                >
                                    <div className="flex items-center justify-center gap-2 text-sm text-green-400">
                                        <CheckmarkCircle02Icon className="w-4 h-4" />
                                        <span className="font-normal">All files uploaded successfully!</span>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </AnimatePresence>
    );
};
