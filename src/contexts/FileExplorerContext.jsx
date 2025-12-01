/**
 * FileExplorerContext
 * Centralized state management for file explorer
 * Eliminates prop drilling by providing shared state via Context API
 */

import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { listObjects } from '../services/aws/s3Service';

const FileExplorerContext = createContext(null);

export const useFileExplorerContext = () => {
    const context = useContext(FileExplorerContext);
    if (!context) {
        throw new Error('useFileExplorerContext must be used within FileExplorerProvider');
    }
    return context;
};

export const FileExplorerProvider = ({ children }) => {
    // Core state
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPath, setCurrentPath] = useState('');
    const [selectedItems, setSelectedItems] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [viewMode, setViewMode] = useState('grid');

    // Refs for request cancellation
    const loadFilesRef = useRef(null);
    const currentPathRef = useRef(currentPath);

    // Keep ref in sync with state
    useEffect(() => {
        currentPathRef.current = currentPath;
    }, [currentPath]);

    // Load files function
    const loadFiles = useCallback(async (skipLoading = false, pathOverride = null) => {
        const pathToLoad = pathOverride !== null ? pathOverride : currentPathRef.current;
        
        if (loadFilesRef.current) {
            loadFilesRef.current.cancelled = true;
        }

        const currentRequest = { cancelled: false };
        loadFilesRef.current = currentRequest;

        if (!skipLoading) setIsLoading(true);

        try {
            const result = await listObjects(pathToLoad);

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
    }, []);

    // Navigation
    const handleNavigate = useCallback((path) => {
        setCurrentPath(path);
        setSelectedItems([]);
        setSearchQuery('');
    }, []);

    // Selection
    const handleSelectItem = useCallback((item, isMultiSelect = false) => {
        setSelectedItems(prev => {
            const isSelected = prev.some(i => i.key === item.key);
            
            if (isMultiSelect) {
                return isSelected 
                    ? prev.filter(i => i.key !== item.key)
                    : [...prev, item];
            }
            
            return isSelected ? [] : [item];
        });
    }, []);

    const clearSelection = useCallback(() => {
        setSelectedItems([]);
    }, []);

    const handleSelectAll = useCallback(() => {
        setSelectedItems(items.length === selectedItems.length ? [] : [...items]);
    }, [items, selectedItems]);

    // Sorting
    const handleSort = useCallback((newSortBy) => {
        if (sortBy === newSortBy) {
            setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(newSortBy);
            setSortOrder('asc');
        }
    }, [sortBy]);

    const value = {
        // State
        items,
        setItems,
        isLoading,
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
        
        // Actions
        loadFiles,
        handleNavigate,
        handleSelectItem,
        clearSelection,
        handleSelectAll,
        handleSort,
    };

    return (
        <FileExplorerContext.Provider value={value}>
            {children}
        </FileExplorerContext.Provider>
    );
};
