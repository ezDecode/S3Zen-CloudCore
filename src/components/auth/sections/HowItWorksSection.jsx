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
        <section className="relative w-full py-32 bg-black overflow-hidden">
            {/* Top separator */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* Ambient background */}
            <div className="absolute w-[800px] h-[800px] bg-purple-500/5 rounded-full blur-3xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                {/* Section Header - Creates expectation, reduces cognitive load */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="text-center mb-20"
                >
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-white mb-4">
                        Ready in <span className="gradient-text">under 60 seconds</span>
                    </h2>
                    <p className="text-lg text-white/50 max-w-2xl mx-auto">
                        No installation, no configuration, no complexity
                    </p>
                </motion.div>

                {/* Steps - Sequential, clear, confidence-building */}
                <div className="relative">
                    {/* Connection line (desktop) - Shows progression */}
                    <div className="hidden lg:block absolute top-24 left-0 right-0 h-px bg-gradient-to-r from-purple-500/20 via-purple-500/40 to-purple-500/20" />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8">
                        {steps.map((step, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{
                                    duration: 0.5,
                                    delay: index * 0.15,
                                    ease: [0.22, 1, 0.36, 1]
                                }}
                                className="relative"
                            >
                                {/* Step Card - Clear hierarchy, digestible content */}
                                <div className="relative h-full">
                                    {/* Large number - Visual anchor, progress indicator */}
                                    <div className="absolute -top-6 -left-2 text-8xl font-bold text-white/[0.03] select-none leading-none">
                                        {step.number}
                                    </div>

                                    {/* Icon container - Category identifier */}
                                    <div className="relative inline-flex items-center justify-center w-14 h-14 rounded-xl bg-white border border-white/10 mb-8 shadow-lg shadow-white/5">
                                        <step.icon className="w-7 h-7 text-black" />
                                    </div>

                                    {/* Content - Title communicates action, description builds understanding */}
                                    <h3 className="text-2xl font-semibold text-white mb-4">
                                        {step.title}
                                    </h3>
                                    <p className="text-white/60 leading-relaxed mb-4">
                                        {step.description}
                                    </p>

                                    {/* Trust signal - Addresses specific concern per step */}
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                        <span className="text-xs font-medium text-emerald-400/90">
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
