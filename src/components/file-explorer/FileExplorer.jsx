/**
 * FileExplorer Component
 * Complete UI Redesign - Modern & Sophisticated
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Upload02Icon, FolderAddIcon, Delete02Icon, Logout01Icon, Search01Icon, Loading03Icon, Home01Icon, LayoutGridIcon, ListViewIcon, Download01Icon, Share01Icon, Cancel01Icon, Tick01Icon, UserGroupIcon, ArrowUp01Icon, PlusSignIcon, File02Icon } from 'hugeicons-react';
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

const LARGE_FILE_THRESHOLD = 100 * 1024 * 1024; // 100MB

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
    const [viewMode, setViewMode] = useState(() => {
        // Load view mode from localStorage
        const saved = localStorage.getItem('cloudcore_view_mode');
        return saved || 'grid';
    });
    const [isDragging, setIsDragging] = useState(false);
    const [sortBy, setSortBy] = useState('name'); // 'name', 'size', 'date'
    const [sortOrder, setSortOrder] = useState('asc'); // 'asc', 'desc'
    const [showSortMenu, setShowSortMenu] = useState(false);
    const [showNewMenu, setShowNewMenu] = useState(false);
    const sortMenuRef = useRef(null);
    const newMenuRef = useRef(null);

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

    // Save view mode preference
    useEffect(() => {
        localStorage.setItem('cloudcore_view_mode', viewMode);
    }, [viewMode]);

    // Click outside handler for sort menu
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sortMenuRef.current && !sortMenuRef.current.contains(event.target)) {
                setShowSortMenu(false);
            }
            if (newMenuRef.current && !newMenuRef.current.contains(event.target)) {
                setShowNewMenu(false);
            }
        };
        if (showSortMenu || showNewMenu) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [showSortMenu, showNewMenu]);

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
    const processUploads = async (files) => {
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

    const handleFileUpload = async (event) => {
        const files = Array.from(event.target.files || []);
        await processUploads(files);
    };

    // Drag and Drop Handlers
    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isDragging) setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        // Only disable if we're leaving the main container
        if (e.currentTarget.contains(e.relatedTarget)) return;
        setIsDragging(false);
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files || []);
        if (files.length > 0) {
            await processUploads(files);
        }
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

    const filteredItems = useMemo(() => items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    ), [items, searchQuery]);

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    const sortedItems = useMemo(() => [...filteredItems].sort((a, b) => {
        // Always keep folders on top
        if (a.type !== b.type) {
            return a.type === 'folder' ? -1 : 1;
        }

        let comparison = 0;
        switch (sortBy) {
            case 'name':
                comparison = a.name.localeCompare(b.name);
                break;
            case 'size':
                comparison = (a.size || 0) - (b.size || 0);
                break;
            case 'date':
                comparison = new Date(a.lastModified || 0) - new Date(b.lastModified || 0);
                break;
            default:
                comparison = 0;
        }

        return sortOrder === 'asc' ? comparison : -comparison;
    }), [filteredItems, sortBy, sortOrder]);

    const handleLogout = () => {
        clearAuth();
        onLogout();
    };

    // Breadcrumb Parts
    const pathParts = currentPath.split('/').filter(Boolean);

    return (
        <div
            className="file-explorer-wrapper h-screen flex flex-col bg-black text-white overflow-hidden relative"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {/* Drag Overlay */}
            <AnimatePresence>
                {isDragging && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 bg-blue-500/20 backdrop-blur-sm flex items-center justify-center border-2 border-blue-500 border-dashed m-4 rounded-2xl pointer-events-none"
                    >
                        <div className="bg-zinc-900/90 p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4 border border-blue-500/30">
                            <div className="p-4 bg-blue-500/20 rounded-full">
                                <Upload02Icon className="w-12 h-12 text-blue-400" />
                            </div>
                            <div className="text-center">
                                <h3 className="text-xl font-bold text-white">Drop files to upload</h3>
                                <p className="text-zinc-400 mt-1">Files will be uploaded to the current folder</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Top Navigation Bar */}
            <nav className="flex flex-row items-center px-3 sm:px-6 py-3 sm:py-4 border-b border-white/5 bg-gradient-to-b from-zinc-900/50 to-transparent backdrop-blur-sm z-10 gap-2 sm:gap-4">
                {/* Logo/Brand - Hidden on mobile */}
                <div className="hidden lg:flex items-center gap-2 shrink-0 mr-2">
                    <span className="font-bold text-lg">CloudCore</span>
                </div>

                {/* Breadcrumb Area */}
                <div className="flex items-center gap-1 text-sm min-w-0 flex-1">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleNavigate('')}
                        className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-white/5 transition-all shrink-0"
                    >
                        <Home01Icon className="w-4 h-4" />
                        <span className="font-medium hidden sm:inline">Home</span>
                    </motion.button>

                    <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide min-w-0">
                        {pathParts.map((part, index) => {
                            const path = pathParts.slice(0, index + 1).join('/') + '/';
                            return (
                                <div key={index} className="flex items-center gap-1 shrink-0">
                                    <span className="text-zinc-700">/</span>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleBreadcrumbClick(path)}
                                        className="px-2 sm:px-2.5 py-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-white/5 transition-all font-medium max-w-[80px] sm:max-w-none truncate"
                                    >
                                        {part}
                                    </motion.button>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right Actions - All in one line */}
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-auto">
                    {/* Search */}
                    <div className="relative w-32 sm:w-48 md:w-64">
                        <Search01Icon className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-4 sm:w-4 h-4 sm:h-4 text-zinc-500 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-8 sm:pl-10 pr-2 sm:pr-4 py-1.5 sm:py-2 bg-white/5 border border-white/10 rounded-lg text-xs sm:text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all"
                        />
                    </div>

                    {/* Refresh - Hidden on mobile */}
                    <motion.button
                        whileHover={{ scale: 1.05, rotate: 90 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={loadFiles}
                        className="hidden sm:flex p-1.5 sm:p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-all shrink-0"
                        title="Refresh"
                    >
                        <Loading03Icon className="w-4.5 h-4.5" />
                    </motion.button>


                    {/* Logout */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleLogout}
                        className="p-1.5 sm:p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-all shrink-0"
                        title="Logout"
                    >
                        <Logout01Icon className="w-4 sm:w-4.5 h-4 sm:h-4.5" />
                    </motion.button>
                </div>
            </nav>

            {/* Action Bar */}
            <div className="flex flex-row items-center justify-between px-3 sm:px-6 py-2 sm:py-3 border-b border-white/5 bg-zinc-950/50 z-10 gap-2">
                {/* Left Actions - New Button, Select All */}
                <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
                    {/* New Button Dropdown */}
                    <div className="relative" ref={newMenuRef}>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowNewMenu(!showNewMenu)}
                            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white text-black rounded-lg text-xs sm:text-sm font-bold shadow-lg shadow-white/10 hover:bg-zinc-200 transition-all shrink-0"
                        >
                            <PlusSignIcon className="w-4 sm:w-4.5 h-4 sm:h-4.5" />
                            <span className="hidden sm:inline">New</span>
                        </motion.button>

                        <AnimatePresence>
                            {showNewMenu && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                    className="absolute left-0 top-full mt-2 w-48 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 py-1"
                                >
                                    <label className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors cursor-pointer">
                                        <Upload02Icon className="w-4 h-4" />
                                        <span>Upload File</span>
                                        <input type="file" multiple onChange={(e) => {
                                            handleFileUpload(e);
                                            setShowNewMenu(false);
                                        }} className="hidden" />
                                    </label>

                                    <button
                                        onClick={() => {
                                            handleCreateFolder();
                                            setShowNewMenu(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
                                    >
                                        <FolderAddIcon className="w-4 h-4" />
                                        <span>New Folder</span>
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Select All Button - Shows only when items are selected */}
                    {selectedItems.length > 0 && (
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                                if (selectedItems.length === items.length) {
                                    setSelectedItems([]);
                                } else {
                                    setSelectedItems(items);
                                }
                            }}
                            className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 border rounded-lg text-xs sm:text-sm font-semibold transition-all shrink-0 ${selectedItems.length === items.length && items.length > 0
                                ? 'bg-blue-500 border-blue-500 text-white'
                                : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            <Tick01Icon className="w-4 sm:w-4.5 h-4 sm:h-4.5" />
                            <span className="hidden sm:inline">{selectedItems.length === items.length ? 'Deselect All' : 'Select All'}</span>
                        </motion.button>
                    )}

                    {/* Selection Actions */}
                    <AnimatePresence>
                        {selectedItems.length > 0 && (
                            <>
                                <motion.div
                                    initial={{ width: 0, opacity: 0 }}
                                    animate={{ width: 'auto', opacity: 1 }}
                                    exit={{ width: 0, opacity: 0 }}
                                    className="hidden sm:block h-8 w-px bg-white/10 mx-1 shrink-0"
                                />

                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="flex items-center gap-1.5 sm:gap-2 shrink-0 min-w-0"
                                >
                                    <span className="hidden md:inline text-xs text-zinc-400 font-medium px-2 whitespace-nowrap">
                                        {selectedItems.length} selected
                                    </span>

                                    {selectedItems.every(item => item.type === 'file') && (
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleDownloadSelected}
                                            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg text-xs font-semibold hover:bg-blue-500/20 transition-all shrink-0"
                                            title="Download"
                                        >
                                            <Download01Icon className="w-4 h-4" />
                                            <span className="hidden sm:inline">Download</span>
                                        </motion.button>
                                    )}

                                    {selectedItems.length === 1 && selectedItems[0].type === 'file' && (
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleShareSelected}
                                            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg text-xs font-semibold hover:bg-green-500/20 transition-all shrink-0"
                                            title="Share"
                                        >
                                            <Share01Icon className="w-4 h-4" />
                                            <span className="hidden sm:inline">Share</span>
                                        </motion.button>
                                    )}

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleDelete(selectedItems)}
                                        className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs font-semibold hover:bg-red-500/20 transition-all shrink-0"
                                        title="Delete"
                                    >
                                        <Delete02Icon className="w-4 h-4" />
                                        <span className="hidden sm:inline">Delete</span>
                                    </motion.button>

                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setSelectedItems([])}
                                        className="p-1 sm:p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-all shrink-0"
                                        title="Clear selection"
                                    >
                                        <Cancel01Icon className="w-4 h-4" />
                                    </motion.button>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>

                {/* Sort Menu */}
                <div className="relative" ref={sortMenuRef}>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowSortMenu(!showSortMenu)}
                        className={`p-1.5 sm:p-2 rounded-lg transition-all shrink-0 ${showSortMenu ? 'text-white bg-white/10' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
                        title="Sort"
                    >
                        <ArrowUp01Icon className="w-4.5 h-4.5" />
                    </motion.button>

                    <AnimatePresence>
                        {showSortMenu && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                className="absolute right-0 top-full mt-2 w-48 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 py-1"
                            >
                                <div className="px-3 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                    Sort By
                                </div>
                                {['name', 'size', 'date'].map((field) => (
                                    <button
                                        key={field}
                                        onClick={() => {
                                            handleSort(field);
                                            setShowSortMenu(false);
                                        }}
                                        className="w-full flex items-center justify-between px-3 py-2 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors capitalize"
                                    >
                                        <span>{field}</span>
                                        {sortBy === field && (
                                            <Tick01Icon className="w-4 h-4 text-blue-500" />
                                        )}
                                    </button>
                                ))}
                                <div className="h-px bg-white/10 my-1" />
                                <div className="px-3 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                    Order
                                </div>
                                <button
                                    onClick={() => {
                                        setSortOrder('asc');
                                        setShowSortMenu(false);
                                    }}
                                    className="w-full flex items-center justify-between px-3 py-2 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
                                >
                                    <span>Ascending</span>
                                    {sortOrder === 'asc' && (
                                        <Tick01Icon className="w-4 h-4 text-blue-500" />
                                    )}
                                </button>
                                <button
                                    onClick={() => {
                                        setSortOrder('desc');
                                        setShowSortMenu(false);
                                    }}
                                    className="w-full flex items-center justify-between px-3 py-2 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
                                >
                                    <span>Descending</span>
                                    {sortOrder === 'desc' && (
                                        <Tick01Icon className="w-4 h-4 text-blue-500" />
                                    )}
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-0.5 sm:gap-1 p-0.5 sm:p-1 bg-white/5 rounded-lg border border-white/10 shrink-0">
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setViewMode('grid')}
                        className={`p-1 sm:p-1.5 rounded-md transition-all ${viewMode === 'grid'
                            ? 'bg-white text-black'
                            : 'text-zinc-400 hover:text-white'
                            }`}
                        title="Grid View"
                    >
                        <LayoutGridIcon className="w-4 sm:w-4.5 h-4 sm:h-4.5" />
                    </motion.button>
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setViewMode('list')}
                        className={`p-1 sm:p-1.5 rounded-md transition-all ${viewMode === 'list'
                            ? 'bg-white text-black'
                            : 'text-zinc-400 hover:text-white'
                            }`}
                        title="List View"
                    >
                        <ListViewIcon className="w-4 sm:w-4.5 h-4 sm:h-4.5" />
                    </motion.button>
                </div>
            </div>

            {/* Main Content Area - Fixed scrolling */}
            <main className="flex-1 flex flex-col overflow-hidden z-0 relative">
                <FileList
                    items={sortedItems}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={handleSort}
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
                        className="fixed bottom-0 sm:bottom-6 right-0 sm:right-6 w-full sm:w-96 bg-zinc-900/98 border-t sm:border border-white/10 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden z-40 backdrop-blur-2xl"
                    >
                        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-zinc-950/50">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                <h4 className="text-sm font-semibold text-white">
                                    Uploading {uploadingFiles.length} {uploadingFiles.length === 1 ? 'file' : 'files'}
                                </h4>
                            </div>
                        </div>
                        <div className="p-4 space-y-3 max-h-60 sm:max-h-80 overflow-y-auto custom-scrollbar">
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
                                            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"
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
