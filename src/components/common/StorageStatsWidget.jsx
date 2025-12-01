/**
 * StorageStatsWidget Component
 * Displays bucket storage usage, file/folder counts, and file type breakdown
 */

import { memo } from 'react';
import { motion } from 'framer-motion';
import { 
    HardDriveIcon, 
    File01Icon, 
    Folder01Icon, 
    RefreshIcon,
    AlertCircleIcon,
    Image01Icon,
    Video01Icon,
    MusicNote01Icon,
    FileAttachmentIcon,
    SourceCodeIcon,
    Archive01Icon,
    File02Icon
} from 'hugeicons-react';
import { formatFileSize } from '../../utils/formatters';

// File type config with icons and colors
const FILE_TYPE_CONFIG = {
    images: { icon: Image01Icon, color: 'text-pink-400', bg: 'bg-pink-500/20' },
    videos: { icon: Video01Icon, color: 'text-purple-400', bg: 'bg-purple-500/20' },
    audio: { icon: MusicNote01Icon, color: 'text-cyan-400', bg: 'bg-cyan-500/20' },
    documents: { icon: FileAttachmentIcon, color: 'text-orange-400', bg: 'bg-orange-500/20' },
    code: { icon: SourceCodeIcon, color: 'text-green-400', bg: 'bg-green-500/20' },
    archives: { icon: Archive01Icon, color: 'text-amber-400', bg: 'bg-amber-500/20' },
    other: { icon: File02Icon, color: 'text-zinc-400', bg: 'bg-zinc-500/20' }
};

export const StorageStatsWidget = memo(({ 
    totalSize = 0, 
    fileCount = 0, 
    folderCount = 0,
    fileTypes = null,
    isLoading = false,
    error = null,
    onRefresh
}) => {
    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <HardDriveIcon className="w-5 h-5 text-blue-400" />
                    <h3 className="text-sm font-normal text-white">Storage Stats</h3>
                </div>
                <button
                    onClick={onRefresh}
                    disabled={isLoading}
                    className="p-1.5 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
                    title="Refresh stats"
                >
                    <motion.div
                        animate={isLoading ? { rotate: 360 } : {}}
                        transition={{ duration: 1, repeat: isLoading ? Infinity : 0, ease: 'linear' }}
                    >
                        <RefreshIcon className="w-4 h-4 text-zinc-400" />
                    </motion.div>
                </button>
            </div>

            {error ? (
                <div className="flex items-center gap-2 text-red-400 text-sm">
                    <AlertCircleIcon className="w-4 h-4" />
                    <span>Failed to load stats</span>
                </div>
            ) : (
                <>
                    {/* Total Storage Used */}
                    <div className="mb-4 p-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg border border-white/10">
                        <p className="text-xs text-zinc-400 mb-1">Total Used</p>
                        <p className="text-2xl font-normal text-white tabular-nums">
                            {isLoading ? '...' : formatFileSize(totalSize)}
                        </p>
                    </div>

                    {/* Files & Folders Count */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-white/5 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                                <File01Icon className="w-4 h-4 text-green-400" />
                                <span className="text-xs text-zinc-400">Files</span>
                            </div>
                            <p className="text-lg font-normal text-white tabular-nums">
                                {isLoading ? '...' : fileCount.toLocaleString()}
                            </p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                                <Folder01Icon className="w-4 h-4 text-yellow-400" />
                                <span className="text-xs text-zinc-400">Folders</span>
                            </div>
                            <p className="text-lg font-normal text-white tabular-nums">
                                {isLoading ? '...' : folderCount.toLocaleString()}
                            </p>
                        </div>
                    </div>

                    {/* File Types Breakdown */}
                    {fileTypes && (
                        <div>
                            <p className="text-xs text-zinc-500 mb-2 uppercase tracking-wide">By Type</p>
                            <div className="space-y-2">
                                {Object.entries(fileTypes)
                                    .filter(([_, data]) => data.count > 0)
                                    .sort((a, b) => b[1].size - a[1].size)
                                    .map(([type, data]) => {
                                        const config = FILE_TYPE_CONFIG[type];
                                        const Icon = config.icon;
                                        return (
                                            <div 
                                                key={type}
                                                className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-white/5 transition-colors"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className={`p-1 rounded ${config.bg}`}>
                                                        <Icon className={`w-3.5 h-3.5 ${config.color}`} />
                                                    </div>
                                                    <span className="text-sm text-zinc-300 capitalize">{type}</span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-xs text-zinc-400">
                                                        {data.count} · {formatFileSize(data.size)}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
});

StorageStatsWidget.displayName = 'StorageStatsWidget';
