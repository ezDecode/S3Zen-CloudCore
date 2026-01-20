/**
 * Neo-Brutalism Landing Page
 * Bold, raw, unapologetic design with dynamic elements
 */

import { useState, useEffect } from 'react';
import { Cloud, Upload, Link2, Zap, ArrowRight, Github, Sparkles } from 'lucide-react';

export const LandingPage = ({ onGetStarted }) => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({
                x: (e.clientX / window.innerWidth - 0.5) * 20,
                y: (e.clientY / window.innerHeight - 0.5) * 20
            });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className="min-h-screen bg-[var(--color-cream)] overflow-hidden">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--color-cream)]/90 backdrop-blur-sm border-b-4 border-[var(--border-color)]">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[var(--color-primary)] border-3 border-[var(--border-color)] flex items-center justify-center shadow-[3px_3px_0_var(--border-color)]">
                            <Cloud className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-display font-bold text-xl tracking-tight">CloudCore</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <a
                            href="https://github.com/ezDecode/S3Zen-CloudCore"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 border-3 border-[var(--border-color)] bg-white flex items-center justify-center hover:bg-[var(--color-ink)] hover:text-white transition-colors shadow-[3px_3px_0_var(--border-color)]"
                        >
                            <Github className="w-5 h-5" />
                        </a>
                        <button
                            onClick={onGetStarted}
                            className="btn btn-primary btn-sm hidden sm:flex"
                        >
                            Get Started
                        </button>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="min-h-screen flex items-center justify-center relative pt-20 px-6">
                {/* Grid Background */}
                <div className="absolute inset-0 opacity-[0.04]" style={{
                    backgroundImage: `
            linear-gradient(var(--border-color) 2px, transparent 2px),
            linear-gradient(90deg, var(--border-color) 2px, transparent 2px)
          `,
                    backgroundSize: '60px 60px'
                }} />

                {/* Decorative Floating Shapes */}
                <div
                    className="absolute top-32 left-[10%] w-24 h-24 bg-[var(--color-primary)] border-4 border-[var(--border-color)] rotate-12 hidden lg:block shadow-[6px_6px_0_var(--border-color)]"
                    style={{ transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px) rotate(12deg)` }}
                />
                <div
                    className="absolute top-48 right-[15%] w-16 h-16 bg-[var(--color-yellow)] border-4 border-[var(--border-color)] -rotate-6 hidden lg:block shadow-[4px_4px_0_var(--border-color)]"
                    style={{ transform: `translate(${mousePosition.x * -0.3}px, ${mousePosition.y * -0.3}px) rotate(-6deg)` }}
                />
                <div
                    className="absolute bottom-40 left-[20%] w-20 h-20 bg-[var(--color-mint)] border-4 border-[var(--border-color)] rotate-45 hidden lg:block shadow-[5px_5px_0_var(--border-color)]"
                    style={{ transform: `translate(${mousePosition.x * 0.4}px, ${mousePosition.y * 0.4}px) rotate(45deg)` }}
                />
                <div
                    className="absolute bottom-32 right-[12%] w-28 h-28 bg-[var(--color-secondary)] border-4 border-[var(--border-color)] -rotate-12 hidden lg:block shadow-[6px_6px_0_var(--border-color)]"
                    style={{ transform: `translate(${mousePosition.x * -0.6}px, ${mousePosition.y * -0.6}px) rotate(-12deg)` }}
                />

                <div className="relative z-10 max-w-4xl mx-auto text-center">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-yellow)] border-3 border-[var(--border-color)] shadow-[4px_4px_0_var(--border-color)] mb-8">
                        <Sparkles className="w-4 h-4" />
                        <span className="font-display font-bold text-sm uppercase tracking-wide">Simple • Fast • Secure</span>
                    </div>

                    {/* Main Title */}
                    <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold uppercase leading-[0.9] tracking-tight mb-6">
                        Upload to{' '}
                        <span className="relative inline-block">
                            <span className="relative z-10 text-[var(--color-primary)]">S3</span>
                            <span className="absolute bottom-1 left-0 right-0 h-4 bg-[var(--color-primary)]/20 -skew-x-3" />
                        </span>
                        <br />
                        <span className="text-[var(--color-ink)]">Get a Link</span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-lg sm:text-xl text-[var(--color-text-secondary)] max-w-xl mx-auto mb-10 leading-relaxed">
                        Connect your AWS bucket, drag and drop files, instantly get shareable links.
                        <strong className="text-[var(--color-ink)]"> That's it.</strong>
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={onGetStarted}
                            className="btn btn-primary text-lg px-10 py-5 group"
                        >
                            Get Started Free
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <a
                            href="https://github.com/ezDecode/S3Zen-CloudCore"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline text-lg px-10 py-5"
                        >
                            <Github className="w-5 h-5" />
                            View Source
                        </a>
                    </div>

                    {/* Trust Indicators */}
                    <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-[var(--color-text-muted)]">
                        <span className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-[var(--color-success)] rounded-full" />
                            Open Source
                        </span>
                        <span className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-[var(--color-success)] rounded-full" />
                            No Data Collection
                        </span>
                        <span className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-[var(--color-success)] rounded-full" />
                            Your Keys, Your Control
                        </span>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-24 px-6 bg-white border-y-4 border-[var(--border-color)]">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="font-display text-4xl md:text-5xl font-bold uppercase mb-4">
                            How It <span className="bg-[var(--color-primary)] text-white px-3 -rotate-1 inline-block">Works</span>
                        </h2>
                        <p className="text-[var(--color-text-secondary)] text-lg">Three steps. Zero complexity.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
                        {/* Step 1 */}
                        <div className="bg-[var(--color-cream)] border-4 border-[var(--border-color)] p-6 relative shadow-[8px_8px_0_var(--border-color)] hover:shadow-[12px_12px_0_var(--border-color)] hover:-translate-x-1 hover:-translate-y-1 transition-all">
                            <div className="absolute -top-5 -left-5 w-14 h-14 bg-[var(--color-primary)] border-4 border-[var(--border-color)] flex items-center justify-center font-display font-bold text-2xl text-white shadow-[3px_3px_0_var(--border-color)]">
                                1
                            </div>
                            <div className="pt-6">
                                <div className="w-16 h-16 bg-[var(--color-mint)] border-3 border-[var(--border-color)] flex items-center justify-center mb-5 shadow-[4px_4px_0_var(--border-color)]">
                                    <Cloud className="w-8 h-8 text-[var(--color-ink)]" />
                                </div>
                                <h3 className="font-display text-xl font-bold uppercase mb-3">Connect Bucket</h3>
                                <p className="text-[var(--color-text-secondary)] leading-relaxed">
                                    Add your AWS S3 credentials once. We encrypt and store them securely with AES-256.
                                </p>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="bg-[var(--color-cream)] border-4 border-[var(--border-color)] p-6 relative shadow-[8px_8px_0_var(--border-color)] hover:shadow-[12px_12px_0_var(--border-color)] hover:-translate-x-1 hover:-translate-y-1 transition-all md:mt-8">
                            <div className="absolute -top-5 -left-5 w-14 h-14 bg-[var(--color-secondary)] border-4 border-[var(--border-color)] flex items-center justify-center font-display font-bold text-2xl text-white shadow-[3px_3px_0_var(--border-color)]">
                                2
                            </div>
                            <div className="pt-6">
                                <div className="w-16 h-16 bg-[var(--color-yellow)] border-3 border-[var(--border-color)] flex items-center justify-center mb-5 shadow-[4px_4px_0_var(--border-color)]">
                                    <Upload className="w-8 h-8 text-[var(--color-ink)]" />
                                </div>
                                <h3 className="font-display text-xl font-bold uppercase mb-3">Drop Files</h3>
                                <p className="text-[var(--color-text-secondary)] leading-relaxed">
                                    Drag and drop any file. Images auto-compress for faster delivery and smaller storage.
                                </p>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="bg-[var(--color-cream)] border-4 border-[var(--border-color)] p-6 relative shadow-[8px_8px_0_var(--border-color)] hover:shadow-[12px_12px_0_var(--border-color)] hover:-translate-x-1 hover:-translate-y-1 transition-all">
                            <div className="absolute -top-5 -left-5 w-14 h-14 bg-[var(--color-pink)] border-4 border-[var(--border-color)] flex items-center justify-center font-display font-bold text-2xl text-white shadow-[3px_3px_0_var(--border-color)]">
                                3
                            </div>
                            <div className="pt-6">
                                <div className="w-16 h-16 bg-[var(--color-primary-light)] border-3 border-[var(--border-color)] flex items-center justify-center mb-5 shadow-[4px_4px_0_var(--border-color)]">
                                    <Link2 className="w-8 h-8 text-[var(--color-ink)]" />
                                </div>
                                <h3 className="font-display text-xl font-bold uppercase mb-3">Get Link</h3>
                                <p className="text-[var(--color-text-secondary)] leading-relaxed">
                                    Instantly get a shareable pre-signed URL. One click to copy, share anywhere.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Strip */}
            <section className="py-6 bg-[var(--color-ink)] overflow-hidden">
                <div className="flex items-center justify-center gap-8 md:gap-16 flex-wrap px-6 text-[var(--color-cream)]">
                    <span className="flex items-center gap-3 font-display font-bold uppercase">
                        <Zap className="w-5 h-5 text-[var(--color-yellow)]" />
                        Auto Compress
                    </span>
                    <span className="text-[var(--color-cream)]/30 hidden md:block">◆</span>
                    <span className="flex items-center gap-3 font-display font-bold uppercase">
                        <span className="text-[var(--color-mint)]">🔒</span>
                        Encrypted Storage
                    </span>
                    <span className="text-[var(--color-cream)]/30 hidden md:block">◆</span>
                    <span className="flex items-center gap-3 font-display font-bold uppercase">
                        <span className="text-[var(--color-primary)]">⚡</span>
                        Instant URLs
                    </span>
                    <span className="text-[var(--color-cream)]/30 hidden md:block">◆</span>
                    <span className="flex items-center gap-3 font-display font-bold uppercase">
                        <span className="text-[var(--color-secondary-light)]">∞</span>
                        Unlimited Uploads
                    </span>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-6 relative overflow-hidden">
                {/* Dot Pattern */}
                <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: 'radial-gradient(var(--border-color) 2px, transparent 2px)',
                    backgroundSize: '24px 24px'
                }} />

                <div className="max-w-3xl mx-auto text-center relative z-10">
                    <h2 className="font-display text-4xl md:text-6xl font-bold uppercase mb-6 leading-tight">
                        Ready to{' '}
                        <span className="relative inline-block">
                            <span className="relative z-10 bg-[var(--color-primary)] text-white px-4 py-1 -rotate-2 inline-block">Simplify</span>
                        </span>
                        ?
                    </h2>
                    <p className="text-xl text-[var(--color-text-secondary)] mb-10 max-w-lg mx-auto">
                        Stop wrestling with the AWS console. Start uploading in seconds.
                    </p>
                    <button
                        onClick={onGetStarted}
                        className="btn btn-primary text-xl px-12 py-6 group"
                    >
                        Start Uploading Now
                        <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-6 bg-[var(--color-ink)] border-t-4 border-[var(--border-color)]">
                <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[var(--color-primary)] border-2 border-[var(--color-cream)]/20 flex items-center justify-center">
                            <Cloud className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-display font-bold text-[var(--color-cream)] text-lg">CloudCore</span>
                    </div>
                    <div className="flex items-center gap-6 text-[var(--color-cream)]/50 text-sm">
                        <a href="https://github.com/ezDecode" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-cream)] transition-colors">
                            @ezDecode
                        </a>
                        <span>© {new Date().getFullYear()}</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
