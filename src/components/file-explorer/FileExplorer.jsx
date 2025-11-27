/**
 * FileExplorer Component
 * Complete UI Redesign - Modern & Sophisticated
 */

import { useState, useEffect, useCallback, useRef, useMemo, Fragment } from 'react';
import { Upload02Icon, FolderAddIcon, Delete02Icon, Logout01Icon, Search01Icon, Loading03Icon, Home01Icon, LayoutGridIcon, ListViewIcon, Download01Icon, Share01Icon, Cancel01Icon, Tick01Icon, UserGroupIcon, ArrowUp01Icon, PlusSignIcon, File02Icon } from 'hugeicons-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { FileList } from './FileList';
import { DownloadManager } from '../common/DownloadManager';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
    BreadcrumbEllipsis,
} from "../ui/breadcrumb";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "../ui/drawer";
import { Button } from "../ui/button";
import { DuplicateFileModal } from '../modals/DuplicateFileModal';
import {
    listObjects,
    uploadFile,
    uploadLargeFile,
    downloadFile,
    renameObject
} from '../../services/aws/s3Service';
import { clearAuth, getBucketConfig } from '../../utils/authUtils';
import { buildS3Key } from '../../utils/validationUtils';

const LARGE_FILE_THRESHOLD = 100 * 1024 * 1024; // 100MB

