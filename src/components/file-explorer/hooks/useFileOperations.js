/**
 * useFileOperations Hook
 * Handles all file/folder operations (upload, download, delete, rename)
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
    uploadFile,
    uploadLargeFile,
    downloadFile,
    renameObject
} from '../../../services/aws/s3Service';
import { buildS3Key } from '../../../utils/validationUtils';

const LARGE_FILE_THRESHOLD = 100 * 1024 * 1024; // 100MB

export const useFileOperations = (currentPath, items, setItems, loadFiles) => {
    const [uploadingFiles, setUploadingFiles] = useState([]);
    const [downloads, setDownloads] = useState([]);
    const [duplicateFileInfo, setDuplicateFileInfo] = useState(null);

    // Upload single file
    const uploadSingleFile = useCallback(async (file, fileName) => {
        const key = buildS3Key(currentPath, fileName);
        const uploadId = Date.now() + Math.random();

        setUploadingFiles(prev => [...prev, { 
            id: uploadId, 
            name: fileName, 
            progress: 0,
            size: file.size 
        }]);

        try {
            const onProgress = (progress) => {
                setUploadingFiles(prev =>
                    prev.map(f => f.id === uploadId ? { ...f, progress: progress.percentage } : f)
                );
            };

            const result = file.size > LARGE_FILE_THRESHOLD
                ? await uploadLargeFile(file, key, onProgress)
                : await uploadFile(file, key, onProgress);

            if (result.success) {
                // Optimistic update - add to list immediately
                const isNested = fileName.includes('/');
                const fileNameOnly = fileName.split('/').pop();
                
                // Check if file is in current folder view
                const fileFolder = fileName.includes('/') 
                    ? fileName.substring(0, fileName.lastIndexOf('/') + 1)
                    : '';
                const isInCurrentView = currentPath === fileFolder;

                if (isInCurrentView) {
                    const newItem = {
                        key,
                        name: fileNameOnly,
                        type: 'file',
                        size: file.size,
                        lastModified: new Date().toISOString()
                    };

                    setItems(prev => {
                        const existingIndex = prev.findIndex(item => item.key === key);
                        if (existingIndex !== -1) {
                            const newItems = [...prev];
                            newItems[existingIndex] = newItem;
                            return newItems;
                        }
                        return [...prev, newItem];
                    });
                }
                
                // Show toast only for completed files
                toast.success(`✓ ${fileNameOnly}`, { duration: 2000 });
            } else {
                toast.error(`Failed: ${fileName}`);
            }
        } catch (error) {
            toast.error(`Error: ${fileName}`);
        } finally {
            // Remove from uploading list after a short delay to show completion
            setTimeout(() => {
                setUploadingFiles(prev => prev.filter(f => f.id !== uploadId));
            }, 1000);
        }
    }, [currentPath, setItems]);

    // Process multiple uploads with concurrency control
    const processUploads = useCallback(async (files) => {
        if (files.length === 0) return;

        const MAX_CONCURRENT_UPLOADS = 3;
        const uploadQueue = [];

        for (const item of files) {
            const file = item.file || item;
            const relativePath = item.path || file.webkitRelativePath || file.name;
            const isNested = relativePath.includes('/');
            let fileExists = false;

            if (!isNested) {
                fileExists = items.some(existing =>
                    existing.type === 'file' && existing.name === relativePath
                );
            }

            if (fileExists) {
                const resolution = await new Promise((resolve) => {
                    setDuplicateFileInfo({ file, onResolve: resolve });
                });

                if (resolution.action === 'cancel') continue;

                let finalFileName = relativePath;
                if (resolution.action === 'keepBoth' || resolution.action === 'rename') {
                    finalFileName = resolution.newFileName;
                }

                uploadQueue.push({ file, fileName: finalFileName });
            } else {
                uploadQueue.push({ file, fileName: relativePath });
            }
        }

        // Check if uploading a folder (multiple files with paths)
        const isUploadingFolder = uploadQueue.some(({ fileName }) => fileName.includes('/'));
        
        // Process uploads in parallel batches
        for (let i = 0; i < uploadQueue.length; i += MAX_CONCURRENT_UPLOADS) {
            const batch = uploadQueue.slice(i, i + MAX_CONCURRENT_UPLOADS);
            await Promise.all(batch.map(({ file, fileName }) =>
                uploadSingleFile(file, fileName)
            ));
        }

        // Only refresh if not uploading to current folder (optimistic updates handle it)
        const needsRefresh = uploadQueue.some(({ fileName }) => {
            const fileFolder = fileName.includes('/') 
                ? fileName.substring(0, fileName.lastIndexOf('/') + 1)
                : '';
            return fileFolder !== currentPath;
        });

        if (needsRefresh) {
            await loadFiles(true);
        }
    }, [items, uploadSingleFile, loadFiles]);

    // Download single file
    const handleSingleDownload = useCallback(async (item) => {
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
                throw new Error(result.error);
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
    }, []);

    // Download multiple files
    const handleDownloadSelected = useCallback(async (selectedItems) => {
        const filesToDownload = selectedItems.filter(item => item.type === 'file');

        if (filesToDownload.length === 0) {
            toast.error('No files selected to download');
            return;
        }

        toast.success(`Starting download of ${filesToDownload.length} file(s)`);

        for (const item of filesToDownload) {
            await handleSingleDownload(item);
        }
    }, [handleSingleDownload]);

    // Rename file/folder
    const handleRename = useCallback(async (item, newName) => {
        try {
            const result = await renameObject(
                item.key,
                newName,
                item.type === 'folder'
            );

            if (result.success) {
                toast.success('Renamed successfully');
                loadFiles();
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            toast.error(`Failed to rename: ${error.message}`);
            throw error;
        }
    }, [loadFiles]);

    const handleRemoveDownload = useCallback((downloadId) => {
        setDownloads(prev => prev.filter(d => d.id !== downloadId));
    }, []);

    const handleClearDownloads = useCallback(() => {
        setDownloads(prev => prev.filter(d => d.status === 'downloading'));
    }, []);

    return {
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
    };
};
