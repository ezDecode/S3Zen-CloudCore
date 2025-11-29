/**
 * useFileNavigation Hook
 * Handles navigation, selection, and sorting
 */

import { useState, useCallback, useMemo, useEffect } from 'react';

export const useFileNavigation = (items) => {
    const [currentPath, setCurrentPath] = useState('');
    const [selectedItems, setSelectedItems] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [viewMode, setViewMode] = useState(() => {
        const saved = localStorage.getItem('cloudcore_view_mode');
        return saved || 'grid';
    });

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 150);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Save view mode
    useEffect(() => {
        localStorage.setItem('cloudcore_view_mode', viewMode);
    }, [viewMode]);

    // Navigation
    const handleNavigate = useCallback((path) => {
        setCurrentPath(path);
        setSelectedItems([]);
    }, []);

    const handleOpenFolder = useCallback((folder) => {
        setCurrentPath(folder.key);
        setSelectedItems([]);
    }, []);

    // Selection
    const handleSelectItem = useCallback((item) => {
        setSelectedItems(prev => {
            const isSelected = prev.some(selected => selected.key === item.key);
            if (isSelected) {
                return prev.filter(selected => selected.key !== item.key);
            }
            return [...prev, item];
        });
    }, []);

    const handleSelectAll = useCallback(() => {
        if (selectedItems.length === items.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(items);
        }
    }, [selectedItems.length, items]);

    const clearSelection = useCallback(() => {
        setSelectedItems([]);
    }, []);

    // Filtering
    const filteredItems = useMemo(() => {
        if (!debouncedSearch) return items;
        const lowerSearch = debouncedSearch.toLowerCase();
        return items.filter(item => item.name.toLowerCase().includes(lowerSearch));
    }, [items, debouncedSearch]);

    // Sorting
    const handleSort = useCallback((field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    }, [sortBy, sortOrder]);

    const sortedItems = useMemo(() => [...filteredItems].sort((a, b) => {
        if (a.type !== b.type) {
            return a.type === 'folder' ? -1 : 1;
        }

        let comparison = 0;
        switch (sortBy) {
            case 'name':
                comparison = a.name.localeCompare(b.name);
                break;
            case 'size':
                comparison = (a.size || 0) - (b.size || 0);
                break;
            case 'date':
                comparison = new Date(a.lastModified || 0) - new Date(b.lastModified || 0);
                break;
            default:
                comparison = 0;
        }

        return sortOrder === 'asc' ? comparison : -comparison;
    }), [filteredItems, sortBy, sortOrder]);

    return {
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
    };
};
