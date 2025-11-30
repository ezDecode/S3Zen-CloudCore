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
 * - Removed: Excessive gradients, replaced with subtle accents
 */

const features = [
    {
        icon: ZapIcon,
        title: 'Instant Performance',
        description: 'Sub-100ms response times with optimized AWS SDK integration and intelligent caching.',
        accent: 'from-violet-500/10 to-purple-500/10'
    },
    {
        icon: Shield01Icon,
        title: 'Enterprise Security',
        description: 'Bank-grade encryption, IAM authentication, and zero data persistence on our servers.',
        accent: 'from-emerald-500/10 to-teal-500/10'
    },
    {
        icon: CloudIcon,
        title: 'Zero Configuration',
        description: 'Connect with just your AWS credentials. No complex setup or infrastructure required.',
        accent: 'from-blue-500/10 to-cyan-500/10'
    },
    {
        icon: FolderLibraryIcon,
        title: 'Intuitive Organization',
        description: 'Familiar file system interface with drag-and-drop, breadcrumbs, and smart navigation.',
        accent: 'from-amber-500/10 to-orange-500/10'
    },
    {
        icon: Upload04Icon,
        title: 'Bulk Operations',
        description: 'Upload, download, or manage thousands of files simultaneously with progress tracking.',
        accent: 'from-pink-500/10 to-rose-500/10'
    },
    {
        icon: SearchList01Icon,
        title: 'Powerful Search',
        description: 'Find any file instantly with advanced filtering, sorting, and search capabilities.',
        accent: 'from-indigo-500/10 to-violet-500/10'
    }
];

export const FeaturesSection = () => {
    return (
        <section className="relative w-full py-32 bg-zinc-950 overflow-hidden">
            {/* Subtle separation gradient */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                {/* Section Header - Sets context, creates anticipation */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="text-center mb-20"
                >
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-white mb-4">
                        Enterprise-grade capabilities
                    </h2>
                    <p className="text-lg text-white/50 max-w-2xl mx-auto">
                        Everything you need to manage AWS S3 buckets professionally
                    </p>
                </motion.div>

                {/* Features Grid - Organized, scannable, purposeful */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{
                                duration: 0.4,
                                delay: index * 0.1,
                                ease: [0.22, 1, 0.36, 1]
                            }}
                            className="group relative"
                        >
                            {/* Card - Clean, minimal, focus on content */}
                            <div className="h-full p-8 bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] rounded-2xl hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300">
                                {/* Icon - Visual anchor, category identification */}
                                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${feature.accent} border border-white/10 mb-6`}>
                                    <feature.icon className="w-6 h-6 text-white/90" />
                                </div>

                                {/* Content Hierarchy - Title grabs, description convinces */}
                                <h3 className="text-xl font-semibold text-white mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-white/50 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
