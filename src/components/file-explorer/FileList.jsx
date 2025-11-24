/**
 * FileList Component
 * Complete UI Redesign - Modern Grid & List Views
 */

import { motion, AnimatePresence } from 'framer-motion';
import { FileItem } from './FileItem';
import { FolderOpenIcon, SparklesIcon } from 'hugeicons-react';
import { FileListSkeleton } from '../common/SkeletonLoader';

export const FileList = ({
    items,
    selectedItems,
    onSelectItem,
    onOpenFolder,
    onDownload,
    onShare,
    onRename,
    onDelete,
    onPreview,
    isLoading,
    viewMode = 'grid'
}) => {
    if (isLoading) {
        return <FileListSkeleton viewMode={viewMode} count={16} />;
    }

    if (!items || items.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center p-8"
            >
                {/* Icon with Glow Effect */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="relative mb-8"
                >
                    {/* Animated Glow Background */}
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.5, 0.3]
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute inset-0 -m-12 bg-gradient-to-br from-blue-500/30 via-purple-500/30 to-pink-500/30 blur-3xl"
                    />

                    {/* Icon */}
                    <div className="relative bg-gradient-to-br from-zinc-800 to-zinc-900 p-8 rounded-2xl border border-white/10">
                        <FolderOpenIcon className="w-20 h-20 text-zinc-600" strokeWidth={1.5} />
                    </div>
                </motion.div>

                {/* Text Content */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-center space-y-3"
                >
                    <h3 className="text-2xl font-bold text-white">This folder is empty</h3>
                    <p className="text-sm text-zinc-400 max-w-md leading-relaxed">
                        Upload files or create a new folder to get started with your cloud storage
                    </p>
                </motion.div>

                {/* Drag and Drop Hint */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-8 flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg"
                >
                    <SparklesIcon className="w-4 h-4 text-zinc-500" />
                    <span className="text-sm text-zinc-500 font-medium">Drag and drop files here to upload</span>
                </motion.div>
            </motion.div>
        );
    }

    // Sort: Folders first, then files
    const folders = items.filter(item => item.type === 'folder').sort((a, b) => a.name.localeCompare(b.name));
    const files = items.filter(item => item.type === 'file').sort((a, b) => a.name.localeCompare(b.name));
    const sortedItems = [...folders, ...files];

    return (
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 sm:px-6 py-3 sm:py-6 custom-scrollbar">
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-2 sm:gap-3">
                    <AnimatePresence mode="popLayout">
                        {sortedItems.map((item, index) => (
                            <motion.div
                                key={item.key}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: index * 0.01, duration: 0.2 }}
                            >
                                <FileItem
                                    item={item}
                                    isSelected={selectedItems.some(selected => selected.key === item.key)}
                                    onSelect={onSelectItem}
                                    onOpen={onOpenFolder}
                                    onDownload={onDownload}
                                    onShare={onShare}
                                    onRename={onRename}
                                    onDelete={onDelete}
                                    onPreview={onPreview}
                                    viewMode={viewMode}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            ) : (
                <div className="space-y-1">
                    {/* List Header */}
                    <div className="grid grid-cols-12 gap-4 px-4 py-3 text-xs font-bold uppercase tracking-wider text-zinc-400 bg-white/5 border border-white/10 rounded-lg mb-3 sticky top-0 backdrop-blur-sm z-10">
                        <div className="col-span-8 sm:col-span-6">Name</div>
                        <div className="col-span-2 hidden sm:block">Size</div>
                        <div className="col-span-3 hidden sm:block">Modified</div>
                        <div className="col-span-4 sm:col-span-1 text-right">Actions</div>
                    </div>

                    {/* List Items */}
                    <AnimatePresence mode="popLayout">
                        {sortedItems.map((item, index) => (
                            <motion.div
                                key={item.key}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ delay: index * 0.01, duration: 0.15 }}
                            >
                                <FileItem
                                    item={item}
                                    isSelected={selectedItems.some(selected => selected.key === item.key)}
                                    onSelect={onSelectItem}
                                    onOpen={onOpenFolder}
                                    onDownload={onDownload}
                                    onShare={onShare}
                                    onRename={onRename}
                                    onDelete={onDelete}
                                    onPreview={onPreview}
                                    viewMode={viewMode}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};
