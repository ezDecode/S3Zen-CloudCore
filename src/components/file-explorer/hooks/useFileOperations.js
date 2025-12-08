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
    renameObject,
    listObjects
} from '../../../services/aws/s3Service';
import { buildS3Key } from '../../../utils/validationUtils';

const LARGE_FILE_THRESHOLD = 100 * 1024 * 1024; // 100MB

export const useFileOperations = (currentPath, items, setItems, loadFiles, onNavigateToFolder, onRefreshStats) => {
    const [uploadingFiles, setUploadingFiles] = useState([]);
    const [downloads, setDownloads] = useState([]);
    const [duplicateFileInfo, setDuplicateFileInfo] = useState(null);

    // Upload single file
    const uploadSingleFile = useCallback(async (file, fileName, originalCurrentPath) => {
        // Check if S3 client is initialized
        const { isS3ClientInitialized } = await import('../../../services/aws/s3Service');
        if (!isS3ClientInitialized()) {
            toast.error('S3 client not initialized. Please select a bucket.');
            return;
        }

        // Use the original path when upload started, not the current path
        const uploadBasePath = originalCurrentPath !== undefined ? originalCurrentPath : currentPath;
        const key = buildS3Key(uploadBasePath, fileName);
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
                // Extract file info
                const fileNameOnly = fileName.split('/').pop();
                
                // Determine which folder this file belongs to
                const fileFolder = fileName.includes('/') 
                    ? uploadBasePath + fileName.substring(0, fileName.lastIndexOf('/') + 1)
                    : uploadBasePath;

                // Check if file should appear in CURRENT view (after navigation)
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
                        // Check if already exists
                        const existingIndex = prev.findIndex(item => item.key === key);
                        if (existingIndex !== -1) {
                            const newItems = [...prev];
                            newItems[existingIndex] = newItem;
                            return newItems;
                        }
                        // Add new item
                        return [...prev, newItem];
                    });
                }
                
                // Show toast for completed files
                toast.success(`✓ ${fileNameOnly}`, { duration: 2000 });
            } else {
                toast.error(`Failed: ${fileName}`);
            }
        } catch (error) {
            toast.error(`Error: ${fileName}`);
        } finally {
            // Remove from uploading list after showing completion
            setTimeout(() => {
                setUploadingFiles(prev => prev.filter(f => f.id !== uploadId));
            }, 1000);
        }
    }, [currentPath, setItems]);

    // Process multiple uploads with concurrency control
    const processUploads = useCallback(async (files) => {
        if (files.length === 0) return;

        // Check if S3 client is initialized
        const { isS3ClientInitialized } = await import('../../../services/aws/s3Service');
        if (!isS3ClientInitialized()) {
            toast.error('Please select a bucket first');
            return;
        }

        // OPTIMIZED: Increased from 3 to 6 for better throughput
        // Modern browsers support 6-8 concurrent connections per domain
        const MAX_CONCURRENT_UPLOADS = 6;
        const uploadQueue = [];

        for (const item of files) {
            const file = item.file || item;
            const relativePath = item.path || file.webkitRelativePath || file.name;
            const isNested = relativePath.includes('/');
            let fileExists = false;

            // FIXED: Check for duplicates by building the full S3 key
            // This ensures we check against the actual S3 path, not just current view
            const fullKey = buildS3Key(currentPath, relativePath);
            
            if (!isNested) {
                // Check in current view items first (fast)
                fileExists = items.some(existing =>
                    existing.type === 'file' && existing.key === fullKey
                );
                
                // If not found in current view, check S3 directly (slower but accurate)
                if (!fileExists) {
                    try {
                        const result = await listObjects(currentPath);
                        if (result.success) {
                            fileExists = result.items.some(existing =>
                                existing.type === 'file' && existing.key === fullKey
                            );
                        }
                    } catch (error) {
                        console.warn('Failed to check for duplicates:', error);
                        // Continue with upload if check fails
                    }
                }
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
        
        // Store the original path before navigation
        const originalPath = currentPath;
        let targetFolderPath = null;
        
        // If uploading a folder, navigate into the first folder
        if (isUploadingFolder && onNavigateToFolder) {
            // Get the root folder name from the first file
            const firstFile = uploadQueue[0].fileName;
            const rootFolderName = firstFile.split('/')[0];
            targetFolderPath = currentPath + rootFolderName + '/';
            
            // Navigate to the folder
            onNavigateToFolder(targetFolderPath);
            
            // Wait a bit for navigation to complete
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Process uploads in parallel batches
        // Pass originalPath so files are uploaded to correct location
        for (let i = 0; i < uploadQueue.length; i += MAX_CONCURRENT_UPLOADS) {
            const batch = uploadQueue.slice(i, i + MAX_CONCURRENT_UPLOADS);
            await Promise.all(batch.map(({ file, fileName }) =>
                uploadSingleFile(file, fileName, originalPath)
            ));
        }

        // Wait a moment for S3 to be consistent
        await new Promise(resolve => setTimeout(resolve, 300));

        // Refresh file list - use targetFolderPath for folder uploads, current path otherwise
        if (isUploadingFolder && targetFolderPath) {
            // Load files for the navigated folder path
            await loadFiles(true, targetFolderPath);
        } else {
            // For regular uploads, refresh current view
            await loadFiles(true);
        }

        // Refresh storage stats after uploads complete
        if (onRefreshStats) {
            onRefreshStats();
        }
    }, [items, currentPath, uploadSingleFile, loadFiles, onNavigateToFolder, onRefreshStats]);

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
