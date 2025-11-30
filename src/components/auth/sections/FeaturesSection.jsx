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
        description: 'Sub-100ms response times with optimized AWS SDK integration and intelligent caching.'
    },
    {
        icon: Shield01Icon,
        title: 'Enterprise Security',
        description: 'Bank-grade encryption, IAM authentication, and zero data persistence on our servers.'
    },
    {
        icon: CloudIcon,
        title: 'Zero Configuration',
        description: 'Connect with just your AWS credentials. No complex setup or infrastructure required.'
    },
    {
        icon: FolderLibraryIcon,
        title: 'Intuitive Organization',
        description: 'Familiar file system interface with drag-and-drop, breadcrumbs, and smart navigation.'
    },
    {
        icon: Upload04Icon,
        title: 'Bulk Operations',
        description: 'Upload, download, or manage thousands of files simultaneously with progress tracking.'
    },
    {
        icon: SearchList01Icon,
        title: 'Powerful Search',
        description: 'Find any file instantly with advanced filtering, sorting, and search capabilities.'
    }
];

export const FeaturesSection = () => {
    return (
        <section className="relative w-full py-16 sm:py-24 lg:py-32 bg-black overflow-hidden">
            {/* Premium separation line */}
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
                {/* Mobile-First Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                    className="text-center mb-12 sm:mb-16 lg:mb-20 px-4"
                >
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-white mb-3 sm:mb-4 tracking-tight">
                        Enterprise-grade capabilities
                    </h2>
                    <p className="text-base sm:text-lg text-white/40 max-w-2xl mx-auto">
                        Everything you need to manage AWS S3 buckets professionally
                    </p>
                </motion.div>

                {/* Mobile-First Features Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
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
                            {/* Mobile-Optimized Card */}
                            <div className="h-full p-6 sm:p-7 lg:p-8 bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] rounded-xl sm:rounded-2xl hover:bg-white/[0.03] hover:border-white/[0.08] transition-all duration-150">
                                {/* Mobile-Optimized Icon */}
                                <div className="inline-flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-white/[0.04] border border-white/[0.08] mb-4 sm:mb-5 lg:mb-6 group-hover:bg-white/[0.05] transition-all duration-150">
                                    <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white/70" />
                                </div>

                                {/* Mobile-First Content */}
                                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3 tracking-tight">
                                    {feature.title}
                                </h3>
                                <p className="text-white/40 leading-relaxed text-sm sm:text-[15px]">
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
