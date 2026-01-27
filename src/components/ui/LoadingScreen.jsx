/**
 * LoadingScreen Component
 * Unified loading state display for consistent UX
 */

import { Cloud } from 'lucide-react';

export const LoadingScreen = ({ message = 'loading...' }) => {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
            {/* Subtle background pattern */}
            <div
                className="absolute inset-0 opacity-30"
                style={{
                    backgroundImage: 'none',
                    backgroundSize: '24px 24px',
                }}
            />

            <div className="text-center z-10">
                {/* Animated logo */}
                <div className="relative mx-auto mb-6 w-16 h-16">
                    <div className="absolute inset-0 rounded-2xl bg-brand/10 animate-pulse" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Cloud className="w-8 h-8 text-brand animate-float-subtle" />
                    </div>
                </div>

                {/* Spinner */}
                <div className="w-8 h-8 border-2 border-edge border-t-brand rounded-full animate-spin mx-auto mb-4" />

                {/* Message */}
                <p className="text-muted-foreground text-sm font-medium animate-pulse">
                    {message}
                </p>
            </div>
        </div>
    );
};

export default LoadingScreen;
