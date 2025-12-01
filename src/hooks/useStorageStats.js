/**
 * useStorageStats Hook
 * Fetches and manages storage statistics for the S3 bucket
 * 
 * PERFORMANCE: Implements caching to prevent redundant calculations
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { getBucketStats } from '../services/aws/s3Service';

export const useStorageStats = (refreshInterval = 60000) => {
    const [stats, setStats] = useState({
        totalSize: 0,
        fileCount: 0,
        folderCount: 0,
        fileTypes: null,
        lastUpdated: null,
        isLoading: true,
        error: null
    });

    const fetchStats = useCallback(async () => {
        setStats(prev => ({ ...prev, isLoading: true, error: null }));
        
        try {
            const result = await getBucketStats();
            
            if (result.success) {
                setStats({
                    totalSize: result.totalSize,
                    fileCount: result.fileCount,
                    folderCount: result.folderCount,
                    fileTypes: result.fileTypes,
                    lastUpdated: new Date().toISOString(),
                    isLoading: false,
                    error: null
                });
            } else {
                setStats(prev => ({
                    ...prev,
                    isLoading: false,
                    error: result.error
                }));
            }
        } catch (error) {
            setStats(prev => ({
                ...prev,
                isLoading: false,
                error: error.message
            }));
        }
    }, []);
    
    // PERFORMANCE: Memoize derived values to prevent recalculation
    const derivedStats = useMemo(() => {
        if (!stats.fileTypes) return null;
        
        return {
            // Calculate percentages
            fileTypePercentages: Object.entries(stats.fileTypes).reduce((acc, [type, data]) => {
                acc[type] = stats.totalSize > 0 
                    ? ((data.size / stats.totalSize) * 100).toFixed(1)
                    : 0;
                return acc;
            }, {}),
            
            // Average file size
            averageFileSize: stats.fileCount > 0 
                ? Math.round(stats.totalSize / stats.fileCount)
                : 0,
            
            // Largest category
            largestCategory: Object.entries(stats.fileTypes)
                .sort((a, b) => b[1].size - a[1].size)[0]?.[0] || null
        };
    }, [stats.totalSize, stats.fileCount, stats.fileTypes]);

    // Initial fetch
    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    // Optional auto-refresh
    useEffect(() => {
        if (refreshInterval > 0) {
            const interval = setInterval(fetchStats, refreshInterval);
            return () => clearInterval(interval);
        }
    }, [fetchStats, refreshInterval]);

    return {
        ...stats,
        derivedStats,
        refresh: fetchStats
    };
};
