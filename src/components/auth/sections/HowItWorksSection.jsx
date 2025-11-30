import { motion } from 'framer-motion';
import { Key01Icon, CloudIcon, CheckmarkCircle02Icon } from 'hugeicons-react';

/**
 * HOW IT WORKS SECTION - Process Clarity & Confidence Building
 * 
 * PURPOSE: Remove barriers by showing simplicity, build confidence through clarity
 * 
 * DESIGN DECISIONS:
 * - 3 steps: Industry standard, cognitively optimal
 * - Card-based layout with clean design
 * - Subtle animations on scroll
 */

const steps = [
    {
        icon: Key01Icon,
        number: '01',
        title: 'Drop Your Keys',
        description: 'Paste your AWS credentials. Don\'t worry, they never leave your browser.',
        highlight: 'Your secrets stay secret',
        gradient: 'from-blue-500/20 to-cyan-500/20'
    },
    {
        icon: CloudIcon,
        number: '02',
        title: 'Magic Happens',
        description: 'We connect directly to AWS. No middleman, no funny business.',
        highlight: 'Straight to the source',
        gradient: 'from-violet-500/20 to-purple-500/20'
    },
    {
        icon: CheckmarkCircle02Icon,
        number: '03',
        title: 'Go Wild',
        description: 'Upload, delete, organize. It\'s your bucket, do whatever you want.',
        highlight: 'You\'re the boss now',
        gradient: 'from-emerald-500/20 to-teal-500/20'
    }
];

export const HowItWorksSection = () => {
    return (
        <section className="relative w-full py-24 sm:py-32 lg:py-40 bg-black overflow-hidden">
            {/* Premium separator */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* Background Elements */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-3xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                    className="text-center mb-16 sm:mb-20 lg:mb-28"
                >
                    <span className="inline-block text-xs sm:text-sm font-normal text-white/40 uppercase tracking-widest mb-4">
                        How It Works
                    </span>
                    <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal text-white mb-4 sm:mb-6 tracking-tight">
                        Stupidly <span className="text-white/40">simple</span>
                    </h2>
                    <p className="text-base sm:text-lg lg:text-xl text-white/50 max-w-xl mx-auto">
                        Three steps. That's it. We promise we're not hiding anything.
                    </p>
                </motion.div>

                {/* Steps Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{
                                duration: 0.7,
                                delay: index * 0.15,
                                ease: [0.4, 0, 0.2, 1]
                            }}
                        >
                            {/* Card */}
                            <div className="relative h-full p-6 sm:p-8 rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm overflow-hidden">
                                {/* Subtle gradient background */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${step.gradient} opacity-30`} />
                                
                                {/* Content */}
                                <div className="relative z-10">
                                    {/* Top Row - Number & Icon */}
                                    <div className="flex items-start justify-between mb-6">
                                        {/* Step Number */}
                                        <span className="text-5xl sm:text-6xl font-bold text-white/[0.08]">
                                            {step.number}
                                        </span>
                                        
                                        {/* Icon */}
                                        <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${step.gradient} border border-white/10 flex items-center justify-center`}>
                                            <step.icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                                        </div>
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-xl sm:text-2xl font-semibold text-white mb-3 tracking-tight">
                                        {step.title}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-sm sm:text-base text-white/50 leading-relaxed mb-5">
                                        {step.description}
                                    </p>

                                    {/* Highlight Badge */}
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/[0.05] border border-white/[0.08] rounded-full">
                                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                                        <span className="text-xs font-medium text-white/60">
                                            {step.highlight}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="text-center mt-16 sm:mt-20"
                >
                    <p className="text-sm text-white/30">
                        No account needed • Everything runs in your browser • We literally can't see your files
                    </p>
                </motion.div>
            </div>
        </section>
    );
};
