/**
 * FileExplorer Component
 * Main file explorer interface
 */

import { useState, useEffect, useCallback } from 'react';
import { Upload, FolderPlus, Trash2, LogOut, Search, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Breadcrumb } from './Breadcrumb';
import { FileList } from './FileList';
import {
    listObjects,
    uploadFile,
    uploadLargeFile,
    downloadFile,
    deleteObjects,
    createFolder,
    generateShareableLink
} from '../../services/aws/s3Service';
import { clearAuth, getBucketConfig } from '../../utils/authUtils';

const LARGE_FILE_THRESHOLD = 5 * 1024 * 1024; // 5MB

export const FileExplorer = ({
    onLogout,
    onShareModal,
    onRenameModal,
    onDeleteModal,
    onPreviewModal
}) => {
    const [currentPath, setCurrentPath] = useState('');
    const [items, setItems] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [uploadingFiles, setUploadingFiles] = useState([]);

    // Get bucket name for display
    const bucketConfig = getBucketConfig();

    // Load files for current path
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

    // Load files on mount and path change
    useEffect(() => {
        loadFiles();
    }, [loadFiles]);

    // Navigate to folder
    const handleNavigate = (path) => {
        setCurrentPath(path);
        setSelectedItems([]);
    };

    // Open folder
    const handleOpenFolder = (folder) => {
        setCurrentPath(folder.key);
        setSelectedItems([]);
    };

    // Select/deselect item
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

    // Handle file upload
    const handleFileUpload = async (event) => {
        const files = Array.from(event.target.files || []);
        if (files.length === 0) return;

        const uploadPromises = files.map(async (file) => {
            const key = currentPath ? `${currentPath}${file.name}` : file.name;
            const uploadId = Date.now() + Math.random();

            // Add to uploading list
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
                    toast.success(`${file.name} uploaded successfully`);
                } else {
                    toast.error(`Failed to upload ${file.name}: ${result.error}`);
                }
            } catch (error) {
                toast.error(`Failed to upload ${file.name}`);
            } finally {
                // Remove from uploading list
                setUploadingFiles(prev => prev.filter(f => f.id !== uploadId));
            }
        });

        await Promise.all(uploadPromises);
        loadFiles();
    };

    // Download file
    const handleDownload = async (item) => {
        const result = await downloadFile(item.key);
        if (result.success) {
            toast.success(`Downloading ${item.name}`);
        } else {
            toast.error(`Failed to download: ${result.error}`);
        }
    };

    // Share file
    const handleShare = async (item) => {
        if (onShareModal) {
            onShareModal(item);
        }
    };

    // Rename file
    const handleRename = (item) => {
        if (onRenameModal) {
            onRenameModal(item, loadFiles);
        }
    };

    // Delete items
    const handleDelete = (items) => {
        if (onDeleteModal) {
            onDeleteModal(items, loadFiles);
        }
    };

    // Create folder
    const handleCreateFolder = async () => {
        const folderName = prompt('Enter folder name:');
        if (!folderName) return;

        const folderKey = currentPath ? `${currentPath}${folderName}/` : `${folderName}/`;

        const result = await createFolder(folderKey);
        if (result.success) {
            toast.success('Folder created successfully');
            loadFiles();
        } else {
            toast.error(`Failed to create folder: ${result.error}`);
        }
    };

    // Logout
    const handleLogout = () => {
        clearAuth();
        onLogout();
    };

    // Filtered items based on search
    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="h-screen flex flex-col bg-transparent">
            {/* Header */}
            <div className="bg-white/5 backdrop-blur-xl border-b border-white/10">
                <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-bold gradient-text">
                            CloudCore
                        </h1>
                        {bucketConfig && (
                            <span className="px-3 py-1 text-xs font-medium text-white/70 bg-white/10 rounded-full">
                                {bucketConfig.bucketName}
                            </span>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={loadFiles}
                            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                            title="Refresh"
                        >
                            <RefreshCw className="w-5 h-5" />
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-3 py-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="text-sm">Logout</span>
                        </button>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex items-center justify-between px-4 pb-4 gap-4">
                    {/* Search */}
                    <div className="flex-1 max-w-md relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <input
                            type="text"
                            placeholder="Search files..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50 transition-all"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                        <label className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg cursor-pointer transition-all">
                            <Upload className="w-4 h-4" />
                            <span>Upload</span>
                            <input
                                type="file"
                                multiple
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                        </label>

                        <button
                            onClick={handleCreateFolder}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white/10 hover:bg-white/15 text-white rounded-lg transition-all"
                        >
                            <FolderPlus className="w-4 h-4" />
                            <span>Folder</span>
                        </button>

                        {selectedItems.length > 0 && (
                            <button
                                onClick={() => handleDelete(selectedItems)}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all"
                            >
                                <Trash2 className="w-4 h-4" />
                                <span>Delete ({selectedItems.length})</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Breadcrumb */}
            <Breadcrumb currentPath={currentPath} onNavigate={handleNavigate} />

            {/* File List */}
            <FileList
                items={filteredItems}
                selectedItems={selectedItems}
                onSelectItem={handleSelectItem}
                onOpenFolder={handleOpenFolder}
                onDownload={handleDownload}
                onShare={handleShare}
                onRename={handleRename}
                onDelete={(item) => handleDelete([item])}
                onPreview={onPreviewModal}
                isLoading={isLoading}
            />

            {/* Upload Progress */}
            {uploadingFiles.length > 0 && (
                <div className="fixed bottom-4 right-4 w-72 space-y-2 z-50">
                    {uploadingFiles.map((file) => (
                        <motion.div
                            key={file.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="p-3 bg-[var(--color-surface-dark)]/95 backdrop-blur-xl border border-white/20 rounded-lg shadow-xl"
                        >
                            <p className="text-xs text-white/90 mb-2 truncate">{file.name}</p>
                            <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${file.progress}%` }}
                                    className="h-full bg-linear-to-r from-purple-500 to-pink-500"
                                />
                            </div>
                            <p className="text-xs text-white/60 mt-1">{file.progress}%</p>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};
