/**
 * BucketSwitcher Component
 * Dropdown showing all user buckets with switch functionality
 * Shows default bucket indicator
 */

import { useState, useEffect } from 'react';
import { ArrowDown01Icon, Tick01Icon, Database02Icon, AlertCircleIcon } from 'hugeicons-react';
import { toast } from 'sonner';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../../ui/dropdown-menu';
import bucketManagerService from '../../../services/bucketManagerService';

export const BucketSwitcher = ({ currentBucket, onBucketChange, onOpenManager, isAuthenticated }) => {
    const [buckets, setBuckets] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

    useEffect(() => {
        // Add delay to ensure session is fully restored before loading buckets
        if (isAuthenticated && !hasLoadedOnce) {
            console.log('[BucketSwitcher] Auth detected, scheduling bucket load');
            
            // Wait longer for session to be fully available and validated
            const timer = setTimeout(() => {
                loadBuckets();
            }, 800); // Increased delay to ensure session is fully ready
            
            return () => clearTimeout(timer);
        }
    }, [isAuthenticated, hasLoadedOnce]);

    const loadBuckets = async () => {
        if (!isAuthenticated) {
            console.log('[BucketSwitcher] Not authenticated, skipping bucket load');
            return;
        }
        
        console.log('[BucketSwitcher] Loading buckets...');
        setIsLoading(true);
        
        try {
            const response = await bucketManagerService.getBuckets();
            console.log('[BucketSwitcher] Buckets loaded:', response.buckets?.length || 0);
            setBuckets(response.buckets || []);
            setHasLoadedOnce(true);
            
            // Auto-select default bucket if none selected
            if (!currentBucket && response.buckets?.length > 0) {
                const defaultBucket = response.buckets.find(b => b.isDefault) || response.buckets[0];
                onBucketChange(defaultBucket);
            }
        } catch (error) {
            console.error('[BucketSwitcher] Failed to load buckets:', error);
            
            // Only show error toast for non-auth errors
            if (error.code !== 'NO_AUTH_TOKEN' && error.code !== 'UNAUTHORIZED') {
                toast.error('Failed to load buckets');
            } else {
                console.warn('[BucketSwitcher] Auth error, user may need to sign in again');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectBucket = async (bucket) => {
        try {
            // Update default bucket
            await bucketManagerService.updateBucket(bucket.id, { isDefault: true });
            onBucketChange(bucket);
            toast.success(`Switched to ${bucket.displayName}`);
        } catch (error) {
            console.error('Failed to switch bucket:', error);
            toast.error('Failed to switch bucket');
        }
    };

    return (
        <div className="flex items-center gap-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-zinc-800 transition-colors border border-zinc-800">
                        <Database02Icon className="w-4 h-4" />
                        <span className="text-sm font-medium truncate max-w-[150px]">
                            {currentBucket?.displayName || 'Select Bucket'}
                        </span>
                        <ArrowDown01Icon className="w-4 h-4 opacity-50" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 bg-zinc-900 border-zinc-800">
                    <DropdownMenuLabel className="text-zinc-400">
                        {isLoading ? 'Loading buckets...' : `${buckets.length} buckets`}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-zinc-800" />

                    {buckets.length > 0 ? (
                        buckets.map((bucket) => (
                            <DropdownMenuItem
                                key={bucket.id}
                                className="cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800"
                                onSelect={() => handleSelectBucket(bucket)}
                            >
                                <div className="flex items-center gap-2 w-full">
                                    <Database02Icon className="w-4 h-4" />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium truncate">{bucket.displayName}</div>
                                        <div className="text-xs text-zinc-500">{bucket.bucketName}</div>
                                    </div>
                                    {bucket.isDefault && (
                                        <Tick01Icon className="w-4 h-4 text-emerald-500 shrink-0" />
                                    )}
                                </div>
                            </DropdownMenuItem>
                        ))
                    ) : (
                        <div className="px-3 py-2 text-sm text-zinc-500 flex items-center gap-2">
                            <AlertCircleIcon className="w-4 h-4" />
                            No buckets configured
                        </div>
                    )}

                    <DropdownMenuSeparator className="bg-zinc-800" />
                    <DropdownMenuItem
                        className="cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800 text-emerald-400"
                        onSelect={onOpenManager}
                    >
                        + Add or Manage Buckets
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};

export default BucketSwitcher;
