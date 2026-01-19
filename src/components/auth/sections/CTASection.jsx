import { motion } from 'framer-motion';
import { ArrowRight01Icon, Github01Icon } from 'hugeicons-react';

export const CTASection = ({ onGetStarted }) => (
    <section className="relative w-full py-24 sm:py-32 bg-black overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="absolute w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-3xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <h2 className="text-5xl sm:text-6xl font-normal text-white mb-6">
                    Ready? <span className="text-white/40">Let's go</span>
                </h2>
                <p className="text-lg text-white/50 mb-10 max-w-xl mx-auto">
                    Free forever. No account required. Open source.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
                    <button onClick={onGetStarted}
                        className="group w-full sm:w-auto px-8 py-4 bg-white text-black font-medium rounded-xl hover:bg-white/90 flex items-center justify-center gap-2">
                        Get Started <ArrowRight01Icon className="w-4 h-4" />
                    </button>
                    <a href="https://github.com/ezDecode/S3Zen-CloudCore" target="_blank" rel="noopener noreferrer"
                        className="w-full sm:w-auto px-8 py-4 text-white/80 border border-white/10 rounded-xl hover:bg-white/[0.03] flex items-center justify-center gap-2">
                        <Github01Icon className="w-4 h-4" /> GitHub
                    </a>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/40">
                    {['Free Forever', 'No Account', 'Open Source'].map((t, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-emerald-400/80 rounded-full" />
                            <span>{t}</span>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    </section>
);
