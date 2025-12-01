/**
 * SKELETON LOADER - Linear-inspired loading states
 * 
 * Features:
 * - Smooth shimmer animation
 * - Multiple variants (text, card, circle)
 * - Consistent with design system
 */

export const SkeletonLoader = ({ 
    variant = 'text', 
    width = '100%', 
    height = '1rem',
    className = '' 
}) => {
    const baseClasses = 'animate-pulse bg-white/[0.05] rounded-lg';
    
    const variants = {
        text: 'h-4',
        card: 'h-32',
        circle: 'rounded-full aspect-square',
        button: 'h-10',
        avatar: 'w-10 h-10 rounded-full'
    };

    return (
        <div 
            className={`${baseClasses} ${variants[variant]} ${className}`}
            style={{ width, height: variant === 'text' ? height : undefined }}
        >
            <div className="w-full h-full bg-gradient-to-r from-transparent via-white/[0.03] to-transparent animate-shimmer" />
        </div>
    );
};

// Skeleton variants for common use cases
export const SkeletonText = ({ lines = 3, className = '' }) => (
    <div className={`space-y-3 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
            <SkeletonLoader 
                key={i} 
                variant="text" 
                width={i === lines - 1 ? '60%' : '100%'} 
            />
        ))}
    </div>
);

export const SkeletonCard = ({ className = '' }) => (
    <div className={`p-6 bg-white/[0.02] border border-white/[0.06] rounded-2xl ${className}`}>
        <div className="flex items-start gap-4">
            <SkeletonLoader variant="circle" width="48px" />
            <div className="flex-1 space-y-3">
                <SkeletonLoader variant="text" width="40%" />
                <SkeletonLoader variant="text" width="100%" />
                <SkeletonLoader variant="text" width="80%" />
            </div>
        </div>
    </div>
);

export const SkeletonButton = ({ className = '' }) => (
    <SkeletonLoader variant="button" width="120px" className={className} />
);
