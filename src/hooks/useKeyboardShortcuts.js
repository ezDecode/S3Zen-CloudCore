/**
 * useKeyboardShortcuts Hook
 * Handles keyboard shortcuts for power user productivity
 * 
 * Shortcuts:
 * - Ctrl+U: Upload file
 * - Delete/Backspace: Delete selected
 * - Ctrl+A: Select all
 * - Escape: Clear selection
 * - Ctrl+N: New folder
 * - Ctrl+D: Download selected
 * - Ctrl+F: Focus search
 * - F2: Rename selected
 * - Enter: Open/Preview selected
 * - Ctrl+Shift+A: Deselect all
 */

import { useEffect, useCallback, useRef } from 'react';

export const useKeyboardShortcuts = ({
    onUpload,
    onDelete,
    onSelectAll,
    onClearSelection,
    onNewFolder,
    onDownload,
    onFocusSearch,
    onRename,
    onOpen,
    onPreview,
    selectedItems = [],
    isEnabled = true
}) => {
    const fileInputRef = useRef(null);

    const handleKeyDown = useCallback((e) => {
        // Skip if disabled or typing in input/textarea
        if (!isEnabled) return;
        const target = e.target;
        const isTyping = target.tagName === 'INPUT' || 
                        target.tagName === 'TEXTAREA' || 
                        target.isContentEditable;

        // Allow Escape even when typing
        if (e.key === 'Escape') {
            e.preventDefault();
            if (isTyping) {
                target.blur();
            }
            onClearSelection?.();
            return;
        }

        // Skip other shortcuts when typing
        if (isTyping) return;

        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        const ctrlKey = isMac ? e.metaKey : e.ctrlKey;

        // Ctrl+U: Upload
        if (ctrlKey && e.key === 'u') {
            e.preventDefault();
            fileInputRef.current?.click();
            onUpload?.();
            return;
        }

        // Delete/Backspace: Delete selected
        if ((e.key === 'Delete' || e.key === 'Backspace') && selectedItems.length > 0) {
            e.preventDefault();
            onDelete?.(selectedItems);
            return;
        }

        // Ctrl+A: Select all
        if (ctrlKey && e.key === 'a') {
            e.preventDefault();
            onSelectAll?.();
            return;
        }

        // Ctrl+Shift+A: Deselect all
        if (ctrlKey && e.shiftKey && e.key === 'A') {
            e.preventDefault();
            onClearSelection?.();
            return;
        }

        // Ctrl+N: New folder
        if (ctrlKey && e.key === 'n') {
            e.preventDefault();
            onNewFolder?.();
            return;
        }

        // Ctrl+D: Download selected
        if (ctrlKey && e.key === 'd' && selectedItems.length > 0) {
            e.preventDefault();
            onDownload?.(selectedItems);
            return;
        }

        // Ctrl+F: Focus search
        if (ctrlKey && e.key === 'f') {
            e.preventDefault();
            onFocusSearch?.();
            return;
        }

        // F2: Rename (single selection only)
        if (e.key === 'F2' && selectedItems.length === 1) {
            e.preventDefault();
            onRename?.(selectedItems[0]);
            return;
        }

        // Enter: Open folder or preview file
        if (e.key === 'Enter' && selectedItems.length === 1) {
            e.preventDefault();
            const item = selectedItems[0];
            if (item.type === 'folder') {
                onOpen?.(item);
            } else {
                onPreview?.(item);
            }
            return;
        }
    }, [
        isEnabled,
        onUpload,
        onDelete,
        onSelectAll,
        onClearSelection,
        onNewFolder,
        onDownload,
        onFocusSearch,
        onRename,
        onOpen,
        onPreview,
        selectedItems
    ]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    return {
        fileInputRef
    };
};

// Shortcut definitions for help display
export const KEYBOARD_SHORTCUTS = [
    { keys: ['Ctrl', 'U'], action: 'Upload files', mac: ['⌘', 'U'] },
    { keys: ['Delete'], action: 'Delete selected', mac: ['⌫'] },
    { keys: ['Ctrl', 'A'], action: 'Select all', mac: ['⌘', 'A'] },
    { keys: ['Escape'], action: 'Clear selection', mac: ['Esc'] },
    { keys: ['Ctrl', 'N'], action: 'New folder', mac: ['⌘', 'N'] },
    { keys: ['Ctrl', 'D'], action: 'Download selected', mac: ['⌘', 'D'] },
    { keys: ['Ctrl', 'F'], action: 'Search', mac: ['⌘', 'F'] },
    { keys: ['F2'], action: 'Rename', mac: ['F2'] },
    { keys: ['Enter'], action: 'Open/Preview', mac: ['Enter'] },
    { keys: ['Shift', 'Click'], action: 'Select range', mac: ['Shift', 'Click'] }
];
