/**
 * LoadingScreen Component
 * Premium loading state with smooth animations
 */

import { motion } from 'motion/react';
import { FlickeringGrid } from './flickering-grid';
import { AnimatedLogo } from './AnimatedLogo';

export const LoadingScreen = ({ message = 'Initializing...' }) => {
    return (
        <div className="fixed inset-0 min-h-screen w-full bg-background flex items-center justify-center overflow-hidden z-[9999]">
            {/* Background Grid */}
            <div className="absolute inset-0 z-0">
                <FlickeringGrid
                    squareSize={4}
                    gridGap={6}
                    color="#f97316" // Brand Orange
                    maxOpacity={0.15}
                    flickerChance={0.1}
                    className="w-full h-full"
                />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative z-10 flex flex-col items-center justify-center"
            >
                {/* Logo Container */}
                {/* Logo Container */}
                <div className="relative mb-8 w-48 h-auto">
                    <AnimatedLogo className="w-full h-full text-foreground" />
                </div>

                {/* Message */}
                <motion.div
                    key={message}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center gap-2"
                >
                    <p className="text-foreground text-sm font-medium tracking-widest uppercase opacity-90">
                        {message}
                    </p>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default LoadingScreen;
