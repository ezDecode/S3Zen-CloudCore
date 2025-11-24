/**
 * FileItem Component
 * Complete UI Redesign - Modern Card & Row Design
 */

import { motion, AnimatePresence } from 'framer-motion';
import { MoreVerticalIcon, Download01Icon, Share01Icon, Delete02Icon, Edit02Icon, ViewIcon, Tick02Icon } from 'hugeicons-react';
import { useState, useRef, useEffect } from 'react';
import { FileIcon } from './FileIcon';
import { formatFileSize, formatDate, formatExactDateTime } from '../../utils/formatters';

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
    const [menuPosition, setMenuPosition] = useState('bottom'); // 'bottom' or 'top'
    const menuRef = useRef(null);
    const buttonRef = useRef(null);
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

        // Calculate dropdown position
        if (buttonRef.current && !showMenu) {
            const rect = buttonRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;
            const menuHeight = 300; // Approximate max height

            // Show upward if not enough space below and more space above
            setMenuPosition(spaceBelow < menuHeight && spaceAbove > spaceBelow ? 'top' : 'bottom');
        }

        setShowMenu(!showMenu);
    };

    const handleAction = (action) => {
        setShowMenu(false);
        action();
    };

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
                    } ${showMenu ? 'z-50' : 'z-0'}`}
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
                <motion.div
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: isHovered || showMenu ? 1 : 0.5 }}
                    className="absolute top-2 right-2 z-10"
                    ref={menuRef}
                >
                    <button
                        ref={buttonRef}
                        onClick={handleMenuClick}
                        className="p-1.5 rounded-lg bg-black/50 backdrop-blur-sm border border-white/10 text-white hover:bg-black/70 transition-all"
                    >
                        <MoreVerticalIcon className="w-3.5 h-3.5" />
                    </button>

                    <AnimatePresence>
                        {showMenu && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: menuPosition === 'top' ? 5 : -5 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: menuPosition === 'top' ? 5 : -5 }}
                                className={`absolute right-0 w-48 bg-zinc-900 border border-white/10 rounded-lg shadow-2xl overflow-hidden z-50 ${menuPosition === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'
                                    }`}
                            >
                                {!isFolder && onPreview && (
                                    <button
                                        onClick={() => handleAction(() => onPreview(item))}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
                                    >
                                        <ViewIcon className="w-4 h-4" />
                                        <span>Preview</span>
                                    </button>
                                )}
                                {!isFolder && onDownload && (
                                    <button
                                        onClick={() => handleAction(() => onDownload(item))}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
                                    >
                                        <Download01Icon className="w-4 h-4" />
                                        <span>Download</span>
                                    </button>
                                )}
                                {!isFolder && onShare && (
                                    <button
                                        onClick={() => handleAction(() => onShare(item))}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
                                    >
                                        <Share01Icon className="w-4 h-4" />
                                        <span>Share</span>
                                    </button>
                                )}
                                {onRename && (
                                    <button
                                        onClick={() => handleAction(() => onRename(item))}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
                                    >
                                        <Edit02Icon className="w-4 h-4" />
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
                                            <Delete02Icon className="w-4 h-4" />
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
            whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className={`group relative grid grid-cols-12 gap-4 items-center px-4 py-3.5 rounded-lg border transition-all duration-200 cursor-pointer ${isSelected
                ? 'bg-blue-500/10 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                : 'bg-white/[0.02] border-white/[0.08] hover:border-white/20 hover:shadow-md'
                } ${showMenu ? 'z-50' : 'z-0'}`}
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
            <div className="col-span-4 sm:col-span-1 flex justify-end relative" ref={menuRef}>
                <motion.button
                    ref={buttonRef}
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleMenuClick}
                    className="p-2 rounded-lg bg-white/10 border border-white/20 text-zinc-300 hover:text-white hover:bg-white/15 hover:border-white/30 transition-all shadow-sm"
                >
                    <MoreVerticalIcon className="w-4 h-4" />
                </motion.button>

                <AnimatePresence>
                    {showMenu && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: menuPosition === 'top' ? 5 : -5 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: menuPosition === 'top' ? 5 : -5 }}
                            className={`absolute right-0 w-52 bg-zinc-900/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl overflow-y-auto max-h-80 custom-scrollbar z-50 ${menuPosition === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
                                }`}
                        >
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleAction(() => onSelect(item));
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-zinc-200 hover:bg-white/10 hover:text-white transition-all"
                            >
                                <Tick02Icon className={`w-4 h-4 ${isSelected ? 'text-blue-500' : 'text-zinc-400'}`} />
                                <span>{isSelected ? 'Deselect' : 'Select'}</span>
                            </button>
                            <div className="h-px bg-white/10 my-1" />
                            {!isFolder && onPreview && (
                                <button
                                    onClick={() => handleAction(() => onPreview(item))}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-zinc-200 hover:bg-white/10 hover:text-white transition-all"
                                >
                                    <ViewIcon className="w-4 h-4" />
                                    <span>Preview</span>
                                </button>
                            )}
                            {!isFolder && onDownload && (
                                <button
                                    onClick={() => handleAction(() => onDownload(item))}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-zinc-200 hover:bg-white/10 hover:text-white transition-all"
                                >
                                    <Download01Icon className="w-4 h-4" />
                                    <span>Download</span>
                                </button>
                            )}
                            {!isFolder && onShare && (
                                <button
                                    onClick={() => handleAction(() => onShare(item))}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-zinc-200 hover:bg-white/10 hover:text-white transition-all"
                                >
                                    <Share01Icon className="w-4 h-4" />
                                    <span>Share</span>
                                </button>
                            )}
                            {onRename && (
                                <button
                                    onClick={() => handleAction(() => onRename(item))}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-zinc-200 hover:bg-white/10 hover:text-white transition-all"
                                >
                                    <Edit02Icon className="w-4 h-4" />
                                    <span>Rename</span>
                                </button>
                            )}
                            {onDelete && (
                                <>
                                    <div className="h-px bg-white/10 my-1" />
                                    <button
                                        onClick={() => handleAction(() => onDelete(item))}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all"
                                    >
                                        <Delete02Icon className="w-4 h-4" />
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
