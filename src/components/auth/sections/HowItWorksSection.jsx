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
 * - Specific descriptions: Reduces uncertainty, addresses concerns
 * - Icons: Quick visual recognition
 * - Connectors (desktop): Shows progression, guides eye
 */

const steps = [
    {
        icon: Key01Icon,
        number: '01',
        title: 'Enter Credentials',
        description: 'Securely input your AWS Access Key, Secret Key, and bucket name. Everything stays local—we never store or transmit your credentials.',
        security: 'Your credentials never leave your browser'
    },
    {
        icon: CloudIcon,
        number: '02',
        title: 'Instant Connection',
        description: 'CloudCore validates and establishes a direct connection to your S3 bucket. No servers, no middlemen, no latency.',
        security: 'Direct AWS SDK connection'
    },
    {
        icon: CheckmarkCircle02Icon,
        number: '03',
        title: 'Start Managing',
        description: 'Upload files, create folders, and organize your bucket with an interface that feels native. Drag, drop, done.',
        security: 'Full S3 capability, zero complexity'
    }
];

export const HowItWorksSection = () => {
    return (
        <section className="relative w-full py-16 sm:py-24 lg:py-32 bg-black overflow-hidden">
            {/* Premium separator */}
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

            {/* Subtle ambient background */}
            <div className="absolute w-[600px] h-[600px] bg-white/[0.01] rounded-full blur-3xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
                {/* Mobile-First Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                    className="text-center mb-12 sm:mb-16 lg:mb-20"
                >
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-white mb-3 sm:mb-4 tracking-tight px-4">
                        Ready in <span className="text-white/40">under 60 seconds</span>
                    </h2>
                    <p className="text-base sm:text-lg text-white/40 max-w-2xl mx-auto px-4">
                        No installation, no configuration, no complexity
                    </p>
                </motion.div>

                {/* Mobile-First Steps Layout */}
                <div className="relative">
                    {/* Vertical connection line (mobile) */}
                    <div className="lg:hidden absolute left-[27px] top-0 bottom-0 w-[1px] bg-gradient-to-b from-white/[0.08] via-white/[0.12] to-white/[0.08]" />
                    
                    {/* Horizontal connection line (desktop) */}
                    <div className="hidden lg:block absolute top-[56px] left-0 right-0 h-[1px] bg-gradient-to-r from-white/[0.08] via-white/[0.12] to-white/[0.08]" />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-8">
                        {steps.map((step, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{
                                    duration: 0.5,
                                    delay: index * 0.1,
                                    ease: [0.4, 0, 0.2, 1]
                                }}
                                className="relative"
                            >
                                {/* Mobile-First Step Card */}
                                <div className="relative h-full pl-16 lg:pl-0">
                                    {/* Mobile: Number on left, Desktop: Background */}
                                    <div className="absolute left-0 top-0 lg:static lg:-top-4 lg:-left-2">
                                        <div className="lg:absolute lg:inset-0 flex items-start lg:items-start justify-start">
                                            <span className="text-5xl sm:text-6xl lg:text-8xl font-bold text-white/[0.08] lg:text-white/[0.03] select-none leading-none">
                                                {step.number}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Icon - Mobile optimized size */}
                                    <div className="relative inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white/[0.08] border border-white/[0.12] mb-4 sm:mb-6 lg:mb-8">
                                        <step.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white/90" />
                                    </div>

                                    {/* Content - Mobile-first typography */}
                                    <h3 className="text-xl sm:text-2xl font-semibold text-white mb-3 sm:mb-4 tracking-tight">
                                        {step.title}
                                    </h3>
                                    <p className="text-sm sm:text-base text-white/50 leading-relaxed mb-4 sm:mb-5">
                                        {step.description}
                                    </p>

                                    {/* Trust badge - Mobile optimized */}
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/[0.04] border border-white/[0.08] rounded-full">
                                        <span className="w-1.5 h-1.5 bg-white rounded-full" />
                                        <span className="text-xs font-medium text-white/60">
                                            {step.security}
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
