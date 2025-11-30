/**
 * useBulkSelect Hook
 * Handles Shift+Click range selection for files
 */

import { useState, useCallback, useRef } from 'react';

export const useBulkSelect = (items, selectedItems, setSelectedItems) => {
    const lastSelectedIndex = useRef(-1);

    // Handle item click with shift key detection
    const handleBulkSelect = useCallback((item, event) => {
        const currentIndex = items.findIndex(i => i.key === item.key);
        
        if (event?.shiftKey && lastSelectedIndex.current !== -1 && currentIndex !== -1) {
            // Shift+Click: Select range
            const start = Math.min(lastSelectedIndex.current, currentIndex);
            const end = Math.max(lastSelectedIndex.current, currentIndex);
            
            const rangeItems = items.slice(start, end + 1);
            
            // Add range to selection (merge with existing)
            setSelectedItems(prev => {
                const existingKeys = new Set(prev.map(i => i.key));
                const newItems = rangeItems.filter(i => !existingKeys.has(i.key));
                return [...prev, ...newItems];
            });
        } else {
            // Normal click: Toggle single item
            setSelectedItems(prev => {
                const isSelected = prev.some(s => s.key === item.key);
                if (isSelected) {
                    return prev.filter(s => s.key !== item.key);
                }
                return [...prev, item];
            });
            lastSelectedIndex.current = currentIndex;
        }
    }, [items, setSelectedItems]);

    // Reset last selected index
    const resetSelection = useCallback(() => {
        lastSelectedIndex.current = -1;
    }, []);

    // Select range programmatically
    const selectRange = useCallback((startKey, endKey) => {
        const startIndex = items.findIndex(i => i.key === startKey);
        const endIndex = items.findIndex(i => i.key === endKey);
        
        if (startIndex === -1 || endIndex === -1) return;
        
        const start = Math.min(startIndex, endIndex);
        const end = Math.max(startIndex, endIndex);
        
        setSelectedItems(items.slice(start, end + 1));
    }, [items, setSelectedItems]);

    return {
        handleBulkSelect,
        resetSelection,
        selectRange,
        lastSelectedIndex: lastSelectedIndex.current
    };
};
