import { motion } from 'framer-motion';
import { Key01Icon, CloudIcon, CheckmarkCircle02Icon } from 'hugeicons-react';

const steps = [
    { icon: Key01Icon, num: '01', title: 'Add Credentials', desc: 'Paste your AWS keys. They stay local.' },
    { icon: CloudIcon, num: '02', title: 'Connect', desc: 'Direct connection to S3. No middleman.' },
    { icon: CheckmarkCircle02Icon, num: '03', title: 'Manage', desc: 'Upload, organize, share your files.' },
];

export const HowItWorksSection = () => (
    <section className="relative w-full py-24 sm:py-32 bg-black overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="text-center mb-16">
                <span className="text-xs text-white/40 uppercase tracking-widest mb-4 block">How It Works</span>
                <h2 className="text-4xl sm:text-5xl font-normal text-white mb-4">Three <span className="text-white/40">steps</span></h2>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {steps.map((s, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                        className="p-6 sm:p-8 rounded-3xl bg-white/[0.03] border border-white/[0.08]">
                        <div className="flex items-start justify-between mb-6">
                            <span className="text-5xl font-normal text-white/[0.08]">{s.num}</span>
                            <div className="w-14 h-14 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center">
                                <s.icon className="w-7 h-7 text-white" />
                            </div>
                        </div>
                        <h3 className="text-xl text-white mb-3">{s.title}</h3>
                        <p className="text-sm text-white/50">{s.desc}</p>
                    </motion.div>
                ))}
            </div>

            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                className="text-center mt-16 text-sm text-white/30">
                No account needed • Browser-only • Your files stay private
            </motion.p>
        </div>
    </section>
);
