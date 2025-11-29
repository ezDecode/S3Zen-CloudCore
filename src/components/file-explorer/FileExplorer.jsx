/**
 * FileExplorer Component
 * Modern, modular file management interface
 * 
 * Architecture:
 * - Custom hooks handle business logic (upload, download, navigation)
 * - Sub-components handle UI sections (nav, action bar)
 * - Main component orchestrates everything
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload02Icon } from 'hugeicons-react';
import { toast } from 'sonner';

// Components
import { FileExplorerNav } from './components/FileExplorerNav';
import { FileExplorerActionBar } from './components/FileExplorerActionBar';
import { UploadProgressPanel } from './components/UploadProgressPanel';
import { FileList } from './FileList';
import { DownloadManager } from '../common/DownloadManager';
import { DuplicateFileModal } from '../modals/DuplicateFileModal';

// Hooks
import { useFileNavigation } from './hooks/useFileNavigation';
import { useFileOperations } from './hooks/useFileOperations';
import { useDragAndDrop } from './hooks/useDragAndDrop';

// Services
import { listObjects } from '../../services/aws/s3Service';
import { clearAuth } from '../../utils/authUtils';

export const FileExplorer = ({
    onLogout,
    onShareModal,
    onRenameModal,
    onDeleteModal,
    onPreviewModal,
    onCreateFolderModal,
    onDetailsModal,
    onShowSetupGuide
}) => {
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

    // Navigation & Selection
    const {
        currentPath,
        setCurrentPath,
        selectedItems,
        setSelectedItems,
        searchQuery,
        setSearchQuery,
        sortBy,
        sortOrder,
        viewMode,
        setViewMode,
        handleNavigate,
        handleOpenFolder,
        handleSelectItem,
        handleSelectAll,
        clearSelection,
        handleSort,
        sortedItems
    } = useFileNavigation(items);

    // Load files
    const loadFilesRef = useRef(null);
    const loadFiles = useCallback(async (skipLoading = false) => {
        if (loadFilesRef.current) {
            loadFilesRef.current.cancelled = true;
        }

        const currentRequest = { cancelled: false };
        loadFilesRef.current = currentRequest;

        if (!skipLoading) setIsLoading(true);

        try {
            const result = await listObjects(currentPath);

            if (currentRequest.cancelled) return;

            if (result.success) {
                setItems(result.items);
            } else {
                toast.error(`Failed to load files: ${result.error}`);
            }
        } catch (error) {
            if (!currentRequest.cancelled) {
                toast.error('Failed to load files');
            }
        } finally {
            if (!currentRequest.cancelled) {
                setIsLoading(false);
            }
        }
    }, [currentPath]);

    // Load files when path changes
    useEffect(() => {
        loadFiles();
    }, [loadFiles]);

    // File Operations
    const {
        uploadingFiles,
        downloads,
        duplicateFileInfo,
        setDuplicateFileInfo,
        processUploads,
        handleSingleDownload,
        handleDownloadSelected,
        handleRename,
        handleRemoveDownload,
        handleClearDownloads
    } = useFileOperations(currentPath, items, setItems, loadFiles, handleNavigate);

    // Drag & Drop
    const {
        isDragging,
        handleDragOver,
        handleDragLeave,
        handleDrop
    } = useDragAndDrop(processUploads);

    // Event Handlers
    const handleFileUpload = useCallback(async (event) => {
        const files = Array.from(event.target.files || []);
        if (files.length > 0) {
            await processUploads(files);
            event.target.value = '';
        }
    }, [processUploads]);

    const handleCreateFolder = useCallback(() => {
        if (onCreateFolderModal) {
            onCreateFolderModal(currentPath, loadFiles);
        }
    }, [onCreateFolderModal, currentPath, loadFiles]);

    const handleDelete = useCallback((itemsToDelete) => {
        if (onDeleteModal) {
            onDeleteModal(itemsToDelete, () => {
                const deletingCurrentOrParentFolder = itemsToDelete.some(item => {
                    if (item.type === 'folder') {
                        return currentPath.startsWith(item.key) || currentPath === item.key;
                    }
                    return false;
                });

                if (deletingCurrentOrParentFolder) {
                    const pathParts = currentPath.split('/').filter(Boolean);
                    if (pathParts.length > 1) {
                        pathParts.pop();
                        const parentPath = pathParts.join('/') + '/';
                        setCurrentPath(parentPath);
                    } else {
                        setCurrentPath('');
                    }
                }

                setSelectedItems([]);
                loadFiles();
            });
        }
    }, [onDeleteModal, currentPath, setCurrentPath, setSelectedItems, loadFiles]);

    const handleShareSelected = useCallback(() => {
        if (selectedItems.length === 1 && selectedItems[0].type === 'file') {
            onShareModal(selectedItems[0]);
        }
    }, [selectedItems, onShareModal]);

    const handleLogout = useCallback(() => {
        clearAuth();
        onLogout();
    }, [onLogout]);

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

            {/* Navigation */}
            <FileExplorerNav
                currentPath={currentPath}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onNavigate={handleNavigate}
                onRefresh={loadFiles}
                onShowSetupGuide={onShowSetupGuide}
                onLogout={handleLogout}
            />

            {/* Action Bar */}
            <FileExplorerActionBar
                items={items}
                selectedItems={selectedItems}
                sortBy={sortBy}
                sortOrder={sortOrder}
                viewMode={viewMode}
                mobileDrawerOpen={mobileDrawerOpen}
                onSelectAll={handleSelectAll}
                onClearSelection={clearSelection}
                onDownloadSelected={() => handleDownloadSelected(selectedItems)}
                onShareSelected={handleShareSelected}
                onDelete={handleDelete}
                onSort={handleSort}
                onSetSortOrder={(order) => handleSort(sortBy)}
                onSetViewMode={setViewMode}
                onSetMobileDrawerOpen={setMobileDrawerOpen}
                onFileUpload={handleFileUpload}
                onCreateFolder={handleCreateFolder}
            />

            {/* File List */}
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
                    onPreview={(item) => onPreviewModal(item, sortedItems)}
                    onDetails={onDetailsModal}
                    isLoading={isLoading}
                    viewMode={viewMode}
                />
            </main>

            {/* Upload Progress Panel */}
            <UploadProgressPanel uploadingFiles={uploadingFiles} />

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
