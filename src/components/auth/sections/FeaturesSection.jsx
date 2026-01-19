import { motion } from 'framer-motion';
import { ZapIcon, Shield01Icon, FolderLibraryIcon, Upload04Icon, SearchList01Icon, CloudIcon } from 'hugeicons-react';

const features = [
    { icon: ZapIcon, title: 'Fast Uploads', description: 'Optimized for speed with parallel transfers.' },
    { icon: Shield01Icon, title: 'Secure', description: 'Credentials stay in your browser.' },
    { icon: CloudIcon, title: 'No Setup', description: 'Just paste credentials and go.' },
    { icon: FolderLibraryIcon, title: 'Intuitive', description: 'Familiar file explorer interface.' },
    { icon: Upload04Icon, title: 'Bulk Operations', description: 'Upload thousands of files at once.' },
    { icon: SearchList01Icon, title: 'Search', description: 'Find files instantly.' },
];

export const FeaturesSection = () => (
    <section className="relative w-full py-20 sm:py-28 bg-black overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="text-center mb-14">
                <span className="text-xs text-white/40 uppercase tracking-widest mb-4 block">Features</span>
                <h2 className="text-4xl sm:text-5xl font-normal text-white mb-4">Built for <span className="text-white/40">productivity</span></h2>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {features.map((f, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                        className="p-6 bg-white/[0.02] border border-white/[0.06] rounded-2xl hover:bg-white/[0.03] transition-colors">
                        <div className="w-12 h-12 rounded-xl bg-white/[0.06] border border-white/[0.1] flex items-center justify-center mb-5">
                            <f.icon className="w-6 h-6 text-white/80" />
                        </div>
                        <h3 className="text-lg text-white mb-2">{f.title}</h3>
                        <p className="text-sm text-white/50">{f.description}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    </section>
);
