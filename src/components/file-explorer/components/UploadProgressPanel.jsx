/**
 * UploadProgressPanel Component
 * Beautiful upload progress display with file previews and animations
 */

import { motion, AnimatePresence } from 'framer-motion';
import { 
    Cancel01Icon, 
    CheckmarkCircle02Icon, 
    File02Icon,
    Image02Icon,
    VideoReplayIcon,
    MusicNote01Icon,
    FileZipIcon,
    FileScriptIcon
} from 'hugeicons-react';

// Get file icon based on extension
const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    
    const iconMap = {
        // Images
        jpg: Image02Icon, jpeg: Image02Icon, png: Image02Icon, gif: Image02Icon, 
        svg: Image02Icon, webp: Image02Icon, ico: Image02Icon,
        
        // Videos
        mp4: VideoReplayIcon, mov: VideoReplayIcon, avi: VideoReplayIcon, 
        mkv: VideoReplayIcon, webm: VideoReplayIcon,
        
        // Audio
        mp3: MusicNote01Icon, wav: MusicNote01Icon, ogg: MusicNote01Icon, 
        flac: MusicNote01Icon, m4a: MusicNote01Icon,
        
        // Archives
        zip: FileZipIcon, rar: FileZipIcon, '7z': FileZipIcon, 
        tar: FileZipIcon, gz: FileZipIcon,
        
        // Code
        js: FileScriptIcon, jsx: FileScriptIcon, ts: FileScriptIcon, 
        tsx: FileScriptIcon, py: FileScriptIcon, java: FileScriptIcon,
        cpp: FileScriptIcon, c: FileScriptIcon, html: FileScriptIcon,
        css: FileScriptIcon, json: FileScriptIcon, xml: FileScriptIcon
    };
    
    return iconMap[ext] || File02Icon;
};

// Format file size
const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

