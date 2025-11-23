/**
 * FileList Component
 * Grid/List view of files and folders
 */

import { motion, AnimatePresence } from 'framer-motion';
import { FileItem } from './FileItem';
import { FolderOpen } from 'lucide-react';

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
    isLoading
}) => {
    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-10 h-10 border-3 border-purple-500 border-t-transparent rounded-full"
                />
            </div>
        );
    }

    if (!items || items.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-white/50">
                <FolderOpen className="w-14 h-14 mb-3 opacity-50" />
                <p className="text-base font-medium">This folder is empty</p>
                <p className="text-sm mt-1">Upload files or create a folder to get started</p>
            </div>
        );
    }

    // Separate folders and files
    const folders = items.filter(item => item.type === 'folder');
    const files = items.filter(item => item.type === 'file');
    const sortedItems = [...folders, ...files];

    return (
        <div className="flex-1 overflow-auto p-4">
            <div className="space-y-1.5 max-w-6xl mx-auto">
                <AnimatePresence mode="popLayout">
                    {sortedItems.map((item) => (
                        <FileItem
                            key={item.key}
                            item={item}
                            isSelected={selectedItems.some(selected => selected.key === item.key)}
                            onSelect={onSelectItem}
                            onOpen={onOpenFolder}
                            onDownload={onDownload}
                            onShare={onShare}
                            onRename={onRename}
                            onDelete={onDelete}
                            onPreview={onPreview}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};
