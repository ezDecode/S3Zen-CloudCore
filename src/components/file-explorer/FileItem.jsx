/**
 * FileItem Component
 * Complete UI Redesign - Modern Card & Row Design
 */

import { motion, AnimatePresence } from 'framer-motion';
import { MoreVerticalIcon, Download01Icon, Share01Icon, Delete02Icon, Edit02Icon, ViewIcon, Tick02Icon, InformationCircleIcon } from 'hugeicons-react';
import { useState } from 'react';
import { FileIcon } from './FileIcon';
import { formatFileSize, formatDate, formatExactDateTime } from '../../utils/formatters';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export const FileItem = ({
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
    const isFolder = item.type === 'folder';

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
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
                className={`group relative rounded-xl border transition-all duration-200 cursor-pointer ${isSelected
                    ? 'bg-blue-500/10 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                    }`}
                onClick={() => isFolder ? onOpen(item) : onSelect(item)}
                onDoubleClick={() => !isFolder && onPreview && onPreview(item)}
            >
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

                {/* Context Menu Button */}
                <div className="absolute top-2 right-2 z-20" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                className={`p-1.5 rounded-lg transition-all duration-200 ${isHovered
                                    ? 'opacity-100'
                                    : 'opacity-0 data-[state=open]:opacity-100'} 
                                    bg-black/40 text-white hover:bg-black/60 backdrop-blur-sm border border-white/10 data-[state=open]:bg-white data-[state=open]:text-black`}
                            >
                                <MoreVerticalIcon className="w-4 h-4" />
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
                            scale: isHovered ? 1.1 : 1,
                            rotate: isHovered && isFolder ? 5 : 0
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
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className={`group relative grid grid-cols-12 gap-4 items-center px-4 py-3.5 rounded-lg border transition-all duration-200 cursor-pointer ${isSelected
                ? 'bg-blue-500/10 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                : 'bg-white/[0.02] border-white/[0.08] hover:border-white/20 hover:shadow-md'
                }`}
            onClick={() => isFolder ? onOpen(item) : onSelect(item)}
            onDoubleClick={() => !isFolder && onPreview && onPreview(item)}
        >
            {/* Name Column */}
            <div className="col-span-8 sm:col-span-6 flex items-center gap-3 min-w-0">
                {/* Icon */}
                <motion.div
                    whileHover={{ scale: 1.1, rotate: isFolder ? 5 : 0 }}
                    className="flex-shrink-0"
                >
                    <FileIcon filename={item.name} isFolder={isFolder} className="w-5 h-5" />
                </motion.div>

                {/* Name */}
                <span className="truncate font-semibold text-sm text-white">
                    {item.name}
                </span>
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
            <div className="col-span-4 sm:col-span-1 flex justify-end relative" onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 rounded-lg bg-white/10 border border-white/20 text-zinc-300 hover:text-white hover:bg-white/15 hover:border-white/30 transition-all shadow-sm data-[state=open]:bg-white data-[state=open]:text-black"
                        >
                            <MoreVerticalIcon className="w-4 h-4" />
                        </motion.button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-zinc-900/95 backdrop-blur-xl border-white/10">
                        <MenuContent />
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </motion.div>
    );
};
