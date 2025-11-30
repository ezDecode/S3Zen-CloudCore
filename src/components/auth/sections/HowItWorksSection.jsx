import { motion } from 'framer-motion';
import { Key01Icon, CloudIcon, CheckmarkCircle02Icon } from 'hugeicons-react';

/**
 * HOW IT WORKS SECTION - Process Clarity & Confidence Building
 * 
 * PURPOSE: Remove barriers by showing simplicity, build confidence through clarity
 * 
 * DESIGN DECISIONS:
 * - 3 steps: Industry standard, cognitively optimal
 * - Sequential layout: Natural left-to-right flow
 * - Large numbers: Visual hierarchy, shows progress
 * - Specific descriptions: Reduces uncertainty
 * - Icons: Quick visual recognition
 * - Connection lines: Shows progression
 */

const steps = [
    {
        icon: Key01Icon,
        number: '01',
        title: 'Enter Credentials',
        description: 'Securely input your AWS Access Key, Secret Key, and bucket name. Everything stays local—we never store your credentials.',
        highlight: 'Credentials never leave your browser'
    },
    {
        icon: CloudIcon,
        number: '02',
        title: 'Instant Connection',
        description: 'CloudCore validates and establishes a direct connection to your S3 bucket. No servers, no middlemen, no latency.',
        highlight: 'Direct AWS SDK connection'
    },
    {
        icon: CheckmarkCircle02Icon,
        number: '03',
        title: 'Start Managing',
        description: 'Upload files, create folders, and organize your bucket with an interface that feels native. Drag, drop, done.',
        highlight: 'Full S3 capability, zero complexity'
    }
];

export const HowItWorksSection = () => {
    return (
        <section className="relative w-full py-20 sm:py-28 lg:py-36 bg-gradient-to-b from-black via-white/[0.01] to-black overflow-hidden">
            {/* Premium separator */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* Ambient background */}
            <div className="absolute w-[800px] h-[800px] bg-white/[0.02] rounded-full blur-3xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                    className="text-center mb-14 sm:mb-18 lg:mb-24"
                >
                    <span className="inline-block text-xs sm:text-sm font-normal text-white/40 uppercase tracking-widest mb-4">
                        How It Works
                    </span>
                    <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal text-white mb-4 sm:mb-6 tracking-tight">
                        Ready in <span className="text-white/40">60 seconds</span>
                    </h2>
                    <p className="text-lg sm:text-xl lg:text-2xl text-white/50 max-w-2xl mx-auto">
                        No installation, no configuration, no complexity
                    </p>
                </motion.div>

                {/* Steps Grid */}
                <div className="relative">
                    {/* Connection line - Desktop */}
                    <div className="hidden lg:block absolute top-[72px] left-[16.67%] right-[16.67%] h-px">
                        <div className="w-full h-full bg-gradient-to-r from-white/5 via-white/20 to-white/5" />
                        {/* Animated dots on the line */}
                        <motion.div 
                            className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-white/40 rounded-full"
                            animate={{ left: ['0%', '100%'] }}
                            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                        />
                    </div>

                    {/* Connection line - Mobile/Tablet */}
                    <div className="lg:hidden absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-white/5 via-white/15 to-white/5" />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-8">
                        {steps.map((step, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{
                                    duration: 0.6,
                                    delay: index * 0.15,
                                    ease: [0.4, 0, 0.2, 1]
                                }}
                                className="relative"
                            >
                                {/* Step Card */}
                                <div className="relative pl-20 lg:pl-0 lg:text-center">
                                    {/* Step Number - Mobile */}
                                    <div className="lg:hidden absolute left-0 top-0 w-16 h-16 flex items-center justify-center">
                                        <div className="relative z-10 w-14 h-14 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center">
                                            <span className="text-2xl font-bold text-white/30">{step.number}</span>
                                        </div>
                                    </div>

                                    {/* Icon Container */}
                                    <div className="lg:mx-auto inline-flex items-center justify-center w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 rounded-2xl bg-white/[0.06] border border-white/10 mb-5 lg:mb-8 relative group hover:bg-white/[0.08] hover:border-white/15 transition-all duration-300">
                                        <step.icon className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 text-white/80" />
                                        {/* Subtle glow on hover */}
                                        <div className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300" />
                                    </div>

                                    {/* Desktop Number Badge */}
                                    <div className="hidden lg:block absolute -top-3 left-1/2 -translate-x-1/2">
                                        <span className="text-7xl font-bold text-white/[0.04] select-none">
                                            {step.number}
                                        </span>
                                    </div>

                                    {/* Content */}
                                    <h3 className="text-xl sm:text-2xl font-semibold text-white mb-3 sm:mb-4 tracking-tight">
                                        {step.title}
                                    </h3>
                                    <p className="text-sm sm:text-base text-white/50 leading-relaxed mb-4 sm:mb-5 lg:max-w-xs lg:mx-auto">
                                        {step.description}
                                    </p>

                                    {/* Trust Badge */}
                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/[0.04] border border-white/[0.08] rounded-full">
                                        <span className="w-1.5 h-1.5 bg-emerald-400/80 rounded-full" />
                                        <span className="text-xs sm:text-sm font-medium text-white/60">
                                            {step.highlight}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};
