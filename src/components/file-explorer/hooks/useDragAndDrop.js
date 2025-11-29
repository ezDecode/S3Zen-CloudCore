/**
 * useDragAndDrop Hook
 * Handles drag and drop file uploads
 */

import { useState, useCallback } from 'react';

export const useDragAndDrop = (processUploads) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isDragging) setIsDragging(true);
    }, [isDragging]);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.currentTarget.contains(e.relatedTarget)) return;
        setIsDragging(false);
    }, []);

    const getFilesFromDataTransferItems = useCallback(async (items) => {
        const files = [];
        const queue = [];

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.kind === 'file') {
                const entry = item.webkitGetAsEntry?.() || item.getAsEntry?.();
                if (entry) queue.push(entry);
            }
        }

        while (queue.length > 0) {
            const entry = queue.shift();
            if (entry.isFile) {
                try {
                    const file = await new Promise((resolve, reject) => {
                        entry.file(resolve, reject);
                    });
                    const path = entry.fullPath.startsWith('/') 
                        ? entry.fullPath.slice(1) 
                        : entry.fullPath;
                    files.push({ file, path });
                } catch (err) {
                    console.error('Error reading file entry:', err);
                }
            } else if (entry.isDirectory) {
                try {
                    const reader = entry.createReader();
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
    }, []);

    const handleDrop = useCallback(async (e) => {
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
    }, [getFilesFromDataTransferItems, processUploads]);

    return {
        isDragging,
        handleDragOver,
        handleDragLeave,
        handleDrop
    };
};
