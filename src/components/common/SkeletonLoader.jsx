/**
 * SkeletonLoader Component
 * Premium, polished skeleton loading animations that perfectly match the file explorer design.
 */

import { motion } from 'framer-motion';

// Refined Shimmer Effect
const Shimmer = () => (
    <motion.div
        className="absolute inset-0 -translate-x-full"
        style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.08) 50%, transparent 100%)'
        }}
        animate={{
            translateX: ['100%', '-100%']
        }}
        transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
        }}
    />
);

// Base Skeleton Item Wrapper
const SkeletonBase = ({ className = '', children }) => (
    <div className={`relative overflow-hidden bg-white/5 ${className}`}>
        {children}
        <Shimmer />
    </div>
);

// Grid View Skeleton Card
export const SkeletonGridItem = ({ index = 0 }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.05, duration: 0.3 }}
        className="relative rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden aspect-[4/5] flex flex-col items-center justify-center p-4 gap-4"
    >
        {/* Icon Placeholder */}
        <SkeletonBase className="w-16 h-16 rounded-xl" />

        {/* Text Content */}
        <div className="w-full flex flex-col items-center gap-2">
            <SkeletonBase className="h-4 w-3/4 rounded-md" />
            <SkeletonBase className="h-3 w-1/3 rounded-md opacity-60" />
        </div>

        {/* Shimmer Overlay for the whole card */}
        <Shimmer />
    </motion.div>
);

// List View Skeleton Row
export const SkeletonListItem = ({ index = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.03, duration: 0.3 }}
        className="grid grid-cols-12 gap-4 px-4 py-3 rounded-lg border border-white/5 bg-white/[0.02] items-center"
    >
        {/* Name Column (Checkbox + Icon + Name) */}
        <div className="col-span-6 flex items-center gap-3">
            <SkeletonBase className="w-4 h-4 rounded" /> {/* Checkbox */}
            <SkeletonBase className="w-8 h-8 rounded-lg" /> {/* Icon */}
            <SkeletonBase className="h-4 w-48 rounded-md" /> {/* Name */}
        </div>

        {/* Size Column */}
        <div className="col-span-2">
            <SkeletonBase className="h-3 w-16 rounded-md opacity-60" />
        </div>

        {/* Date Column */}
        <div className="col-span-3">
            <SkeletonBase className="h-3 w-24 rounded-md opacity-60" />
        </div>

        {/* Actions Column */}
        <div className="col-span-1 flex justify-end">
            <SkeletonBase className="h-8 w-8 rounded-lg opacity-40" />
        </div>
    </motion.div>
);

// Main Skeleton Loader Component
export const FileListSkeleton = ({ viewMode = 'grid', count = 12 }) => {
    return (
        <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
                    {Array.from({ length: count }).map((_, index) => (
                        <SkeletonGridItem key={index} index={index} />
                    ))}
                </div>
            ) : (
                <div className="space-y-2">
                    {/* List Header Skeleton */}
                    <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-white/10 mb-2 opacity-50">
                        <div className="col-span-6">
                            <SkeletonBase className="h-3 w-20 rounded" />
                        </div>
                        <div className="col-span-2">
                            <SkeletonBase className="h-3 w-12 rounded" />
                        </div>
                        <div className="col-span-3">
                            <SkeletonBase className="h-3 w-24 rounded" />
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
