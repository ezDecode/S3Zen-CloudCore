import { useState, useEffect } from 'react';
import { ArrowRight01Icon } from 'hugeicons-react';

/**
 * STICKY HEADER - Always visible navigation
 * 
 * Features:
 * - Always stays at top
 * - Blur backdrop on scroll
 * - Minimal, clean design
 * - Always accessible CTA
 */

export const StickyHeader = ({ onGetStarted }) => {
    const [hasScrolled, setHasScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setHasScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
                hasScrolled 
                    ? 'bg-black/80 backdrop-blur-xl border-b border-white/[0.08]' 
                    : 'bg-transparent'
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-normal text-white tracking-tight">
                            CloudCore
                        </span>
                        <span className="text-xs text-white/40 font-normal">v2.0</span>
                    </div>

                    {/* CTA Button */}
                    <button
                        onClick={onGetStarted}
                        className="group flex items-center gap-2 px-4 py-2 bg-white text-black text-sm font-normal rounded-lg hover:bg-white/90 transition-colors duration-150"
                    >
                        <span>Get Started</span>
                        <ArrowRight01Icon className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </button>
                </div>
            </div>
        </header>
    );
};
