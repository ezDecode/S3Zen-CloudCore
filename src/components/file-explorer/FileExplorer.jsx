/**
 * FileExplorer Component
 * Complete UI Redesign - Modern & Sophisticated
 */

import { useState, useEffect, useCallback } from 'react';
import { Upload, FolderPlus, Trash2, LogOut, Search, RefreshCw, Home, LayoutGrid, List as ListIcon, Download, Share2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../common/Toast';
import { FileList } from './FileList';
import { DownloadManager } from '../common/DownloadManager';
import {
    listObjects,
    uploadFile,
    uploadLargeFile,
    downloadFile,
    deleteObjects,
    renameObject
} from '../../services/aws/s3Service';
import { clearAuth, getBucketConfig } from '../../utils/authUtils';

const LARGE_FILE_THRESHOLD = 5 * 1024 * 1024; // 5MB

export const FileExplorer = ({
    onLogout,
    onShareModal,
    onRenameModal,
    onDeleteModal,
    onPreviewModal,
    onCreateFolderModal
}) => {
    const toast = useToast();
    const [currentPath, setCurrentPath] = useState('');
    const [items, setItems] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [uploadingFiles, setUploadingFiles] = useState([]);
    const [downloads, setDownloads] = useState([]);
    const [viewMode, setViewMode] = useState('grid'); // 'list' or 'grid'

    const bucketConfig = getBucketConfig();

    // Load files
    const loadFiles = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await listObjects(currentPath);
            if (result.success) {
                setItems(result.items);
            } else {
                toast.error(`Failed to load files: ${result.error}`);
            }
        } catch (error) {
            toast.error('Failed to load files');
        } finally {
            setIsLoading(false);
        }
    }, [currentPath]);

    useEffect(() => {
        loadFiles();
    }, [loadFiles]);

    // Navigation
    const handleNavigate = (path) => {
        setCurrentPath(path);
        setSelectedItems([]);
    };

    const handleOpenFolder = (folder) => {
        setCurrentPath(folder.key);
        setSelectedItems([]);
    };

    const handleBreadcrumbClick = (path) => {
        handleNavigate(path);
    };

    // Selection
    const handleSelectItem = (item) => {
        setSelectedItems(prev => {
            const isSelected = prev.some(selected => selected.key === item.key);
            if (isSelected) {
                return prev.filter(selected => selected.key !== item.key);
            } else {
                return [...prev, item];
            }
        });
    };

    // Actions
    const handleFileUpload = async (event) => {
        const files = Array.from(event.target.files || []);
        if (files.length === 0) return;

        const uploadPromises = files.map(async (file) => {
            const key = currentPath ? `${currentPath}${file.name}` : file.name;
            const uploadId = Date.now() + Math.random();

            setUploadingFiles(prev => [...prev, { id: uploadId, name: file.name, progress: 0 }]);

            try {
                const onProgress = (progress) => {
                    setUploadingFiles(prev =>
                        prev.map(f => f.id === uploadId ? { ...f, progress: progress.percentage } : f)
                    );
                };

                let result;
                if (file.size > LARGE_FILE_THRESHOLD) {
                    result = await uploadLargeFile(file, key, onProgress);
                } else {
                    result = await uploadFile(file, key, onProgress);
                }

                if (result.success) {
                    toast.success(`Uploaded ${file.name}`);
                } else {
                    toast.error(`Failed to upload ${file.name}`);
                }
            } catch (error) {
                toast.error(`Error uploading ${file.name}`);
            } finally {
                setUploadingFiles(prev => prev.filter(f => f.id !== uploadId));
            }
        });

        await Promise.all(uploadPromises);
        loadFiles();
    };

    const handleCreateFolder = () => {
        if (onCreateFolderModal) {
            onCreateFolderModal(currentPath, loadFiles);
        }
    };

    const handleDelete = (itemsToDelete) => {
        if (onDeleteModal) {
            onDeleteModal(itemsToDelete, () => {
                // Check if we're deleting a folder that contains the current path
                const deletingCurrentOrParentFolder = itemsToDelete.some(item => {
                    if (item.type === 'folder') {
                        // Check if current path is inside the deleted folder
                        // or if we're deleting the exact current folder
                        return currentPath.startsWith(item.key) || currentPath === item.key;
                    }
                    return false;
                });

                if (deletingCurrentOrParentFolder) {
                    // Navigate to parent folder
                    const pathParts = currentPath.split('/').filter(Boolean);
                    if (pathParts.length > 1) {
                        // Remove last folder from path
                        pathParts.pop();
                        const parentPath = pathParts.join('/') + '/';
                        setCurrentPath(parentPath);
                    } else {
                        // Go to root if we're at top level
                        setCurrentPath('');
                    }
                }

                // Reload files and clear selection
                setSelectedItems([]);
                loadFiles();
            });
        }
    };

    const handleRename = async (item, newName) => {
        try {
            const result = await renameObject(
                item.key,
                newName,
                item.type === 'folder'
            );

            if (result.success) {
                toast.success(`Renamed successfully`);
                loadFiles();
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            toast.error(`Failed to rename: ${error.message}`);
            throw error;
        }
    };

    const handleDownloadSelected = async () => {
        const filesToDownload = selectedItems.filter(item => item.type === 'file');

        if (filesToDownload.length === 0) {
            toast.error('No files selected to download');
            return;
        }

        toast.success(`Starting download of ${filesToDownload.length} file(s)`);

        for (const item of filesToDownload) {
            const downloadId = Date.now() + Math.random();

            // Add to downloads list
            setDownloads(prev => [...prev, {
                id: downloadId,
                name: item.name,
                size: item.size,
                loaded: 0,
                progress: 0,
                status: 'downloading'
            }]);

            try {
                const onProgress = (progress) => {
                    setDownloads(prev =>
                        prev.map(d => d.id === downloadId ? {
                            ...d,
                            loaded: progress.loaded,
                            progress: progress.percentage
                        } : d)
                    );
                };

                const result = await downloadFile(item, onProgress);

                if (result.success) {
                    setDownloads(prev =>
                        prev.map(d => d.id === downloadId ? {
                            ...d,
                            status: 'completed',
                            progress: 100
                        } : d)
                    );
                } else {
                    setDownloads(prev =>
                        prev.map(d => d.id === downloadId ? {
                            ...d,
                            status: 'failed',
                            error: result.error
                        } : d)
                    );
                    toast.error(`Failed to download ${item.name}`);
                }
            } catch (error) {
                setDownloads(prev =>
                    prev.map(d => d.id === downloadId ? {
                        ...d,
                        status: 'failed',
                        error: error.message
                    } : d)
                );
                toast.error(`Error downloading ${item.name}`);
            }
        }
    };

    const handleSingleDownload = async (item) => {
        const downloadId = Date.now() + Math.random();

        setDownloads(prev => [...prev, {
            id: downloadId,
            name: item.name,
            size: item.size,
            loaded: 0,
            progress: 0,
            status: 'downloading'
        }]);

        try {
            const onProgress = (progress) => {
                setDownloads(prev =>
                    prev.map(d => d.id === downloadId ? {
                        ...d,
                        loaded: progress.loaded,
                        progress: progress.percentage
                    } : d)
                );
            };

            const result = await downloadFile(item, onProgress);

            if (result.success) {
                setDownloads(prev =>
                    prev.map(d => d.id === downloadId ? {
                        ...d,
                        status: 'completed',
                        progress: 100
                    } : d)
                );
                toast.success(`Downloaded ${item.name}`);
            } else {
                setDownloads(prev =>
                    prev.map(d => d.id === downloadId ? {
                        ...d,
                        status: 'failed',
                        error: result.error
                    } : d)
                );
                toast.error(`Failed to download ${item.name}`);
            }
        } catch (error) {
            setDownloads(prev =>
                prev.map(d => d.id === downloadId ? {
                    ...d,
                    status: 'failed',
                    error: error.message
                } : d)
            );
            toast.error(`Error downloading ${item.name}`);
        }
    };

    const handleRemoveDownload = (downloadId) => {
        setDownloads(prev => prev.filter(d => d.id !== downloadId));
    };

    const handleClearDownloads = () => {
        setDownloads(prev => prev.filter(d => d.status === 'downloading'));
    };

    const handleShareSelected = () => {
        if (selectedItems.length === 1 && selectedItems[0].type === 'file') {
            onShareModal(selectedItems[0]);
        }
    };

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleLogout = () => {
        clearAuth();
        onLogout();
    };

    // Breadcrumb Parts
    const pathParts = currentPath.split('/').filter(Boolean);

    return (
        <div className="file-explorer-wrapper h-screen flex flex-col bg-black text-white overflow-hidden">
            {/* Top Navigation Bar */}
            <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-gradient-to-b from-zinc-900/50 to-transparent backdrop-blur-sm z-10">
                <div className="flex items-center gap-6">
                    {/* Logo/Brand */}
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">CloudCore</span>
                    </div>

                    {/* Breadcrumb */}
                    <div className="flex items-center gap-1 text-sm">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleNavigate('')}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
                        >
                            <Home className="w-3.5 h-3.5" />
                            <span className="font-medium">Home</span>
                        </motion.button>

                        {pathParts.map((part, index) => {
                            const path = pathParts.slice(0, index + 1).join('/') + '/';
                            return (
                                <div key={index} className="flex items-center gap-1">
                                    <span className="text-zinc-700">/</span>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleBreadcrumbClick(path)}
                                        className="px-2.5 py-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-white/5 transition-all font-medium"
                                    >
                                        {part}
                                    </motion.button>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-3">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search files..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-64 pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all"
                        />
                    </div>

                    {/* Refresh */}
                    <motion.button
                        whileHover={{ scale: 1.05, rotate: 90 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={loadFiles}
                        className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
                        title="Refresh"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </motion.button>

                    {/* Logout */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleLogout}
                        className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
                        title="Logout"
                    >
                        <LogOut className="w-4 h-4" />
                    </motion.button>
                </div>
            </nav>

            {/* Action Bar */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-white/5 bg-zinc-950/50 z-10">
                <div className="flex items-center gap-2">
                    {/* Upload Button */}
                    <motion.label
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg text-sm font-semibold cursor-pointer hover:bg-zinc-200 transition-all"
                    >
                        <Upload className="w-4 h-4" />
                        <span>Upload</span>
                        <input type="file" multiple onChange={handleFileUpload} className="hidden" />
                    </motion.label>

                    {/* New Folder Button */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleCreateFolder}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg text-sm font-semibold hover:bg-white/10 transition-all"
                    >
                        <FolderPlus className="w-4 h-4" />
                        <span>New Folder</span>
                    </motion.button>

                    {/* Selection Actions */}
                    <AnimatePresence>
                        {selectedItems.length > 0 && (
                            <>
                                <motion.div
                                    initial={{ width: 0, opacity: 0 }}
                                    animate={{ width: 'auto', opacity: 1 }}
                                    exit={{ width: 0, opacity: 0 }}
                                    className="h-8 w-px bg-white/10 mx-1"
                                />

                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="flex items-center gap-2"
                                >
                                    <span className="text-xs text-zinc-400 font-medium px-2">
                                        {selectedItems.length} selected
                                    </span>

                                    {selectedItems.every(item => item.type === 'file') && (
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleDownloadSelected}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg text-xs font-semibold hover:bg-blue-500/20 transition-all"
                                        >
                                            <Download className="w-3.5 h-3.5" />
                                            <span>Download</span>
                                        </motion.button>
                                    )}

                                    {selectedItems.length === 1 && selectedItems[0].type === 'file' && (
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleShareSelected}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg text-xs font-semibold hover:bg-green-500/20 transition-all"
                                        >
                                            <Share2 className="w-3.5 h-3.5" />
                                            <span>Share</span>
                                        </motion.button>
                                    )}

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleDelete(selectedItems)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs font-semibold hover:bg-red-500/20 transition-all"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        <span>Delete</span>
                                    </motion.button>

                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setSelectedItems([])}
                                        className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
                                        title="Clear selection"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </motion.button>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-1 p-1 bg-white/5 rounded-lg border border-white/10">
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setViewMode('grid')}
                        className={`p-1.5 rounded-md transition-all ${viewMode === 'grid'
                            ? 'bg-white text-black'
                            : 'text-zinc-400 hover:text-white'
                            }`}
                        title="Grid View"
                    >
                        <LayoutGrid className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setViewMode('list')}
                        className={`p-1.5 rounded-md transition-all ${viewMode === 'list'
                            ? 'bg-white text-black'
                            : 'text-zinc-400 hover:text-white'
                            }`}
                        title="List View"
                    >
                        <ListIcon className="w-4 h-4" />
                    </motion.button>
                </div>
            </div>

            {/* Main Content Area */}
            <main className="flex-1 overflow-hidden z-0 relative">
                <FileList
                    items={filteredItems}
                    selectedItems={selectedItems}
                    onSelectItem={handleSelectItem}
                    onOpenFolder={handleOpenFolder}
                    onDownload={handleSingleDownload}
                    onShare={onShareModal}
                    onRename={(item) => onRenameModal(item, handleRename)}
                    onDelete={(item) => handleDelete([item])}
                    onPreview={onPreviewModal}
                    isLoading={isLoading}
                    viewMode={viewMode}
                />
            </main>

            {/* Upload Progress Panel */}
            <AnimatePresence>
                {uploadingFiles.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed bottom-6 right-6 w-96 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-40"
                    >
                        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-zinc-950/50">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                <h4 className="text-sm font-semibold text-white">
                                    Uploading {uploadingFiles.length} {uploadingFiles.length === 1 ? 'file' : 'files'}
                                </h4>
                            </div>
                        </div>
                        <div className="p-4 space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
                            {uploadingFiles.map((file) => (
                                <motion.div
                                    key={file.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-2"
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-white truncate max-w-72">
                                            {file.name}
                                        </span>
                                        <span className="text-xs font-bold text-zinc-400 tabular-nums">
                                            {Math.round(file.progress)}%
                                        </span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${file.progress}%` }}
                                            transition={{ duration: 0.3, ease: 'easeOut' }}
                                        />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Download Manager */}
            <DownloadManager
                downloads={downloads}
                onRemove={handleRemoveDownload}
                onClear={handleClearDownloads}
            />
        </div>
    );
};
