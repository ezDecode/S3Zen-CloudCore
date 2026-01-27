/**
 * cloudcore landing page
 * ncdai design system implementation with terracotta palette
 * centered layout with border-edge gridlines and screen-line separators
 */

import { useState, useEffect } from 'react';
import { Cloud, ArrowRight, Shield, Zap, Lock, Upload, Link2, BarChart3 } from 'lucide-react';
import { DiagonalSeparator as Separator } from '../ui/DiagonalSeparator';

export const LandingPage = ({ onGetStarted }) => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="max-w-screen overflow-x-hidden px-2">
            <div className="mx-auto border-x border-edge md:max-w-4xl">
                {/* top diagonal separator */}
                <Separator />

                {/* navigation */}
                <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-sm' : ''}`}>
                    <div className="screen-line-after px-4 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-2.5 cursor-pointer">
                            <Cloud className="w-5 h-5 text-brand" />
                            <span className="text-base tracking-tight font-medium font-mono">CloudCore</span>
                        </div>

                        <div className="flex items-center gap-8">
                            <a
                                href="https://github.com/ezDecode/S3Zen-CloudCore"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs tracking-wide text-muted-foreground hover:text-foreground transition-colors hidden sm:block font-medium"
                            >
                                GitHub
                            </a>
                            <button
                                onClick={onGetStarted}
                                className="btn btn-brand h-9 px-5 rounded-lg text-xs tracking-wide font-medium"
                            >
                                Get Started
                            </button>
                            <button
                                onClick={onGetStarted}
                                className="sm:hidden text-brand font-medium text-xs"
                            >
                                Login
                            </button>
                        </div>
                    </div>
                </header>

                {/* hero section */}
                <main className="min-h-[calc(100vh-200px)]">
                    <div className="px-4 pt-16 pb-8 lg:pt-28">
                        <div className="inline-flex items-center gap-3 mb-6">
                            <div className="w-8 h-0.5 bg-brand/80 rounded-full" />
                            <span className="text-xs tracking-widest text-muted-foreground uppercase font-medium">Sovereign S3</span>
                        </div>

                        <h1 className="screen-line-after text-3xl sm:text-4xl lg:text-5xl tracking-tighter leading-[1.1] text-foreground pb-6 font-semibold">
                            Sovereign S3<br />
                            <span className="text-brand">Precision Engineered</span>
                        </h1>
                    </div>

                    <div className="p-4 pb-8">
                        <p className="text-base text-muted-foreground leading-relaxed max-w-lg">
                            Your buckets. Your keys. Zero knowledge. The professional interface for your S3 assets.
                        </p>
                    </div>

                    <div className="screen-line-before screen-line-after p-4 flex flex-wrap items-center gap-4">
                        <button
                            onClick={onGetStarted}
                            className="btn btn-primary h-12 px-8 rounded-lg text-sm font-medium"
                        >
                            Start Uploading
                            <ArrowRight className="w-4 h-4" />
                        </button>
                        <a
                            href="https://github.com/ezDecode/S3Zen-CloudCore"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline h-12 px-6 rounded-lg text-sm font-medium"
                        >
                            View Documentation
                        </a>
                    </div>



                    {/* diagonal separator */}
                    <Separator />

                    {/* features section */}
                    <div className="screen-line-after p-4 py-2">
                        <span className="text-xs tracking-widest text-muted-foreground uppercase font-medium">Core Features</span>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 -z-1 grid grid-cols-2 max-sm:hidden">
                            <div className="border-r border-edge"></div>
                            <div></div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2">
                            {[
                                {
                                    icon: Shield,
                                    title: 'Local Encryption',
                                    description: 'Keys stay in memory. Zero knowledge. Absolute privacy generated on-device.'
                                },
                                {
                                    icon: Upload,
                                    title: 'Smart Compress',
                                    description: 'Auto-optimize assets on-the-fly. Save bandwidth without quality loss.'
                                },
                                {
                                    icon: Link2,
                                    title: 'Instant Links',
                                    description: 'Generate secure, expiring links in one click. Password protected access control.'
                                },
                                {
                                    icon: Zap,
                                    title: 'Direct Access',
                                    description: 'No bottlenecks. Raw speed. Direct-to-S3 architecture for maximum throughput.'
                                },
                            ].map((feature, i) => (
                                <div key={i} className="p-6 screen-line-after">
                                    <feature.icon className="w-5 h-5 text-brand mb-4" />
                                    <h3 className="text-base font-semibold mb-2">{feature.title}</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* diagonal separator */}
                    <Separator />

                    {/* why cloudcore section */}
                    <div className="screen-line-after p-4 py-2">
                        <span className="text-xs tracking-widest text-muted-foreground tracking-tighter font-medium">Why CloudCore</span>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                            {[
                                { label: 'No Vendor Lock-in', desc: 'Your S3, your rules' },
                                { label: 'Open Source', desc: 'Fully auditable code' },
                                { label: 'Privacy First', desc: 'No tracking or analytics' },
                                { label: 'Self-Hostable', desc: 'Run on your own infra' },
                            ].map((item, i) => (
                                <div key={i} className="text-center">
                                    <h4 className="text-sm font-semibold mb-1">{item.label}</h4>
                                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* diagonal separator */}
                    <Separator />

                    {/* CTA section */}
                    <div className="p-8 text-center">
                        <h2 className="text-2xl font-semibold mb-3">Ready to Get Started?</h2>
                        <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                            Connect your S3 bucket and start uploading in under 2 minutes. No credit card required.
                        </p>
                        <button
                            onClick={onGetStarted}
                            className="btn btn-brand h-12 px-10 rounded-lg text-sm font-medium"
                        >
                            Launch Dashboard
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </main>

                {/* diagonal separator */}
                <Separator />

                {/* footer */}
                <footer className="screen-line-before">
                    <div className="px-4 py-6 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <Cloud className="w-4 h-4 text-brand" />
                            <span className="text-sm font-medium">CloudCore</span>
                        </div>
                        <div className="flex items-center gap-8 text-xs text-muted-foreground font-medium">
                            <a href="https://github.com/ezDecode" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">ezDecode Lab</a>
                            <a href="https://github.com/ezDecode/S3Zen-CloudCore" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Open Source</a>
                            <span className="select-none opacity-60">© {new Date().getFullYear()}</span>
                        </div>
                    </div>
                </footer>

                {/* bottom spacing */}
                <div className="h-4" />
            </div>
        </div>
    );
};

export default LandingPage;