export const FileExplorer = ({
    onLogout,
    onShareModal,
    onRenameModal,
    onDeleteModal,
    onPreviewModal,
    onCreateFolderModal,
    onDetailsModal
}) => {
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
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
    const [duplicateFileInfo, setDuplicateFileInfo] = useState(null);

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

    // Helper to recursively get files from DataTransferItems
    const getFilesFromDataTransferItems = async (items) => {
        const files = [];
        const queue = [];

        // Initial queue population
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.kind === 'file') {
                const entry = item.webkitGetAsEntry ? item.webkitGetAsEntry() : (item.getAsEntry ? item.getAsEntry() : null);
                if (entry) {
                    queue.push(entry);
                }
            }
        }

        while (queue.length > 0) {
            const entry = queue.shift();
            if (entry.isFile) {
                try {
                    const file = await new Promise((resolve, reject) => {
                        entry.file(resolve, reject);
                    });
                    // entry.fullPath usually starts with /, remove it
                    const path = entry.fullPath.startsWith('/') ? entry.fullPath.slice(1) : entry.fullPath;
                    files.push({ file, path });
                } catch (err) {
                    console.error('Error reading file entry:', err);
                }
            } else if (entry.isDirectory) {
                try {
                    const reader = entry.createReader();
                    // readEntries might not return all entries in one call, need to loop until empty
                    const readAllEntries = async () => {
                        let allEntries = [];
                        let done = false;
                        while (!done) {
                            const entries = await new Promise((resolve, reject) => {
                                reader.readEntries(resolve, reject);
                            });
                            if (entries.length === 0) {
                                done = true;
                            } else {
                                allEntries = [...allEntries, ...entries];
                            }
                        }
                        return allEntries;
                    };

                    const entries = await readAllEntries();
                    queue.push(...entries);
                } catch (err) {
                    console.error('Error reading directory entry:', err);
                }
            }
        }

        return files;
    };

    // Actions
    const processUploads = async (files) => {
        if (files.length === 0) return;

        for (const item of files) {
            // Handle both raw File objects (from input) and {file, path} objects (from drop)
            const file = item.file || item;
            // For input files, use name. For dropped files, use path if available.
            // If input file has webkitRelativePath (folder upload via input), use it.
            const relativePath = item.path || file.webkitRelativePath || file.name;

            // Check if file already exists (only for top-level files)
            const isNested = relativePath.includes('/');
            let fileExists = false;

            if (!isNested) {
                fileExists = items.some(existing =>
                    existing.type === 'file' && existing.name === relativePath
                );
            }

            if (fileExists) {
                // Show duplicate modal and wait for user decision
                const resolution = await new Promise((resolve) => {
                    setDuplicateFileInfo({
                        file,
                        onResolve: resolve
                    });
                });

                if (resolution.action === 'cancel') {
                    continue; // Skip this file
                }

                let finalFileName = relativePath;
                if (resolution.action === 'keepBoth' || resolution.action === 'rename') {
                    finalFileName = resolution.newFileName;
                }

                // Upload with resolved name
                await uploadSingleFile(file, finalFileName);
            } else {
                // No duplicate, upload directly
                await uploadSingleFile(file, relativePath);
            }
        }

        await loadFiles();
    };

    const uploadSingleFile = async (file, fileName) => {
        // Use helper to build S3 key correctly
        const key = buildS3Key(currentPath, fileName);
        const uploadId = Date.now() + Math.random();

        setUploadingFiles(prev => [...prev, { id: uploadId, name: fileName, progress: 0 }]);

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
                toast.success(`Uploaded ${fileName}`);

                // Optimistically add the file to the list without refreshing
                // Only add if it's in the current view (not nested in a new folder)
                const isNested = fileName.includes('/');
                if (!isNested) {
                    const newItem = {
                        key: key,
                        name: fileName,
                        type: 'file',
                        size: file.size,
                        lastModified: new Date().toISOString()
                    };

                    setItems(prev => {
                        // Check if item already exists (in case of replace)
                        const existingIndex = prev.findIndex(item => item.key === key);
                        if (existingIndex !== -1) {
                            // Replace existing item
                            const newItems = [...prev];
                            newItems[existingIndex] = newItem;
                            return newItems;
                        } else {
                            // Add new item
                            return [...prev, newItem];
                        }
                    });
                }
            } else {
                toast.error(`Failed to upload ${fileName}`);
            }
        } catch (error) {
            toast.error(`Error uploading ${fileName}`);
        } finally {
            setUploadingFiles(prev => prev.filter(f => f.id !== uploadId));
        }
    };

    const handleFileUpload = async (event) => {
        const files = Array.from(event.target.files || []);
        if (files.length > 0) {
            await processUploads(files);
            // Reset the input so the same file can be selected again
            event.target.value = '';
        }
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

        const items = e.dataTransfer.items;
        if (items && items.length > 0) {
            const filesWithPath = await getFilesFromDataTransferItems(items);
            if (filesWithPath.length > 0) {
                await processUploads(filesWithPath);
            }
        } else {
            const files = Array.from(e.dataTransfer.files || []);
            if (files.length > 0) {
                await processUploads(files);
            }
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
                        className="absolute inset-0 z-50 bg-[rgba(59,130,246,0.2)] backdrop-blur-sm flex items-center justify-center border-2 border-blue-500 border-dashed m-4 rounded-2xl pointer-events-none"
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
                <div className="flex items-center min-w-0 flex-1">
                    <Breadcrumb>
                        <BreadcrumbList>
                            {/* Home */}
                            <BreadcrumbItem key="home">
                                <BreadcrumbLink
                                    onClick={() => handleNavigate('')}
                                    className="flex items-center gap-1 cursor-pointer"
                                >
                                    <Home01Icon className="w-4 h-4" />
                                    <span className="hidden sm:inline">Home</span>
                                </BreadcrumbLink>
                            </BreadcrumbItem>

                            {/* Breadcrumb with Ellipsis - Show first item, ellipsis, and last 2 items */}
                            {pathParts.length > 0 && (
                                <>
                                    {pathParts.length <= 2 ? (
                                        // Show all items if 2 or less
                                        <AnimatePresence mode="popLayout">
                                            {pathParts.map((part, index) => {
                                                const path = pathParts.slice(0, index + 1).join('/') + '/';
                                                const isLast = index === pathParts.length - 1;
                                                return (
                                                    <Fragment key={path}>
                                                        <BreadcrumbSeparator />
                                                        <BreadcrumbItem>
                                                            {isLast ? (
                                                                <BreadcrumbPage>{part}</BreadcrumbPage>
                                                            ) : (
                                                                <BreadcrumbLink
                                                                    onClick={() => handleBreadcrumbClick(path)}
                                                                    className="cursor-pointer"
                                                                >
                                                                    {part}
                                                                </BreadcrumbLink>
                                                            )}
                                                        </BreadcrumbItem>
                                                    </Fragment>
                                                );
                                            })}
                                        </AnimatePresence>
                                    ) : (
                                        // Show first, ellipsis dropdown, and last item
                                        <>
                                            {/* First item */}
                                            <BreadcrumbSeparator />
                                            <BreadcrumbItem>
                                                <BreadcrumbLink
                                                    onClick={() => handleBreadcrumbClick(pathParts.slice(0, 1).join('/') + '/')}
                                                    className="cursor-pointer"
                                                >
                                                    {pathParts[0]}
                                                </BreadcrumbLink>
                                            </BreadcrumbItem>

                                            {/* Ellipsis with dropdown for middle items */}
                                            <BreadcrumbSeparator />
                                            <BreadcrumbItem>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger className="flex items-center gap-1 outline-none">
                                                        <BreadcrumbEllipsis className="h-4 w-4" />
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="start" className="w-56 bg-zinc-900/95 backdrop-blur-xl border-white/10">
                                                        {pathParts.slice(1, -1).map((part, index) => {
                                                            const actualIndex = index + 1;
                                                            const path = pathParts.slice(0, actualIndex + 1).join('/') + '/';
                                                            return (
                                                                <DropdownMenuItem
                                                                    key={path}
                                                                    onClick={() => handleBreadcrumbClick(path)}
                                                                    className="cursor-pointer hover:bg-white/10 focus:bg-white/10"
                                                                >
                                                                    {part}
                                                                </DropdownMenuItem>
                                                            );
                                                        })}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </BreadcrumbItem>

                                            {/* Last item (current page) */}
                                            <BreadcrumbSeparator />
                                            <BreadcrumbItem>
                                                <BreadcrumbPage>{pathParts[pathParts.length - 1]}</BreadcrumbPage>
                                            </BreadcrumbItem>
                                        </>
                                    )}
                                </>
                            )}
                        </BreadcrumbList>
                    </Breadcrumb>
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
                        className="hidden sm:flex p-1.5 sm:p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-all shrink-0"
                        title="Refresh"
                    >
                        <Loading03Icon className="w-4.5 h-4.5" />
                    </motion.button>


                    {/* Logout */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleLogout}
                        className="p-1.5 sm:p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-all shrink-0"
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
                    {/* New Button - Desktop Dropdown & Mobile Drawer */}
                    <div className="flex items-center">
                        {/* Desktop Dropdown */}
                        <div className="hidden sm:block">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="default" className="gap-2 bg-white text-black hover:bg-zinc-200 font-bold">
                                        <PlusSignIcon className="w-4.5 h-4.5" />
                                        New
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-48 bg-zinc-900 border-zinc-800">
                                    <DropdownMenuItem
                                        className="cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800"
                                        onSelect={() => document.getElementById('desktop-file-upload').click()}
                                    >
                                        <Upload02Icon className="w-4 h-4 mr-2" />
                                        Upload File
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800"
                                        onSelect={handleCreateFolder}
                                    >
                                        <FolderAddIcon className="w-4 h-4 mr-2" />
                                        New Folder
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <input
                                id="desktop-file-upload"
                                type="file"
                                multiple
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                        </div>

                        {/* Mobile Drawer */}
                        <div className="sm:hidden">
                            <Drawer open={mobileDrawerOpen} onOpenChange={setMobileDrawerOpen}>
                                <DrawerTrigger asChild>
                                    <Button variant="default" size="icon" className="bg-white text-black hover:bg-zinc-200 rounded-lg">
                                        <PlusSignIcon className="w-4.5 h-4.5" />
                                    </Button>
                                </DrawerTrigger>
                                <DrawerContent className="bg-zinc-950 border-zinc-800">
                                    <DrawerHeader>
                                        <DrawerTitle>Add New</DrawerTitle>
                                        <DrawerDescription>Upload files or create folders</DrawerDescription>
                                    </DrawerHeader>
                                    <div className="p-4 space-y-4">
                                        <div
                                            className="border-2 border-dashed border-zinc-800 rounded-xl p-8 flex flex-col items-center justify-center gap-2 text-zinc-400 active:bg-zinc-900 transition-colors cursor-pointer"
                                            onClick={() => document.getElementById('mobile-file-upload').click()}
                                        >
                                            <Upload02Icon className="w-8 h-8 mb-2" />
                                            <span className="text-sm font-medium">Tap to upload files</span>
                                            <span className="text-xs text-zinc-500">or drag and drop here</span>
                                            <input
                                                id="mobile-file-upload"
                                                type="file"
                                                multiple
                                                onChange={(e) => {
                                                    handleFileUpload(e);
                                                    setMobileDrawerOpen(false); // Close drawer when files are selected
                                                }}
                                                className="hidden"
                                            />
                                        </div>
                                        <DrawerClose asChild>
                                            <Button
                                                className="w-full justify-start h-12 text-base bg-zinc-900 hover:bg-zinc-800 border-zinc-800"
                                                variant="outline"
                                                onClick={handleCreateFolder}
                                            >
                                                <FolderAddIcon className="w-5 h-5 mr-3" />
                                                Create New Folder
                                            </Button>
                                        </DrawerClose>
                                    </div>
                                    <DrawerFooter>
                                        <DrawerClose asChild>
                                            <Button variant="outline" className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800">Cancel</Button>
                                        </DrawerClose>
                                    </DrawerFooter>
                                </DrawerContent>
                            </Drawer>
                        </div>
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
                                : 'bg-[rgba(255,255,255,0.05)] border-white/10 text-zinc-400 hover:text-white hover:bg-[rgba(255,255,255,0.1)]'
                                }`}
                        >
                            <Tick01Icon className="w-4 sm:w-4.5 h-4 sm:h-4.5" />
                            <span className="hidden sm:inline">{selectedItems.length === items.length ? 'Remove All' : 'Select All'}</span>
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
                                    className="hidden sm:block h-8 w-px bg-[rgba(255,255,255,0.1)] mx-1 shrink-0"
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
                                            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-[rgba(59,130,246,0.1)] border border-blue-500/20 text-blue-400 rounded-lg text-xs font-semibold hover:bg-[rgba(59,130,246,0.2)] transition-all shrink-0"
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
                                            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-[rgba(34,197,94,0.1)] border border-green-500/20 text-green-400 rounded-lg text-xs font-semibold hover:bg-[rgba(34,197,94,0.2)] transition-all shrink-0"
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
                                        className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-[rgba(239,68,68,0.1)] border border-red-500/20 text-red-400 rounded-lg text-xs font-semibold hover:bg-[rgba(239,68,68,0.2)] transition-all shrink-0"
                                        title="Delete"
                                    >
                                        <Delete02Icon className="w-4 h-4" />
                                        <span className="hidden sm:inline">Delete</span>
                                    </motion.button>

                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setSelectedItems([])}
                                        className="p-1 sm:p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-all shrink-0"
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
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-1.5 sm:p-2 rounded-lg transition-all shrink-0 text-zinc-400 hover:text-white data-[state=open]:text-white data-[state=open]:bg-[rgba(255,255,255,0.1)]"
                            title="Sort"
                        >
                            <ArrowUp01Icon className="w-4.5 h-4.5" />
                        </motion.button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-zinc-900 border-zinc-800">
                        <DropdownMenuLabel className="text-zinc-500 text-xs uppercase tracking-wider">Sort By</DropdownMenuLabel>
                        {['name', 'size', 'date'].map((field) => (
                            <DropdownMenuItem
                                key={field}
                                onSelect={() => handleSort(field)}
                                className="justify-between capitalize cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800"
                            >
                                {field}
                                {sortBy === field && <Tick01Icon className="w-4 h-4 text-blue-500" />}
                            </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator className="bg-white/10" />
                        <DropdownMenuLabel className="text-zinc-500 text-xs uppercase tracking-wider">Order</DropdownMenuLabel>
                        <DropdownMenuItem
                            onSelect={() => setSortOrder('asc')}
                            className="justify-between cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800"
                        >
                            Ascending
                            {sortOrder === 'asc' && <Tick01Icon className="w-4 h-4 text-blue-500" />}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onSelect={() => setSortOrder('desc')}
                            className="justify-between cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800"
                        >
                            Descending
                            {sortOrder === 'desc' && <Tick01Icon className="w-4 h-4 text-blue-500" />}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

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
                            onDetails={onDetailsModal}
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

                    {/* Duplicate File Modal */}
                    {duplicateFileInfo && (
                        <DuplicateFileModal
                            isOpen={!!duplicateFileInfo}
                            fileName={duplicateFileInfo.file?.name || ''}
                            onClose={() => setDuplicateFileInfo(null)}
                            onResolve={(resolution) => {
                                if (duplicateFileInfo.onResolve) {
                                    duplicateFileInfo.onResolve(resolution);
                                }
                                setDuplicateFileInfo(null);
                            }}
                        />
                    )}
            </div>
            );
};