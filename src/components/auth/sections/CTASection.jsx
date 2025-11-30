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
 * - Trust badges: Remove all remaining objections
 * - Ambient effect: Creates focus, draws eye to center
 */

export const CTASection = ({ onGetStarted }) => {
    return (
        <section className="relative w-full py-24 sm:py-32 lg:py-40 bg-black overflow-hidden">
            {/* Premium separator */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* Premium ambient effect */}
            <div className="absolute w-[800px] h-[800px] bg-gradient-to-br from-white/[0.03] to-transparent rounded-full blur-3xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            
            {/* Secondary glow */}
            <div className="absolute w-[400px] h-[400px] bg-white/[0.02] rounded-full blur-2xl top-1/3 right-1/4 pointer-events-none" />

            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-12 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                >
                    {/* Badge */}
                    <span className="inline-block text-xs sm:text-sm font-normal text-white/40 uppercase tracking-widest mb-6">
                        Ready to Start?
                    </span>

                    {/* Headline */}
                    <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-normal text-white mb-6 sm:mb-8 tracking-tight leading-[1.1]">
                        Still here?
                        <br />
                        <span className="text-white/40">Let's do this</span>
                    </h2>

                    {/* Subheadline */}
                    <p className="text-lg sm:text-xl lg:text-2xl text-white/50 mb-10 sm:mb-12 lg:mb-14 max-w-2xl mx-auto leading-relaxed">
                        Join the cool kids who ditched the AWS Console. Your future self will thank you.
                    </p>

                    {/* CTA Group */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 mb-10 sm:mb-12 lg:mb-14">
                        {/* Primary Button */}
                        <motion.button
                            onClick={onGetStarted}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="group w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white text-black font-semibold rounded-xl hover:bg-white/95 transition-colors duration-200 flex items-center justify-center gap-2 shadow-2xl shadow-white/10"
                        >
                            <span className="text-sm sm:text-base">Get Started Free</span>
                            <ArrowRight01Icon className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                        </motion.button>

                        {/* Secondary Button */}
                        <motion.a
                            href="https://github.com/ezDecode/S3Zen-CloudCore"
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="group w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-white/80 hover:text-white font-semibold rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/[0.04] transition-all duration-200 flex items-center justify-center gap-2"
                        >
                            <Github01Icon className="w-4 h-4" />
                            <span className="text-sm sm:text-base">View on GitHub</span>
                        </motion.a>
                    </div>

                    {/* Trust Badges */}
                    <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-white/40">
                        <div className="flex items-center gap-2.5">
                            <span className="w-2 h-2 bg-emerald-400/80 rounded-full" />
                            <span>100% Free Forever</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <span className="w-2 h-2 bg-emerald-400/80 rounded-full" />
                            <span>No Account Needed</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <span className="w-2 h-2 bg-emerald-400/80 rounded-full" />
                            <span>Open Source</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <span className="w-2 h-2 bg-emerald-400/80 rounded-full" />
                            <span>Works Offline Too</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};
