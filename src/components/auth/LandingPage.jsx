import { Hero } from './Hero';
import { FeaturesSection } from './sections/FeaturesSection';
import { HowItWorksSection } from './sections/HowItWorksSection';
import { CTASection } from './sections/CTASection';

/**
 * LANDING PAGE - Complete User Journey
 * 
 * PURPOSE: Guide visitor from awareness → understanding → conversion
 * 
 * STRUCTURE RATIONALE:
 * 1. Hero: Grab attention, communicate value (5 seconds)
 * 2. Features: Build credibility, prove capability (scan)
 * 3. How It Works: Remove barriers, show simplicity (understand)
 * 4. CTA: Final push, convert (act)
 * 5. Footer: Brand touchpoint, attribution (close)
 */

export const LandingPage = ({ onGetStarted, onShowSetupGuide }) => {
    return (
        <div className="w-full min-h-screen bg-black">
            {/* Hero Section */}
            <Hero onGetStarted={onGetStarted} onShowSetupGuide={onShowSetupGuide} />

            {/* Features Section */}
            <FeaturesSection />

            {/* How It Works Section */}
            <HowItWorksSection />

            {/* Final CTA Section */}
            <CTASection onGetStarted={onGetStarted} />

            {/* Footer - Credits without distraction */}
            {/* PURPOSE: Attribution, copyright, final brand touchpoint */}
            <footer className="relative w-full py-12 bg-black border-t border-white/[0.06]">
                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        {/* Brand */}
                        <div className="text-sm text-white/30">
                            <span className="font-semibold text-white/60">CloudCore</span> — Enterprise S3 Management
                        </div>

                        {/* Attribution */}
                        <div className="flex items-center gap-6 text-sm text-white/30">
                            <a
                                href="https://github.com/ezDecode"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-white/50 transition-colors"
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
