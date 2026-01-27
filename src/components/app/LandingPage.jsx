import React from 'react';
import { Sun, Moon, Twitter, Github, Linkedin } from 'lucide-react';
import { Button } from '../ui/button';

export const LandingPage = ({ onGetStarted }) => {
    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/50 font-sans w-full">
            <main className="flex min-h-screen flex-col justify-between md:p-16 p-8 bg-background border-x gap-8 max-w-[70rem] w-full">
                <div className="justify-between flex-1 w-full gap-20 flex flex-col">
                    {/* Header */}
                    <header className="flex items-center justify-between w-full">
                        <div className="flex items-center">
                            <img src="/logos/logo-black.svg" alt="Orbit Logo" className="h-14 block dark:hidden" />
                            <img src="/logos/logo-white.svg" alt="Orbit Logo" className="h-14 hidden dark:block" />
                        </div>
                        <div className="flex items-center gap-4 text-sm font-medium">
                            <a href="/docs" className="hover:text-brand transition-colors">Docs</a>
                            <button
                                className="inline-flex items-center justify-center rounded-md border bg-background shadow-xs hover:bg-accent size-9 transition-all active:scale-95 cursor-pointer"
                                onClick={() => document.documentElement.classList.toggle('dark')}
                            >
                                <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                                <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                                <span className="sr-only">Toggle theme</span>
                            </button>
                        </div>
                    </header>

                    {/* Main Content - Vertically centered and left aligned */}
                    <div className="flex flex-col gap-10 my-auto max-w-4xl">
                        <div className="flex flex-col gap-6">
                            <h1 className="md:text-5xl text-4xl font-sans font-medium leading-tight tracking-tight text-foreground">
                                Orbit — Sovereign S3<span className="text-brand">.</span>
                            </h1>
                            <p className="md:text-xl text-lg leading-relaxed text-muted-foreground max-w-full">
                                A zero-knowledge interface for your own S3. Encrypt locally, upload directly, auto-compress assets, and share with secure links — no vendor lock-in, no tracking, fully open-source.
                            </p>
                        </div>

                        <div className="flex items-center gap-5">
                            <Button
                                onClick={onGetStarted}
                                size="lg"
                            >
                                Launch Interface
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                asChild
                            >
                                <a
                                    href="https://github.com/skaleway/orbit"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Star on GitHub
                                </a>
                            </Button>
                        </div>
                    </div>

                    {/* Footer */}
                    <footer className="w-full flex items-center justify-between pt-8 border-t border-dotted border-border/50">
                        <div className="flex items-center gap-3">
                            <img src="/icon-512.svg" alt="Orbit Icon" className="h-6 w-6" />
                            <p className="text-sm text-muted-foreground">
                                Built with ❤️ by Orbit Team
                            </p>
                        </div>
                        <ul className="flex items-center gap-6">
                            <li><a href="https://twitter.com/skaleway" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-brand transition-all block"><Twitter className="size-5" /></a></li>
                            <li><a href="https://github.com/skaleway" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-brand transition-all block"><Github className="size-5" /></a></li>
                            <li><a href="https://linkedin.com/company/skaleway" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-brand transition-all block"><Linkedin className="size-5" /></a></li>
                        </ul>
                    </footer>
                </div>
            </main>
        </div>
    );
};

export default LandingPage;

