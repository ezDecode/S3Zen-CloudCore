/**
 * useFavorites Hook
 * Manages favorite/pinned files with localStorage persistence
 */

import { useState, useCallback, useEffect } from 'react';

const FAVORITES_STORAGE_KEY = 'cloudcore_favorites';

export const useFavorites = () => {
    const [favorites, setFavorites] = useState(() => {
        try {
            const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    });

    // Persist to localStorage
    useEffect(() => {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    }, [favorites]);

    // Check if item is favorited
    const isFavorite = useCallback((key) => {
        return favorites.some(fav => fav.key === key);
    }, [favorites]);

    // Toggle favorite status
    const toggleFavorite = useCallback((item) => {
        setFavorites(prev => {
            const exists = prev.some(fav => fav.key === item.key);
            if (exists) {
                return prev.filter(fav => fav.key !== item.key);
            }
            return [...prev, {
                key: item.key,
                name: item.name,
                type: item.type,
                size: item.size,
                lastModified: item.lastModified,
                favoritedAt: new Date().toISOString()
            }];
        });
    }, []);

    // Add to favorites
    const addFavorite = useCallback((item) => {
        setFavorites(prev => {
            if (prev.some(fav => fav.key === item.key)) return prev;
            return [...prev, {
                key: item.key,
                name: item.name,
                type: item.type,
                size: item.size,
                lastModified: item.lastModified,
                favoritedAt: new Date().toISOString()
            }];
        });
    }, []);

    // Remove from favorites
    const removeFavorite = useCallback((key) => {
        setFavorites(prev => prev.filter(fav => fav.key !== key));
    }, []);

    // Remove multiple items from favorites (used when files/folders are deleted)
    const removeMultipleFromFavorites = useCallback((keys) => {
        if (!keys || keys.length === 0) return;
        const keySet = new Set(keys);
        setFavorites(prev => prev.filter(fav => !keySet.has(fav.key)));
    }, []);

    // Clear all favorites
    const clearFavorites = useCallback(() => {
        setFavorites([]);
    }, []);

    // Get sorted favorites (most recent first)
    const getSortedFavorites = useCallback(() => {
        return [...favorites].sort((a, b) => 
            new Date(b.favoritedAt) - new Date(a.favoritedAt)
        );
    }, [favorites]);

    return {
        favorites,
        isFavorite,
        toggleFavorite,
        addFavorite,
        removeFavorite,
        removeMultipleFromFavorites,
        clearFavorites,
        getSortedFavorites,
        favoritesCount: favorites.length
    };
};
