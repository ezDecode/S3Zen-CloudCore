/**
 * usePreview Hook
 * Manages preview modal state and file navigation
 */

import { useState, useCallback, useEffect } from 'react';

export const usePreview = (items = []) => {
    const [previewItem, setPreviewItem] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(-1);

    // Get previewable items only
    const previewableItems = items.filter(item => item.type === 'file');

    // Open preview
    const openPreview = useCallback((item) => {
        const index = previewableItems.findIndex(i => i.key === item.key);
        setCurrentIndex(index);
        setPreviewItem(item);
    }, [previewableItems]);

    // Close preview
    const closePreview = useCallback(() => {
        setPreviewItem(null);
        setCurrentIndex(-1);
    }, []);

    // Navigate to next file
    const nextFile = useCallback(() => {
        if (currentIndex < previewableItems.length - 1) {
            const nextIndex = currentIndex + 1;
            setCurrentIndex(nextIndex);
            setPreviewItem(previewableItems[nextIndex]);
        }
    }, [currentIndex, previewableItems]);

    // Navigate to previous file
    const previousFile = useCallback(() => {
        if (currentIndex > 0) {
            const prevIndex = currentIndex - 1;
            setCurrentIndex(prevIndex);
            setPreviewItem(previewableItems[prevIndex]);
        }
    }, [currentIndex, previewableItems]);

    // Keyboard navigation
    useEffect(() => {
        if (!previewItem) return;

        const handleKeyDown = (e) => {
            switch (e.key) {
                case 'Escape':
                    closePreview();
                    break;
                case 'ArrowLeft':
                    previousFile();
                    break;
                case 'ArrowRight':
                    nextFile();
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [previewItem, closePreview, previousFile, nextFile]);

    return {
        previewItem,
        currentIndex,
        totalFiles: previewableItems.length,
        hasNext: currentIndex < previewableItems.length - 1,
        hasPrevious: currentIndex > 0,
        openPreview,
        closePreview,
        nextFile,
        previousFile
    };
};
