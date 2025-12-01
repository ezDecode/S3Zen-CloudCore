import { Hero } from './Hero';
import { FeaturesSection } from './sections/FeaturesSection';
import { HowItWorksSection } from './sections/HowItWorksSection';
import { SocialProofSection } from './sections/SocialProofSection';
import { FAQSection } from './sections/FAQSection';
import { CTASection } from './sections/CTASection';
import { StickyHeader } from '../common/StickyHeader';

/**
 * LANDING PAGE - Complete User Journey
 * 
 * PURPOSE: Guide visitor from awareness → understanding → conversion
 * 
 * OPTIMIZED STRUCTURE (Linear-inspired):
 * 0. Sticky Header: Always accessible navigation
 * 1. Hero: Grab attention, communicate value (5 seconds)
 * 2. Social Proof: Build trust with metrics
 * 3. Features: Build credibility, prove capability (scan)
 * 4. How It Works: Show simplicity, remove barriers (3 easy steps)
 * 5. Setup Guide: Detailed AWS configuration for those ready to dive in
 * 6. CTA: Final push, convert (act)
 * 7. Footer: Brand touchpoint, attribution (close)
 */

export const LandingPage = ({ onGetStarted }) => {
    return (
        <div className="w-full min-h-screen bg-black">
            {/* 0. Sticky Header - Linear-inspired navigation */}
            <StickyHeader onGetStarted={onGetStarted} />

            {/* 1. Hero - First impression, value proposition */}
            <Hero onGetStarted={onGetStarted} />

            {/* 2. Social Proof - Build trust with metrics */}
            <SocialProofSection />

            {/* 3. Features - Build credibility with capabilities */}
            <FeaturesSection />

            {/* 4. How It Works - Show the 3-step simplicity */}
            <HowItWorksSection />

            {/* 5. Setup Guide - Detailed AWS configuration steps */}
            <FAQSection />

            {/* 6. Final CTA - Convert visitors to users */}
            <CTASection onGetStarted={onGetStarted} />

            {/* Premium Footer */}
            <footer className="relative w-full py-12 bg-black border-t border-white/6">
                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        {/* Premium Brand */}
                        <div className="text-sm text-white/25">
                            <span className="font-normal text-white/40">CloudCore</span> — Enterprise S3 Management
                        </div>

                        {/* Premium Attribution */}
                        <div className="flex items-center gap-6 text-sm text-white/25">
                            <a
                                href="https://github.com/ezDecode"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-white/40 transition-colors duration-300"
                            >
                                Built by @ezDecode
                            </a>
                            <span>© {new Date().getFullYear()}</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};
