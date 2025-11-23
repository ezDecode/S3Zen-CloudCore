/**
 * FileItem Component
 * Complete UI Redesign - Modern Card & Row Design
 */

import { motion, AnimatePresence } from 'framer-motion';
import { MoreVertical, Download, Share2, Trash2, Edit, Eye, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { FileIcon } from './FileIcon';
import { formatFileSize, formatDate } from '../../utils/formatters';

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
    viewMode = 'grid'
}) => {
    const [showMenu, setShowMenu] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const menuRef = useRef(null);
    const isFolder = item.type === 'folder';

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };
        if (showMenu) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [showMenu]);

    const handleMenuClick = (e) => {
        e.stopPropagation();
        setShowMenu(!showMenu);
    };

    const handleAction = (action) => {
        setShowMenu(false);
        action();
    };

    if (viewMode === 'grid') {
        return (
            <motion.div
                layout
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
                className={`group relative rounded-xl border transition-all duration-200 cursor-pointer overflow-hidden ${
                    isSelected 
                        ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-blue-500/50 shadow-lg shadow-blue-500/20' 
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
                            <Check className="w-3 h-3 text-white" strokeWidth={3} />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Context Menu Button */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isHovered || showMenu ? 1 : 0 }}
                    className="absolute top-2 right-2 z-10"
                    ref={menuRef}
                >
                    <button
                        onClick={handleMenuClick}
                        className="p-1.5 rounded-lg bg-black/50 backdrop-blur-sm border border-white/10 text-white hover:bg-black/70 transition-all"
                    >
                        <MoreVertical className="w-3.5 h-3.5" />
                    </button>

                    <AnimatePresence>
                        {showMenu && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -5 }}
                                className="absolute right-0 top-full mt-1 w-48 bg-zinc-900 border border-white/10 rounded-lg shadow-2xl overflow-hidden z-50"
                            >
                                {!isFolder && onPreview && (
                                    <button
                                        onClick={() => handleAction(() => onPreview(item))}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
                                    >
                                        <Eye className="w-4 h-4" />
                                        <span>Preview</span>
                                    </button>
                                )}
                                {!isFolder && onDownload && (
                                    <button
                                        onClick={() => handleAction(() => onDownload(item))}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
                                    >
                                        <Download className="w-4 h-4" />
                                        <span>Download</span>
                                    </button>
                                )}
                                {!isFolder && onShare && (
                                    <button
                                        onClick={() => handleAction(() => onShare(item))}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
                                    >
                                        <Share2 className="w-4 h-4" />
                                        <span>Share</span>
                                    </button>
                                )}
                                {onRename && (
                                    <button
                                        onClick={() => handleAction(() => onRename(item))}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
                                    >
                                        <Edit className="w-4 h-4" />
                                        <span>Rename</span>
                                    </button>
                                )}
                                {onDelete && (
                                    <>
                                        <div className="h-px bg-white/5 my-1" />
                                        <button
                                            onClick={() => handleAction(() => onDelete(item))}
                                            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            <span>Delete</span>
                                        </button>
                                    </>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

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
            layout
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.995 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className={`group relative grid grid-cols-12 gap-4 items-center px-4 py-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                isSelected 
                    ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30' 
                    : 'bg-transparent border-transparent hover:bg-white/5 hover:border-white/10'
            }`}
            onClick={() => isFolder ? onOpen(item) : onSelect(item)}
            onDoubleClick={() => !isFolder && onPreview && onPreview(item)}
        >
            {/* Name Column */}
            <div className="col-span-6 flex items-center gap-3 min-w-0">
                {/* Selection Checkbox */}
                <div 
                    onClick={(e) => e.stopPropagation()} 
                    className="flex-shrink-0"
                >
                    <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                            isSelected 
                                ? 'bg-blue-500 border-blue-500' 
                                : 'border-zinc-600 hover:border-zinc-400'
                        }`}
                        onClick={() => onSelect(item)}
                    >
                        <AnimatePresence>
                            {isSelected && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                >
                                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>

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
            <div className="col-span-2 text-sm font-medium text-zinc-400 tabular-nums">
                {isFolder ? '—' : formatFileSize(item.size)}
            </div>

            {/* Date Column */}
            <div className="col-span-3 text-sm font-medium text-zinc-400">
                {isFolder ? '—' : formatDate(item.lastModified)}
            </div>

            {/* Actions Column */}
            <div className="col-span-1 flex justify-end relative" ref={menuRef}>
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isHovered || showMenu || isSelected ? 1 : 0 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleMenuClick}
                    className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
                >
                    <MoreVertical className="w-4 h-4" />
                </motion.button>

                <AnimatePresence>
                    {showMenu && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -5 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -5 }}
                            className="absolute right-0 top-full mt-1 w-48 bg-zinc-900 border border-white/10 rounded-lg shadow-2xl overflow-hidden z-50"
                        >
                            {!isFolder && onPreview && (
                                <button
                                    onClick={() => handleAction(() => onPreview(item))}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
                                >
                                    <Eye className="w-4 h-4" />
                                    <span>Preview</span>
                                </button>
                            )}
                            {!isFolder && onDownload && (
                                <button
                                    onClick={() => handleAction(() => onDownload(item))}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
                                >
                                    <Download className="w-4 h-4" />
                                    <span>Download</span>
                                </button>
                            )}
                            {!isFolder && onShare && (
                                <button
                                    onClick={() => handleAction(() => onShare(item))}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
                                >
                                    <Share2 className="w-4 h-4" />
                                    <span>Share</span>
                                </button>
                            )}
                            {onRename && (
                                <button
                                    onClick={() => handleAction(() => onRename(item))}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
                                >
                                    <Edit className="w-4 h-4" />
                                    <span>Rename</span>
                                </button>
                            )}
                            {onDelete && (
                                <>
                                    <div className="h-px bg-white/5 my-1" />
                                    <button
                                        onClick={() => handleAction(() => onDelete(item))}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        <span>Delete</span>
                                    </button>
                                </>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};
