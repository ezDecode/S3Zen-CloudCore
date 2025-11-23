/**
 * FileItem Component
 * Individual file/folder item in the list
 */

import { motion } from 'framer-motion';
import { MoreVertical, Download, Share2, Trash2, Edit, Eye } from 'lucide-react';
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
    onPreview
}) => {
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);
    const isFolder = item.type === 'folder';

    // Close menu on outside click
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

    return (
        <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className={`group relative flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${isSelected
                    ? 'bg-purple-500/10 border-purple-500/50'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                }`}
            onClick={() => isFolder ? onOpen(item) : onSelect(item)}
            onDoubleClick={() => !isFolder && onPreview && onPreview(item)}
        >
            {/* Checkbox */}
            <div onClick={(e) => e.stopPropagation()}>
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onSelect(item)}
                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-[var(--electric-blue)] focus:ring-2 focus:ring-[var(--electric-blue)] transition-all"
                />
            </div>

            {/* Icon */}
            <div className="flex-shrink-0">
                <FileIcon filename={item.name} isFolder={isFolder} className="w-6 h-6" />
            </div>

            {/* Name */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{item.name}</p>
                {!isFolder && (
                    <p className="text-xs text-white/50 mt-0.5">
                        {formatFileSize(item.size)} • {formatDate(item.lastModified)}
                    </p>
                )}
            </div>

            {/* Actions Menu */}
            <div className="relative" ref={menuRef}>
                <button
                    onClick={handleMenuClick}
                    className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                >
                    <MoreVertical className="w-4 h-4" />
                </button>

                {/* Dropdown Menu */}
                {showMenu && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute right-0 top-full mt-1 w-44 bg-[#1a1a2e] border border-white/20 rounded-lg shadow-xl overflow-hidden z-50"
                    >
                        {!isFolder && onPreview && (
                            <button
                                onClick={() => handleAction(() => onPreview(item))}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/10 transition-colors"
                            >
                                <Eye className="w-4 h-4" />
                                <span>Preview</span>
                            </button>
                        )}
                        {!isFolder && onDownload && (
                            <button
                                onClick={() => handleAction(() => onDownload(item))}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/10 transition-colors"
                            >
                                <Download className="w-4 h-4" />
                                <span>Download</span>
                            </button>
                        )}
                        {!isFolder && onShare && (
                            <button
                                onClick={() => handleAction(() => onShare(item))}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/10 transition-colors"
                            >
                                <Share2 className="w-4 h-4" />
                                <span>Share</span>
                            </button>
                        )}
                        {onRename && (
                            <button
                                onClick={() => handleAction(() => onRename(item))}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/10 transition-colors"
                            >
                                <Edit className="w-4 h-4" />
                                <span>Rename</span>
                            </button>
                        )}
                        {onDelete && (
                            <button
                                onClick={() => handleAction(() => onDelete(item))}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors border-t border-white/10"
                            >
                                <Trash2 className="w-4 h-4" />
                                <span>Delete</span>
                            </button>
                        )}
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};
