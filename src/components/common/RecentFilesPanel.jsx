/**
 * RecentFilesPanel Component
 * Shows recently accessed files for quick access
 */

import { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Clock01Icon, 
    ArrowDown01Icon, 
    Cancel01Icon,
    Delete02Icon 
} from 'hugeicons-react';
import { FileIcon } from '../file-explorer/FileIcon';
import { formatFileSize, formatRelativeTime } from '../../utils/formatters';

export const RecentFilesPanel = memo(({ 
    recentFiles = [], 
    onOpenFile, 
    onRemoveRecent,
    onClearAll
}) => {
    const [isExpanded, setIsExpanded] = useState(true);

    if (recentFiles.length === 0) return null;

    return (
        <div className="border-b border-white/5">
            {/* Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <Clock01Icon className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-semibold text-white">Recent</span>
                    <span className="text-xs text-zinc-500 bg-white/5 px-2 py-0.5 rounded-full">
                        {recentFiles.length}
                    </span>
                </div>
                <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <ArrowDown01Icon className="w-4 h-4 text-zinc-400" />
                </motion.div>
            </button>

            {/* Content */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="px-2 pb-3 space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
                            {recentFiles.map((item) => (
                                <motion.div
                                    key={item.key}
                                    whileHover={{ x: 2 }}
                                    className="group flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
                                    onClick={() => onOpenFile?.(item)}
                                >
                                    <FileIcon 
                                        filename={item.name} 
                                        isFolder={false} 
                                        className="w-4 h-4 shrink-0" 
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-white truncate">
                                            {item.name}
                                        </p>
                                        <p className="text-xs text-zinc-500">
                                            {formatRelativeTime(item.accessedAt)}
                                        </p>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onRemoveRecent?.(item.key);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-all"
                                    >
                                        <Cancel01Icon className="w-3 h-3 text-red-400" />
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                        
                        {/* Clear All Button */}
                        {recentFiles.length > 1 && (
                            <div className="px-4 pb-3">
                                <button
                                    onClick={onClearAll}
                                    className="text-xs text-zinc-500 hover:text-red-400 transition-colors flex items-center gap-1"
                                >
                                    <Delete02Icon className="w-3 h-3" />
                                    Clear history
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
});

RecentFilesPanel.displayName = 'RecentFilesPanel';
