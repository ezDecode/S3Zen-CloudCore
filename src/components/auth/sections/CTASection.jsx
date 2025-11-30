import { motion } from 'framer-motion';
import { ArrowRight01Icon, Github01Icon } from 'hugeicons-react';

/**
 * CTA SECTION - Final Conversion Point
 * 
 * PURPOSE: Create urgency, remove final objections, drive action
 * 
 * DESIGN DECISIONS:
 * - Single strong headline: Clear value restatement
 * - Emotional angle: "Transform" = aspirational outcome
 * - 2 CTAs: Primary (conversion) + GitHub (credibility/community)
 * - GitHub here (not Hero): Builds trust at decision point
 * - Trust badges: Remove all remaining objections
 * - Minimal visual noise: Focus 100% on decision
 * - Ambient effect: Creates focus, draws eye to center
 */

export const CTASection = ({ onGetStarted }) => {
    return (
        <section className="relative w-full py-16 sm:py-24 lg:py-32 bg-black overflow-hidden">
            {/* Premium separator */}
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

            {/* Premium ambient effect */}
            <div className="absolute w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-3xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-12 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                >
                    {/* Mobile-First Headline */}
                    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-white mb-4 sm:mb-6 tracking-tight px-4">
                        Start managing S3 like
                        <br className="hidden sm:block" />
                        <span className="sm:inline block mt-1 sm:mt-0"> </span>
                        <span className="text-white/40">a professional</span>
                    </h2>

                    {/* Mobile-First Subheadline */}
                    <p className="text-base sm:text-lg lg:text-xl text-white/40 mb-8 sm:mb-10 lg:mb-12 max-w-2xl mx-auto px-4">
                        Join teams who upgraded from clunky AWS Console to CloudCore's intuitive interface.
                    </p>

                    {/* Mobile-First CTA Group */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-10 lg:mb-12 px-4">
                        {/* Mobile-Optimized Primary Button */}
                        <button
                            onClick={onGetStarted}
                            className="group w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-white text-black font-semibold rounded-xl hover:opacity-90 transition-opacity duration-150 flex items-center justify-center gap-2 shadow-lg active:scale-[0.99] touch-target"
                        >
                            <span className="text-sm sm:text-base">Get Started Free</span>
                            <ArrowRight01Icon className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                        </button>

                        {/* Mobile-Optimized Secondary Button */}
                        <a
                            href="https://github.com/ezDecode/S3Zen-CloudCore"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 text-white/70 hover:text-white font-semibold rounded-xl border border-white/[0.08] hover:border-white/[0.1] hover:bg-white/[0.03] transition-all duration-150 flex items-center justify-center gap-2 active:scale-[0.99] touch-target"
                        >
                            <Github01Icon className="w-4 h-4" />
                            <span className="text-sm sm:text-base">View on GitHub</span>
                        </a>
                    </div>

                    {/* Mobile-First Trust Badges */}
                    <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-white/30 px-4">
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-white rounded-full flex-shrink-0" />
                            <span className="whitespace-nowrap">Free & Open Source</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-white rounded-full flex-shrink-0" />
                            <span className="whitespace-nowrap">No Credit Card</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-white rounded-full flex-shrink-0" />
                            <span className="whitespace-nowrap">MIT License</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-white rounded-full flex-shrink-0" />
                            <span className="whitespace-nowrap">Works Offline</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};
