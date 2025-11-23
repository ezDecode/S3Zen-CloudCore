/**
 * SkeletonLoader Component
 * Beautiful skeleton loading animations for file explorer
 */

import { motion } from 'framer-motion';

// Shimmer animation effect
export const SkeletonItem = ({ className = '', delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay }}
        className={`relative overflow-hidden bg-white/5 rounded-lg ${className}`}
    >
        {/* Shimmer Effect */}
        <motion.div
            className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
            animate={{
                translateX: ['100%', '100%', '-100%', '-100%']
            }}
            transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear',
                times: [0, 0.5, 0.5, 1]
            }}
        />
    </motion.div>
);

// Grid View Skeleton
export const SkeletonGridItem = ({ index = 0 }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.03 }}
        className="flex flex-col gap-3 p-4 bg-white/5 border border-white/10 rounded-xl"
    >
        {/* Icon placeholder */}
        <SkeletonItem className="w-12 h-12 rounded-lg mx-auto" />
        {/* Name placeholder */}
        <SkeletonItem className="h-3 w-3/4 mx-auto" />
        {/* Size placeholder */}
        <SkeletonItem className="h-2 w-1/2 mx-auto" />
    </motion.div>
);

// List View Skeleton
export const SkeletonListItem = ({ index = 0 }) => (
    <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.03 }}
        className="grid grid-cols-12 gap-4 px-4 py-3 bg-white/5 border border-white/10 rounded-lg items-center"
    >
        {/* Icon + Name */}
        <div className="col-span-6 flex items-center gap-3">
            <SkeletonItem className="w-10 h-10 rounded-lg shrink-0" />
            <SkeletonItem className="h-3 flex-1" />
        </div>
        {/* Size */}
        <div className="col-span-2">
            <SkeletonItem className="h-3 w-16" />
        </div>
        {/* Modified */}
        <div className="col-span-3">
            <SkeletonItem className="h-3 w-24" />
        </div>
        {/* Actions */}
        <div className="col-span-1 flex justify-end">
            <SkeletonItem className="h-8 w-8 rounded-lg" />
        </div>
    </motion.div>
);

// Main Skeleton Loader for File Explorer
export const FileListSkeleton = ({ viewMode = 'grid', count = 12 }) => {
    return (
        <div className="flex-1 overflow-y-auto px-6 py-6">
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3">
                    {Array.from({ length: count }).map((_, index) => (
                        <SkeletonGridItem key={index} index={index} />
                    ))}
                </div>
            ) : (
                <div className="space-y-2">
                    {/* List Header Skeleton */}
                    <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-white/5 mb-2">
                        <div className="col-span-6">
                            <SkeletonItem className="h-2 w-12" />
                        </div>
                        <div className="col-span-2">
                            <SkeletonItem className="h-2 w-8" />
                        </div>
                        <div className="col-span-3">
                            <SkeletonItem className="h-2 w-16" />
                        </div>
                        <div className="col-span-1" />
                    </div>

                    {/* List Items */}
                    {Array.from({ length: count }).map((_, index) => (
                        <SkeletonListItem key={index} index={index} />
                    ))}
                </div>
            )}
        </div>
    );
};
