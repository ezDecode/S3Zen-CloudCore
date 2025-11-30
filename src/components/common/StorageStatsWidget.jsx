/**
 * StorageStatsWidget Component
 * Displays bucket storage usage and file statistics
 */

import { memo } from 'react';
import { motion } from 'framer-motion';
import { 
    HardDriveIcon, 
    File01Icon, 
    Folder01Icon, 
    RefreshIcon,
    AlertCircleIcon
} from 'hugeicons-react';
import { formatFileSize } from '../../utils/formatters';

export const StorageStatsWidget = memo(({ 
    totalSize = 0, 
    fileCount = 0, 
    folderCount = 0,
    isLoading = false,
    error = null,
    onRefresh
}) => {
    // Calculate visual progress (for demo, we'll use a max of 5GB)
    const maxStorage = 5 * 1024 * 1024 * 1024; // 5GB
    const usagePercentage = Math.min((totalSize / maxStorage) * 100, 100);
    
    // Determine color based on usage
    const getProgressColor = () => {
        if (usagePercentage > 90) return 'from-red-500 to-red-600';
        if (usagePercentage > 70) return 'from-yellow-500 to-orange-500';
        return 'from-blue-500 to-purple-500';
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <HardDriveIcon className="w-5 h-5 text-blue-400" />
                    <h3 className="text-sm font-bold text-white">Storage</h3>
                </div>
                <button
                    onClick={onRefresh}
                    disabled={isLoading}
                    className="p-1.5 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
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
                    {/* Progress Bar */}
                    <div className="mb-4">
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${usagePercentage}%` }}
                                transition={{ duration: 0.5, ease: 'easeOut' }}
                                className={`h-full bg-gradient-to-r ${getProgressColor()} rounded-full`}
                            />
                        </div>
                        <div className="flex justify-between mt-2">
                            <span className="text-xs text-zinc-400">
                                {formatFileSize(totalSize)} used
                            </span>
                            <span className="text-xs text-zinc-500">
                                {usagePercentage.toFixed(1)}%
                            </span>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/5 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                                <File01Icon className="w-4 h-4 text-green-400" />
                                <span className="text-xs text-zinc-400">Files</span>
                            </div>
                            <p className="text-lg font-bold text-white tabular-nums">
                                {isLoading ? '...' : fileCount.toLocaleString()}
                            </p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                                <Folder01Icon className="w-4 h-4 text-yellow-400" />
                                <span className="text-xs text-zinc-400">Folders</span>
                            </div>
                            <p className="text-lg font-bold text-white tabular-nums">
                                {isLoading ? '...' : folderCount.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
});

StorageStatsWidget.displayName = 'StorageStatsWidget';
