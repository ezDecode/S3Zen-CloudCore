/**
 * cloudcore landing page
 * ncdai design system implementation with terracotta palette
 * centered layout with border-edge gridlines and screen-line separators
 */

import { useState, useEffect } from 'react';
import { Cloud, ArrowRight, Shield, Zap, Lock, Upload, Link2, BarChart3 } from 'lucide-react';

export const LandingPage = ({ onGetStarted }) => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="max-w-screen overflow-x-hidden px-2">
            <div className="mx-auto border-x border-edge md:max-w-3xl">
                {/* top diagonal separator */}
                <Separator />

                {/* navigation */}
                <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-background/80 backdrop-blur-md' : ''}`}>
                    <div className="screen-line-after px-4 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-2.5 cursor-pointer">
                            <Cloud className="w-5 h-5 text-brand" />
                            <span className="text-base tracking-tight lowercase font-medium">cloudcore</span>
                        </div>

                        <div className="flex items-center gap-8">
                            <a
                                href="https://github.com/ezDecode/S3Zen-CloudCore"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs tracking-wide text-muted-foreground hover:text-foreground transition-colors hidden sm:block lowercase font-medium"
                            >
                                github
                            </a>
                            <button
                                onClick={onGetStarted}
                                className="btn btn-brand h-9 px-5 rounded-lg text-xs tracking-wide lowercase font-medium"
                            >
                                get started
                            </button>
                        </div>
                    </div>
                </header>

                {/* hero section */}
                <main className="min-h-[calc(100vh-200px)]">
                    <div className="px-4 pt-20 pb-8 lg:pt-28">
                        <div className="inline-flex items-center gap-3 mb-6">
                            <div className="w-8 h-0.5 bg-brand/40 rounded-full" />
                            <span className="text-xs tracking-widest text-muted-foreground lowercase font-medium">cloud infrastructure</span>
                        </div>

                        <h1 className="screen-line-after text-4xl lg:text-5xl tracking-tight leading-[1.1] text-foreground lowercase pb-6 font-semibold">
                            secure cloud storage<br />
                            <span className="text-brand">made simple</span>
                        </h1>
                    </div>

                    <div className="p-4 pb-8">
                        <p className="text-base text-muted-foreground lowercase leading-relaxed max-w-lg">
                            enterprise-grade s3 file management with client-side encryption, instant sharing, and real-time sync. built for teams who demand security without compromising on speed.
                        </p>
                    </div>

                    <div className="screen-line-before screen-line-after p-4 flex flex-wrap items-center gap-4">
                        <button
                            onClick={onGetStarted}
                            className="btn btn-primary h-12 px-8 rounded-lg text-sm lowercase font-medium"
                        >
                            start uploading
                            <ArrowRight className="w-4 h-4" />
                        </button>
                        <a
                            href="https://github.com/ezDecode/S3Zen-CloudCore"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline h-12 px-6 rounded-lg text-sm lowercase font-medium"
                        >
                            view documentation
                        </a>
                    </div>

                    {/* stats section */}
                    <div className="relative">
                        <div className="absolute inset-0 -z-1 grid grid-cols-3 max-sm:hidden">
                            <div className="border-r border-edge"></div>
                            <div className="border-r border-edge"></div>
                            <div></div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3">
                            {[
                                { value: "256-bit", label: "aes encryption" },
                                { value: "99.99%", label: "uptime sla" },
                                { value: "<50ms", label: "global latency" }
                            ].map((stat, i) => (
                                <div key={i} className="p-6 text-center screen-line-before screen-line-after">
                                    <div className="text-2xl font-semibold text-brand lowercase mb-1">{stat.value}</div>
                                    <div className="text-xs text-muted-foreground lowercase tracking-wide">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>

                {/* diagonal separator */}
                <Separator />

                {/* features section */}
                <section className="relative">
                    {/* grid background lines */}
                    <div className="absolute inset-0 -z-1 grid grid-cols-1 gap-4 max-sm:hidden sm:grid-cols-3">
                        <div className="border-r border-edge"></div>
                        <div className="border-r border-edge"></div>
                        <div></div>
                    </div>

                    <div className="screen-line-after px-4 py-3">
                        <span className="text-xs tracking-widest text-muted-foreground lowercase font-medium">core features</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3">
                        {[
                            {
                                icon: Lock,
                                title: "end-to-end encryption",
                                desc: "files are encrypted on your device before upload. only you hold the keys—zero-knowledge architecture.",
                            },
                            {
                                icon: Zap,
                                title: "edge-optimized cdn",
                                desc: "lightning-fast delivery through aws cloudfront's global edge network with signed url security.",
                            },
                            {
                                icon: Link2,
                                title: "instant sharing",
                                desc: "generate secure, expiring links in one click. control access with granular permissions.",
                            }
                        ].map((item, i) => {
                            const Icon = item.icon;
                            return (
                                <div
                                    key={i}
                                    className="p-5 transition-colors ease-out hover:bg-accent2 screen-line-before screen-line-after group"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center mb-4 group-hover:bg-brand/20 transition-colors">
                                        <Icon className="w-5 h-5 text-brand" />
                                    </div>
                                    <h3 className="text-sm text-foreground lowercase mb-2 font-semibold">{item.title}</h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed lowercase">
                                        {item.desc}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* diagonal separator */}
                <Separator />

                {/* additional features */}
                <section>
                    <div className="screen-line-after px-4 py-3">
                        <span className="text-xs tracking-widest text-muted-foreground lowercase font-medium">why cloudcore</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2">
                        {[
                            {
                                icon: Upload,
                                title: "drag & drop uploads",
                                desc: "intuitive file management with progress tracking and batch operations."
                            },
                            {
                                icon: BarChart3,
                                title: "usage analytics",
                                desc: "monitor storage usage, bandwidth, and access patterns in real-time."
                            },
                            {
                                icon: Shield,
                                title: "compliance ready",
                                desc: "gdpr, hipaa, and soc2 compliant infrastructure for enterprise needs."
                            },
                            {
                                icon: Cloud,
                                title: "multi-bucket support",
                                desc: "manage multiple s3 buckets across regions from a single dashboard."
                            }
                        ].map((item, i) => {
                            const Icon = item.icon;
                            return (
                                <div
                                    key={i}
                                    className="p-5 transition-colors ease-out hover:bg-accent2 screen-line-before screen-line-after flex gap-4"
                                >
                                    <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                                        <Icon className="w-4 h-4 text-secondary-foreground" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm text-foreground lowercase mb-1 font-medium">{item.title}</h3>
                                        <p className="text-xs text-muted-foreground leading-relaxed lowercase">
                                            {item.desc}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* CTA section */}
                <Separator />

                <section className="screen-line-before screen-line-after">
                    <div className="px-4 py-12 text-center">
                        <h2 className="text-2xl font-semibold text-foreground lowercase mb-3">ready to secure your files?</h2>
                        <p className="text-sm text-muted-foreground lowercase mb-6 max-w-sm mx-auto">
                            join thousands of developers using cloudcore for secure, fast cloud storage.
                        </p>
                        <button
                            onClick={onGetStarted}
                            className="btn btn-brand h-12 px-10 rounded-lg text-sm lowercase font-medium"
                        >
                            get started free
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </section>

                {/* diagonal separator */}
                <Separator />

                {/* footer */}
                <footer className="screen-line-before">
                    <div className="px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-2.5">
                            <Cloud className="w-4 h-4 text-brand" />
                            <span className="text-sm lowercase font-medium">cloudcore</span>
                        </div>
                        <div className="flex items-center gap-8 text-xs text-muted-foreground lowercase font-medium">
                            <a href="https://github.com/ezDecode" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">ezdecode lab</a>
                            <a href="https://github.com/ezDecode/S3Zen-CloudCore" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">open source</a>
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

/**
 * Separator component - diagonal striped pattern
 * Matches ncdai design system exactly
 */
function Separator({ className = '' }) {
    return (
        <div
            className={`relative flex h-10 w-full border-x border-edge ${className}`}
            style={{
                backgroundImage: 'repeating-linear-gradient(315deg, var(--pattern-foreground) 0, var(--pattern-foreground) 1px, transparent 0, transparent 50%)',
                backgroundSize: '10px 10px',
            }}
        >
            <div
                className="absolute -left-[100vw] top-0 w-[200vw] h-full -z-1"
                style={{
                    backgroundImage: 'repeating-linear-gradient(315deg, var(--pattern-foreground) 0, var(--pattern-foreground) 1px, transparent 0, transparent 50%)',
                    backgroundSize: '10px 10px',
                    opacity: 0.56,
                }}
            />
        </div>
    );
}

export default LandingPage;
