import { Hero } from './Hero';
import { FeaturesSection } from './sections/FeaturesSection';
import { HowItWorksSection } from './sections/HowItWorksSection';
import { FAQSection } from './sections/FAQSection';
import { CTASection } from './sections/CTASection';

export const LandingPage = ({ onGetStarted }) => (
    <div className="w-full min-h-screen bg-black">
        <Hero onGetStarted={onGetStarted} />
        <FeaturesSection />
        <HowItWorksSection />
        <FAQSection />
        <CTASection onGetStarted={onGetStarted} />

        <footer className="relative w-full py-12 bg-black border-t border-white/6">
            <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-white/25">
                    <span className="text-white/40">CloudCore</span> — S3 Manager
                </div>
                <div className="flex items-center gap-6 text-sm text-white/25">
                    <a href="https://github.com/ezDecode" target="_blank" rel="noopener noreferrer" className="hover:text-white/40">
                        @ezDecode
                    </a>
                    <span>© {new Date().getFullYear()}</span>
                </div>
            </div>
        </footer>
    </div>
);
