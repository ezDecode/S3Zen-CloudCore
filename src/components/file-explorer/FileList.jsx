/**
 * FileList Component
 * Complete UI Redesign - Modern Grid & List Views
 * 
 * Features:
 * - Favorites integration
 * - Quick Share
 */

import { motion, AnimatePresence } from 'framer-motion';
import { FileItem } from './FileItem';
import { FolderOpenIcon, SparklesIcon } from 'hugeicons-react';
import { FileListSkeleton } from '../common/SkeletonLoader';
import { VirtualFileList } from './VirtualFileList';

import { memo, useMemo, useRef, useEffect, useState } from 'react';

// OPTIMIZED: Memoize FileList to prevent unnecessary re-renders
export const FileList = memo(({
    items,
    selectedItems,
    onSelectItem,
    onOpenFolder,
    onDownload,
    onShare,
    onRename,
    onDelete,
    onPreview,
    onDetails,
    isLoading,
    viewMode = 'grid',
    sortBy,
    sortOrder,
    onSort,
    // Feature props
    favorites = [],
    onToggleFavorite
}) => {
    const containerRef = useRef(null);
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

    // PERFORMANCE: Use virtual scrolling for large lists (>100 items)
    const useVirtualScrolling = items.length > 100;

    // Measure container size for virtual scrolling
    useEffect(() => {
        if (!useVirtualScrolling || !containerRef.current) return;

        const updateSize = () => {
            if (containerRef.current) {
                setContainerSize({
                    width: containerRef.current.offsetWidth,
                    height: containerRef.current.offsetHeight
                });
            }
        };

        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, [useVirtualScrolling]);

    // OPTIMIZED: Create a Set for O(1) lookup instead of array.some() for each item
    const selectedKeys = useMemo(() => 
        new Set(selectedItems.map(item => item.key)), 
        [selectedItems]
    );

    // Create a Set for favorites for O(1) lookup
    const favoriteKeys = useMemo(() => 
        new Set(favorites.map(item => item.key)), 
        [favorites]
    );

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
                    <h3 className="text-2xl font-normal text-white">This folder is empty</h3>
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
                    <span className="text-sm text-zinc-500 font-normal">Drag and drop files here to upload</span>
                </motion.div>
            </motion.div>
        );
    }

    // PERFORMANCE: Use virtual scrolling for large lists
    if (useVirtualScrolling) {
        return (
            <div ref={containerRef} className="flex-1 overflow-hidden">
                {containerSize.height > 0 && (
                    <VirtualFileList
                        items={items}
                        selectedItems={selectedItems}
                        onSelectItem={onSelectItem}
                        onOpenFolder={onOpenFolder}
                        onDownload={onDownload}
                        onShare={onShare}
                        onRename={onRename}
                        onDelete={onDelete}
                        onPreview={onPreview}
                        onDetails={onDetails}
                        viewMode={viewMode}
                        favorites={favorites}
                        onToggleFavorite={onToggleFavorite}
                        containerHeight={containerSize.height}
                        containerWidth={containerSize.width}
                    />
                )}
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 sm:px-6 py-3 sm:py-6 custom-scrollbar">
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-2 sm:gap-3">
                    <AnimatePresence mode="popLayout">
                        {items.map((item, index) => (
                            <motion.div
                                key={item.key}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ 
                                    delay: Math.min(index * 0.01, 0.3), // Cap delay at 300ms
                                    duration: 0.15 
                                }}
                            >
                                <FileItem
                                    item={item}
                                    isSelected={selectedKeys.has(item.key)}
                                    isFavorite={favoriteKeys.has(item.key)}
                                    onSelect={onSelectItem}
                                    onOpen={onOpenFolder}
                                    onDownload={onDownload}
                                    onShare={onShare}
                                    onRename={onRename}
                                    onDelete={onDelete}
                                    onPreview={onPreview}
                                    onDetails={onDetails}
                                    onToggleFavorite={onToggleFavorite}
                                    viewMode={viewMode}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            ) : (
                <div className="space-y-1">
                    {/* List Header */}
                    <div className="grid grid-cols-12 gap-4 px-4 py-3 text-xs font-normal uppercase tracking-wider text-zinc-400 bg-white/5 border border-white/10 rounded-lg mb-3 sticky top-0 backdrop-blur-sm z-10">
                        <div
                            className="col-span-8 sm:col-span-6 cursor-pointer hover:text-white flex flex-row items-center gap-2 transition-colors group select-none"
                            onClick={() => onSort && onSort('name')}
                        >
                            <span>Name</span>
                        </div>
                        <div
                            className="col-span-2 hidden sm:block cursor-pointer hover:text-white flex flex-row items-center gap-2 transition-colors group select-none"
                            onClick={() => onSort && onSort('size')}
                        >
                            <span>Size</span>
                        </div>
                        <div
                            className="col-span-3 hidden sm:block cursor-pointer hover:text-white flex flex-row items-center gap-2 transition-colors group select-none"
                            onClick={() => onSort && onSort('date')}
                        >
                            <span>Modified</span>
                        </div>
                        <div className="col-span-4 sm:col-span-1 text-right">Actions</div>
                    </div>

                    {/* List Items */}
                    <AnimatePresence mode="popLayout">
                        {items.map((item, index) => (
                            <motion.div
                                key={item.key}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ 
                                    delay: Math.min(index * 0.01, 0.3), // Cap delay at 300ms
                                    duration: 0.15 
                                }}
                            >
                                <FileItem
                                    item={item}
                                    isSelected={selectedKeys.has(item.key)}
                                    isFavorite={favoriteKeys.has(item.key)}
                                    onSelect={onSelectItem}
                                    onOpen={onOpenFolder}
                                    onDownload={onDownload}
                                    onShare={onShare}
                                    onRename={onRename}
                                    onDelete={onDelete}
                                    onPreview={onPreview}
                                    onDetails={onDetails}
                                    onToggleFavorite={onToggleFavorite}
                                    viewMode={viewMode}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
});
