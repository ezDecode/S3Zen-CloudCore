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

export const BucketSwitcher = ({ currentBucket, onBucketChange, onOpenManager }) => {
    const [buckets, setBuckets] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        loadBuckets();
    }, []);

    const loadBuckets = async () => {
        setIsLoading(true);
        try {
            const response = await bucketManagerService.getBuckets();
            setBuckets(response.data || []);
        } catch (error) {
            console.error('Failed to load buckets:', error);
            toast.error('Failed to load buckets');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectBucket = async (bucket) => {
        try {
            // Update default bucket
            await bucketManagerService.updateBucket(bucket.id, { isDefault: true });
            onBucketChange(bucket);
            toast.success(`Switched to ${bucket.name}`);
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
                            {currentBucket?.name || 'Select Bucket'}
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
                                        <div className="text-sm font-medium truncate">{bucket.name}</div>
                                        <div className="text-xs text-zinc-500">{bucket.bucketName}</div>
                                    </div>
                                    {bucket.isDefault && (
                                        <Tick01Icon className="w-4 h-4 text-emerald-500 flex-shrink-0" />
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
