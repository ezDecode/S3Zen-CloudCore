import { motion } from 'framer-motion';
import { Github01Icon, Download04Icon, UserMultiple02Icon, CheckmarkCircle02Icon } from 'hugeicons-react';
import { useState, useEffect } from 'react';

/**
 * SOCIAL PROOF SECTION - Linear-inspired credibility
 * 
 * Features:
 * - GitHub stars counter
 * - Simple metrics
 * - Open source badge
 * - Minimal, clean design
 */

export const SocialProofSection = () => {
    const [githubStars, setGithubStars] = useState(null);

    useEffect(() => {
        // Fetch GitHub stars
        fetch('https://api.github.com/repos/ezDecode/S3Zen-CloudCore')
            .then(res => res.json())
            .then(data => setGithubStars(data.stargazers_count))
            .catch(() => setGithubStars(null));
    }, []);

    const metrics = [
        {
            icon: Github01Icon,
            value: githubStars ? `${githubStars}+` : '...',
            label: 'GitHub Stars',
            color: 'from-purple-500/20 to-pink-500/20'
        },
        {
            icon: Download04Icon,
            value: '100%',
            label: 'Free Forever',
            color: 'from-blue-500/20 to-cyan-500/20'
        },
        {
            icon: UserMultiple02Icon,
            value: 'Open',
            label: 'Source',
            color: 'from-emerald-500/20 to-teal-500/20'
        },
        {
            icon: CheckmarkCircle02Icon,
            value: 'Zero',
            label: 'Setup Time',
            color: 'from-amber-500/20 to-orange-500/20'
        }
    ];

    return (
        <section className="relative w-full py-16 sm:py-20 lg:py-24 bg-black overflow-hidden">
            {/* Subtle separator */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                    className="text-center mb-12"
                >
                    <span className="inline-block text-xs sm:text-sm font-normal text-white/40 uppercase tracking-widest">
                        Trusted by Developers
                    </span>
                </motion.div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {metrics.map((metric, index) => (
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
                            className="relative group"
                        >
                            {/* Metric Card */}
                            <div className="relative p-6 sm:p-8 bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] rounded-2xl hover:bg-white/[0.03] hover:border-white/[0.08] transition-colors duration-150 overflow-hidden">
                                {/* Gradient overlay */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${metric.color} opacity-0 group-hover:opacity-[0.1] transition-opacity duration-300`} />
                                
                                {/* Content */}
                                <div className="relative z-10 text-center">
                                    {/* Icon */}
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/[0.06] border border-white/[0.1] mb-4">
                                        <metric.icon className="w-6 h-6 text-white/80" />
                                    </div>

                                    {/* Value */}
                                    <div className="text-2xl sm:text-3xl font-normal text-white mb-1 tracking-tight">
                                        {metric.value}
                                    </div>

                                    {/* Label */}
                                    <div className="text-sm text-white/50">
                                        {metric.label}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Trust Badge */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="text-center mt-12"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/[0.03] border border-white/[0.08] rounded-full">
                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                        <span className="text-sm text-white/60">
                            No account needed • Everything runs in your browser • 100% Private
                        </span>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};
