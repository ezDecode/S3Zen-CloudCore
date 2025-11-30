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
        <section className="relative w-full py-32 bg-zinc-950 overflow-hidden">
            {/* Top separator */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* Focused ambient effect - Creates visual hierarchy, draws to center */}
            <div className="absolute w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

            <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                    {/* Headline - Emotional, outcome-focused, creates urgency */}
                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-semibold text-white mb-6">
                        Start managing S3 like
                        <br />
                        <span className="gradient-text">a professional</span>
                    </h2>

                    {/* Subheadline - Reinforces ease, removes hesitation */}
                    <p className="text-lg sm:text-xl text-white/50 mb-12 max-w-2xl mx-auto">
                        Join teams who upgraded from clunky AWS Console to CloudCore's intuitive interface.
                    </p>

                    {/* CTA Group - Clear action hierarchy */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                        {/* PRIMARY: Main conversion - High contrast, prominent */}
                        <button
                            onClick={onGetStarted}
                            className="group w-full sm:w-auto px-8 py-4 bg-white text-black font-medium rounded-xl hover:bg-white/90 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-white/10"
                        >
                            <span>Get Started Free</span>
                            <ArrowRight01Icon className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                        </button>

                        {/* SECONDARY: GitHub - Builds trust, shows transparency */}
                        {/* Placed here (not Hero) because trust matters more at decision point */}
                        <a
                            href="https://github.com/ezDecode/S3Zen-CloudCore"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group w-full sm:w-auto px-8 py-4 text-white/80 hover:text-white font-medium rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/[0.02] transition-all duration-200 flex items-center justify-center gap-2"
                        >
                            <Github01Icon className="w-4 h-4" />
                            <span>View on GitHub</span>
                        </a>
                    </div>

                    {/* Trust Badges - Final objection removal */}
                    {/* Specific, credible claims that address common concerns */}
                    <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/40">
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                            <span>Free & Open Source</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                            <span>No Credit Card</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                            <span>MIT License</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                            <span>Works Offline</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};
