import { Hero } from './Hero';
import { FeaturesSection } from './sections/FeaturesSection';
import { FAQSection } from './sections/FAQSection';
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

export const LandingPage = ({ onGetStarted }) => {
    return (
        <div className="w-full min-h-screen bg-black">
            {/* Hero Section */}
            <Hero onGetStarted={onGetStarted} />

            {/* Features Section */}
            <FeaturesSection />

            {/* FAQ Section */}
            <FAQSection />

            {/* How It Works Section */}
            <HowItWorksSection />

            {/* Final CTA Section */}
            <CTASection onGetStarted={onGetStarted} />

            {/* Premium Footer */}
            <footer className="relative w-full py-12 bg-black border-t border-white/6">
                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        {/* Premium Brand */}
                        <div className="text-sm text-white/25">
                            <span className="font-semibold text-white/40">CloudCore</span> — Enterprise S3 Management
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
