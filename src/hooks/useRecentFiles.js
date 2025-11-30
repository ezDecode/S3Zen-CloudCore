/**
 * useRecentFiles Hook
 * Tracks recently accessed files with localStorage persistence
 */

import { useState, useCallback, useEffect } from 'react';

const RECENT_FILES_STORAGE_KEY = 'cloudcore_recent_files';
const MAX_RECENT_FILES = 10;

export const useRecentFiles = () => {
    const [recentFiles, setRecentFiles] = useState(() => {
        try {
            const stored = localStorage.getItem(RECENT_FILES_STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    });

    // Persist to localStorage
    useEffect(() => {
        localStorage.setItem(RECENT_FILES_STORAGE_KEY, JSON.stringify(recentFiles));
    }, [recentFiles]);

    // Add file to recent list (moves to top if exists)
    const addRecentFile = useCallback((item) => {
        if (!item || item.type === 'folder') return;
        
        setRecentFiles(prev => {
            // Remove if exists
            const filtered = prev.filter(f => f.key !== item.key);
            
            // Add to beginning
            const updated = [{
                key: item.key,
                name: item.name,
                type: item.type,
                size: item.size,
                lastModified: item.lastModified,
                accessedAt: new Date().toISOString()
            }, ...filtered];
            
            // Keep only MAX_RECENT_FILES
            return updated.slice(0, MAX_RECENT_FILES);
        });
    }, []);

    // Remove from recent files
    const removeRecentFile = useCallback((key) => {
        setRecentFiles(prev => prev.filter(f => f.key !== key));
    }, []);

    // Clear all recent files
    const clearRecentFiles = useCallback(() => {
        setRecentFiles([]);
    }, []);

    // Check if file is in recent list
    const isRecent = useCallback((key) => {
        return recentFiles.some(f => f.key === key);
    }, [recentFiles]);

    return {
        recentFiles,
        addRecentFile,
        removeRecentFile,
        clearRecentFiles,
        isRecent,
        recentCount: recentFiles.length
    };
};
