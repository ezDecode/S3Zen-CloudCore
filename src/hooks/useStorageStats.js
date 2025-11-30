/**
 * useStorageStats Hook
 * Fetches and manages storage statistics for the S3 bucket
 */

import { useState, useCallback, useEffect } from 'react';
import { getBucketStats } from '../services/aws/s3Service';

export const useStorageStats = (refreshInterval = 60000) => {
    const [stats, setStats] = useState({
        totalSize: 0,
        fileCount: 0,
        folderCount: 0,
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
        refresh: fetchStats
    };
};
