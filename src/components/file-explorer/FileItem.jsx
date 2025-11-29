/**
 * FileItem Component
 * Complete UI Redesign - Modern Card & Row Design
 * OPTIMIZED: Memoized to prevent unnecessary re-renders
 */

import { motion, AnimatePresence } from 'framer-motion';
import { MoreVerticalIcon, Download01Icon, Share01Icon, Delete02Icon, Edit02Icon, ViewIcon, Tick02Icon, InformationCircleIcon } from 'hugeicons-react';
import { useState, memo, useCallback } from 'react';
import { FileIcon } from './FileIcon';
import { formatFileSize, formatDate, formatExactDateTime } from '../../utils/formatters';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";

// OPTIMIZED: Memoize FileItem to prevent re-renders when props don't change
export const FileItem = memo(({
    item,
    isSelected,
    onSelect,
    onOpen,
    onDownload,
    onShare,
    onRename,
    onDelete,
    onPreview,
    onDetails,
    viewMode = 'grid'
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const isFolder = item.type === 'folder';

    // Drag and drop handlers for folders
    const handleDragOver = (e) => {
        if (!isFolder) return;
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        if (!isFolder) return;
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    };

    const handleDrop = (e) => {
        if (!isFolder) return;
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        
        // TODO: Handle file drop into folder
        // This will be implemented when folder upload is added
        console.log('Files dropped into folder:', item.name);
    };

    const MenuContent = () => (
        <>
            <DropdownMenuItem
                onClick={(e) => {
                    e.stopPropagation();
                    onSelect(item);
                }}
                className="cursor-pointer"
            >
                <Tick02Icon className={`w-4 h-4 mr-2 ${isSelected ? 'text-blue-500' : 'text-zinc-400'}`} />
                <span>{isSelected ? 'Deselect' : 'Select'}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10" />
            {!isFolder && onPreview && (
                <DropdownMenuItem onClick={() => onPreview(item)} className="cursor-pointer">
                    <ViewIcon className="w-4 h-4 mr-2 text-zinc-500" />
                    Preview
                </DropdownMenuItem>
            )}
            {!isFolder && onDownload && (
                <DropdownMenuItem onClick={() => onDownload(item)} className="cursor-pointer">
                    <Download01Icon className="w-4 h-4 mr-2 text-zinc-500" />
                    Download
                </DropdownMenuItem>
            )}
            {!isFolder && onShare && (
                <DropdownMenuItem onClick={() => onShare(item)} className="cursor-pointer">
                    <Share01Icon className="w-4 h-4 mr-2 text-zinc-500" />
                    Share
                </DropdownMenuItem>
            )}
            {onDetails && (
                <DropdownMenuItem onClick={() => onDetails(item)} className="cursor-pointer sm:hidden">
                    <InformationCircleIcon className="w-4 h-4 mr-2 text-zinc-500" />
                    Details
                </DropdownMenuItem>
            )}
            {onRename && (
                <DropdownMenuItem onClick={() => onRename(item)} className="cursor-pointer">
                    <Edit02Icon className="w-4 h-4 mr-2 text-zinc-500" />
                    Rename
                </DropdownMenuItem>
            )}
            {onDelete && (
                <>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem
                        onClick={() => onDelete(item)}
                        className="cursor-pointer text-red-400 focus:text-red-400 focus:bg-red-500/10"
                    >
                        <Delete02Icon className="w-4 h-4 mr-2" />
                        Delete
                    </DropdownMenuItem>
                </>
            )}
        </>
    );

    if (viewMode === 'grid') {
        return (
            <motion.div
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                animate={{
                    scale: isDragOver ? 1.05 : 1,
                    borderColor: isDragOver ? 'rgba(59, 130, 246, 0.8)' : undefined
                }}
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`group relative rounded-xl border transition-all duration-200 cursor-pointer ${
                    isDragOver
                        ? 'bg-blue-500/20 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                        : isSelected
                            ? 'bg-blue-500/10 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                            : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                }`}
                onClick={() => isFolder ? onOpen(item) : onSelect(item)}
                onDoubleClick={() => !isFolder && onPreview && onPreview(item)}
            >
                {/* Drag Over Indicator */}
                <AnimatePresence>
                    {isDragOver && isFolder && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-blue-500/10 backdrop-blur-sm rounded-xl border-2 border-blue-500 border-dashed flex items-center justify-center z-30 pointer-events-none"
                        >
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className="text-blue-400 text-xs font-semibold"
                            >
                                Drop here
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Selection Indicator */}
                <AnimatePresence>
                    {isSelected && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="absolute top-2 left-2 z-10 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center"
                        >
                            <Tick02Icon className="w-3 h-3 text-white" strokeWidth={3} />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Quick Action Buttons - Show on hover for files */}
                <AnimatePresence>
                    {!isFolder && isHovered && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-2 left-2 right-2 z-20 flex items-center justify-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {onPreview && (
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => onPreview(item)}
                                    className="p-2 rounded-lg bg-blue-500/90 hover:bg-blue-600 text-white backdrop-blur-sm transition-colors shadow-lg"
                                    title="Preview"
                                >
                                    <ViewIcon className="w-4 h-4" />
                                </motion.button>
                            )}
                            {onDownload && (
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => onDownload(item)}
                                    className="p-2 rounded-lg bg-green-500/90 hover:bg-green-600 text-white backdrop-blur-sm transition-colors shadow-lg"
                                    title="Download"
                                >
                                    <Download01Icon className="w-4 h-4" />
                                </motion.button>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Context Menu Button */}
                <div className="absolute top-2 right-2 z-20" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                className={`p-1 rounded-lg outline-none border-none ring-0 focus:outline-none focus:ring-0 ${isHovered
                                    ? 'opacity-100'
                                    : 'opacity-0 data-[state=open]:opacity-100'} 
                                    bg-transparent text-white data-[state=open]:bg-transparent data-[state=open]:text-white`}
                            >
                                <MoreVerticalIcon className="w-8 h-8" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 bg-zinc-900/95 backdrop-blur-xl border-white/10">
                            <MenuContent />
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Card Content */}
                <div className="p-4 flex flex-col items-center text-center gap-3">
                    <motion.div
                        animate={{
                            scale: isDragOver ? 1.2 : isHovered ? 1.1 : 1,
                            rotate: isDragOver ? 10 : isHovered && isFolder ? 5 : 0,
                            y: isDragOver ? -5 : 0
                        }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        className="w-16 h-16 flex items-center justify-center"
                    >
                        <FileIcon filename={item.name} isFolder={isFolder} className="w-14 h-14" />
                    </motion.div>

                    <div className="w-full min-h-10">
                        <p className="text-sm font-semibold text-white truncate leading-tight mb-1">
                            {item.name}
                        </p>
                        <p className="text-xs text-zinc-500 font-medium">
                            {isFolder ? 'Folder' : formatFileSize(item.size)}
                        </p>
                    </div>
                </div>
            </motion.div>
        );
    }

    // List View
    return (
        <motion.div
            whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
            animate={{
                scale: isDragOver ? 1.02 : 1,
                x: isDragOver ? 4 : 0
            }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`group relative grid grid-cols-12 gap-4 items-center px-4 py-3.5 rounded-lg border transition-all duration-200 cursor-pointer ${
                isDragOver
                    ? 'bg-blue-500/20 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                    : isSelected
                        ? 'bg-blue-500/10 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                        : 'bg-white/[0.02] border-white/[0.08] hover:border-white/20 hover:shadow-md'
            }`}
            onClick={() => isFolder ? onOpen(item) : onSelect(item)}
            onDoubleClick={() => !isFolder && onPreview && onPreview(item)}
        >
            {/* Drag Over Indicator for List View */}
            <AnimatePresence>
                {isDragOver && isFolder && (
                    <motion.div
                        initial={{ opacity: 0, scaleX: 0 }}
                        animate={{ opacity: 1, scaleX: 1 }}
                        exit={{ opacity: 0, scaleX: 0 }}
                        className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-full"
                    />
                )}
            </AnimatePresence>

            {/* Name Column */}
            <div className="col-span-8 sm:col-span-6 flex items-center gap-3 min-w-0">
                {/* Icon */}
                <motion.div
                    animate={{
                        scale: isDragOver ? 1.3 : 1,
                        rotate: isDragOver ? 10 : isFolder ? 5 : 0,
                        x: isDragOver ? 5 : 0
                    }}
                    whileHover={{ scale: 1.1, rotate: isFolder ? 5 : 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="flex-shrink-0"
                >
                    <FileIcon filename={item.name} isFolder={isFolder} className="w-5 h-5" />
                </motion.div>

                {/* Name */}
                <span className={`truncate font-semibold text-sm transition-colors ${
                    isDragOver ? 'text-blue-400' : 'text-white'
                }`}>
                    {item.name}
                </span>
                
                {/* Drop indicator text */}
                <AnimatePresence>
                    {isDragOver && isFolder && (
                        <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="text-xs text-blue-400 font-semibold ml-2"
                        >
                            Drop here
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>

            {/* Size Column */}
            <div className="col-span-2 hidden sm:block text-sm font-medium text-zinc-400 tabular-nums">
                {isFolder ? '—' : formatFileSize(item.size)}
            </div>

            {/* Date Column */}
            <div className="col-span-3 hidden sm:block text-sm font-medium text-zinc-400">
                {isFolder ? '—' : formatExactDateTime(item.lastModified)}
            </div>

            {/* Actions Column */}
            <div className="col-span-4 sm:col-span-1 flex justify-end items-center gap-1 relative" onClick={(e) => e.stopPropagation()}>
                {/* Quick Action Buttons for List View */}
                <AnimatePresence>
                    {!isFolder && isHovered && (
                        <>
                            {onPreview && (
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => onPreview(item)}
                                    className="p-1.5 rounded-lg bg-blue-500/90 hover:bg-blue-600 text-white transition-colors shadow-lg"
                                    title="Preview"
                                >
                                    <ViewIcon className="w-4 h-4" />
                                </motion.button>
                            )}
                            {onDownload && (
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => onDownload(item)}
                                    className="p-1.5 rounded-lg bg-green-500/90 hover:bg-green-600 text-white transition-colors shadow-lg"
                                    title="Download"
                                >
                                    <Download01Icon className="w-4 h-4" />
                                </motion.button>
                            )}
                        </>
                    )}
                </AnimatePresence>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            className="p-1 rounded-lg outline-none border-none ring-0 focus:outline-none focus:ring-0 bg-transparent text-white data-[state=open]:bg-transparent data-[state=open]:text-white"
                        >
                            <MoreVerticalIcon className="w-8 h-8" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-zinc-900/95 backdrop-blur-xl border-white/10">
                        <MenuContent />
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </motion.div>
    );
}, (prevProps, nextProps) => {
    // Custom comparison for better performance
    return (
        prevProps.item.key === nextProps.item.key &&
        prevProps.isSelected === nextProps.isSelected &&
        prevProps.viewMode === nextProps.viewMode &&
        prevProps.item.lastModified === nextProps.item.lastModified
    );
});
