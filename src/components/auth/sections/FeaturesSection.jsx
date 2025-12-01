import { motion } from 'framer-motion';
import { ZapIcon, Shield01Icon, FolderLibraryIcon, Upload04Icon, SearchList01Icon, CloudIcon } from 'hugeicons-react';

/**
 * FEATURES SECTION - Value Depth & Differentiation
 * 
 * PURPOSE: Prove capability, build trust through specificity
 * 
 * DESIGN DECISIONS:
 * - 6 features: Comprehensive without overwhelming
 * - Icon + Title + Description: Scannable hierarchy
 * - Grid layout: Organized, professional
 * - Subtle hover: Interactive feedback without distraction
 * - Staggered animation: Guides attention, feels alive
 */

const features = [
    {
        icon: ZapIcon,
        title: 'Blazing Fast',
        description: 'So fast you\'ll think something\'s broken. Spoiler: it\'s not.',
        gradient: 'from-amber-500/20 to-orange-500/20'
    },
    {
        icon: Shield01Icon,
        title: 'Fort Knox Security',
        description: 'Your secrets are safe with us. Actually, they never even reach us. Problem solved.',
        gradient: 'from-emerald-500/20 to-teal-500/20'
    },
    {
        icon: CloudIcon,
        title: 'Zero Setup Headaches',
        description: 'Just your AWS keys and you\'re in. No PhD in cloud computing required.',
        gradient: 'from-sky-500/20 to-blue-500/20'
    },
    {
        icon: FolderLibraryIcon,
        title: 'Actually Makes Sense',
        description: 'Drag, drop, done. Like your computer\'s file explorer, but for the cloud.',
        gradient: 'from-violet-500/20 to-purple-500/20'
    },
    {
        icon: Upload04Icon,
        title: 'Bulk Everything',
        description: 'Upload 1000 files at once? Sure. We won\'t even break a sweat.',
        gradient: 'from-rose-500/20 to-pink-500/20'
    },
    {
        icon: SearchList01Icon,
        title: 'Find Anything',
        description: 'Lost that file from 2019? We\'ll find it faster than you can say "bucket".',
        gradient: 'from-cyan-500/20 to-teal-500/20'
    }
];

export const FeaturesSection = () => {
    return (
        <section className="relative w-full py-20 sm:py-28 lg:py-36 bg-black overflow-hidden">
            {/* Premium separation line */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            
            {/* Subtle ambient glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/[0.015] rounded-full blur-3xl pointer-events-none" />

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
                        Features
                    </span>
                    <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal text-white mb-4 sm:mb-6 tracking-tight">
                        Okay, it's actually <span className="text-white/40">pretty good</span>
                    </h2>
                    <p className="text-lg sm:text-xl lg:text-2xl text-white/50 max-w-2xl mx-auto">
                        Features that make you wonder why AWS didn't do this themselves
                    </p>
                </motion.div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{
                                duration: 0.5,
                                delay: index * 0.08,
                                ease: [0.4, 0, 0.2, 1]
                            }}
                            className="group relative"
                        >
                            {/* Feature Card */}
                            <div className="relative h-full p-6 sm:p-7 lg:p-8 bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] rounded-2xl hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-300 overflow-hidden">
                                {/* Subtle gradient overlay on hover */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                                
                                {/* Content */}
                                <div className="relative z-10">
                                    {/* Icon */}
                                    <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white/[0.06] border border-white/[0.1] mb-5 sm:mb-6 group-hover:bg-white/[0.08] group-hover:border-white/[0.15] transition-all duration-300">
                                        <feature.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white/80 group-hover:text-white transition-colors duration-300" />
                                    </div>

                                    {/* Title & Description */}
                                    <h3 className="text-lg sm:text-xl font-normal text-white mb-2 sm:mb-3 tracking-tight group-hover:text-white transition-colors duration-300">
                                        {feature.title}
                                    </h3>
                                    <p className="text-white/50 leading-relaxed text-sm sm:text-base group-hover:text-white/60 transition-colors duration-300">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