export const UploadProgressPanel = ({ uploadingFiles, onCancel }) => {
    const completedCount = uploadingFiles.filter(f => f.progress === 100).length;
    const totalCount = uploadingFiles.length;
    const overallProgress = uploadingFiles.reduce((sum, f) => sum + f.progress, 0) / totalCount;

    return (
        <AnimatePresence>
            {uploadingFiles.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="fixed bottom-0 sm:bottom-6 right-0 sm:right-6 w-full sm:w-[420px] bg-zinc-900/98 border-t sm:border border-white/10 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden z-50 backdrop-blur-2xl"
                >
                    {/* Header */}
                    <div className="px-5 py-4 border-b border-white/10 bg-gradient-to-r from-zinc-950/80 to-zinc-900/80">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                    className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center"
                                >
                                    <div className="w-6 h-6 rounded-full bg-zinc-900 flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                                    </div>
                                </motion.div>
                                <div>
                                    <h4 className="text-sm font-bold text-white">
                                        Uploading Files
                                    </h4>
                                    <p className="text-xs text-zinc-400">
                                        {completedCount} of {totalCount} completed
                                    </p>
                                </div>
                            </div>
                            
                            {/* Overall Progress Circle */}
                            <div className="relative w-12 h-12">
                                <svg className="w-12 h-12 transform -rotate-90">
                                    <circle
                                        cx="24"
                                        cy="24"
                                        r="20"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        fill="none"
                                        className="text-white/10"
                                    />
                                    <motion.circle
                                        cx="24"
                                        cy="24"
                                        r="20"
                                        stroke="url(#gradient)"
                                        strokeWidth="3"
                                        fill="none"
                                        strokeLinecap="round"
                                        initial={{ strokeDasharray: '0 126' }}
                                        animate={{ 
                                            strokeDasharray: `${(overallProgress / 100) * 126} 126` 
                                        }}
                                        transition={{ duration: 0.5, ease: 'easeOut' }}
                                    />
                                    <defs>
                                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#3b82f6" />
                                            <stop offset="100%" stopColor="#3b82f6" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-xs font-bold text-white">
                                        {Math.round(overallProgress)}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* File List */}
                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        <div className="p-3 space-y-2">
                            <AnimatePresence mode="popLayout">
                                {uploadingFiles.slice(0, 5).map((file, index) => {
                                    const FileIcon = getFileIcon(file.name);
                                    const isComplete = file.progress === 100;
                                    
                                    return (
                                        <motion.div
                                            key={file.id}
                                            initial={{ opacity: 0, x: -20, scale: 0.9 }}
                                            animate={{ opacity: 1, x: 0, scale: 1 }}
                                            exit={{ opacity: 0, x: 20, scale: 0.9 }}
                                            transition={{ 
                                                delay: index * 0.05,
                                                type: 'spring',
                                                damping: 20,
                                                stiffness: 300
                                            }}
                                            className={`relative p-3 rounded-xl border transition-all ${
                                                isComplete 
                                                    ? 'bg-green-500/10 border-green-500/30' 
                                                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                                            }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                {/* File Icon */}
                                                <motion.div
                                                    animate={isComplete ? { scale: [1, 1.2, 1] } : {}}
                                                    transition={{ duration: 0.3 }}
                                                    className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                                                        isComplete 
                                                            ? 'bg-green-500/20' 
                                                            : 'bg-blue-500/20'
                                                    }`}
                                                >
                                                    {isComplete ? (
                                                        <CheckmarkCircle02Icon className="w-5 h-5 text-green-400" />
                                                    ) : (
                                                        <FileIcon className="w-5 h-5 text-blue-400" />
                                                    )}
                                                </motion.div>

                                                {/* File Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2 mb-1">
                                                        <p className="text-sm font-medium text-white truncate">
                                                            {file.name}
                                                        </p>
                                                        <span className={`text-xs font-bold tabular-nums flex-shrink-0 ${
                                                            isComplete ? 'text-green-400' : 'text-zinc-400'
                                                        }`}>
                                                            {Math.round(file.progress)}%
                                                        </span>
                                                    </div>
                                                    
                                                    {file.size && (
                                                        <p className="text-xs text-zinc-500 mb-2">
                                                            {formatSize(file.size)}
                                                        </p>
                                                    )}

                                                    {/* Progress Bar */}
                                                    <div className="relative h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                        <motion.div
                                                            className={`h-full rounded-full ${
                                                                isComplete
                                                                    ? 'bg-green-500'
                                                                    : 'bg-blue-500'
                                                            }`}
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${file.progress}%` }}
                                                            transition={{ duration: 0.3, ease: 'easeOut' }}
                                                        />
                                                        
                                                        {/* Shimmer effect for active uploads */}
                                                        {!isComplete && (
                                                            <motion.div
                                                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                                                animate={{ x: ['-100%', '200%'] }}
                                                                transition={{ 
                                                                    duration: 1.5, 
                                                                    repeat: Infinity,
                                                                    ease: 'linear'
                                                                }}
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>

                            {/* Show more indicator */}
                            {uploadingFiles.length > 5 && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center py-2"
                                >
                                    <p className="text-xs text-zinc-500">
                                        + {uploadingFiles.length - 5} more files uploading...
                                    </p>
                                </motion.div>
                            )}
                        </div>
                    </div>

                    {/* Footer with stats */}
                    <div className="px-5 py-3 border-t border-white/10 bg-zinc-950/50">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-zinc-400">
                                {completedCount === totalCount ? (
                                    <span className="text-green-400 font-medium">✓ All files uploaded</span>
                                ) : (
                                    <span>Uploading in progress...</span>
                                )}
                            </span>
                            <motion.div
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="flex items-center gap-1 text-blue-400"
                            >
                                <div className="w-1 h-1 rounded-full bg-blue-400" />
                                <div className="w-1 h-1 rounded-full bg-blue-400" />
                                <div className="w-1 h-1 rounded-full bg-blue-400" />
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
