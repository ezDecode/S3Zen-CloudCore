import React from 'react';
import { Button } from '../ui/button';
import { Header } from '../layout/Header';
import { Footer } from '../layout/Footer';



export const LandingPage = ({ onGetStarted }) => {
    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/50 w-full">
            <main className="flex min-h-screen flex-col justify-between md:p-16 p-8 bg-background border-x gap-8 max-w-[70rem] w-full">
                <div className="justify-between flex-1 w-full gap-20 flex flex-col">
                    {/* Header */}
                    <Header variant="landing" />

                    {/* Main Content - Vertically centered and left aligned */}
                    <div className="flex flex-col gap-10 my-auto max-w-4xl">
                        <div className="flex flex-col gap-6">
                            <h1 className="md:text-4xl text-3xl font-mono font-medium leading-tight tracking-tighter text-foreground">
                                Faster asset manager for UI Libraries<span className="text-brand">.</span>
                            </h1>
                            <p className="md:text-xl text-lg leading-relaxed text-muted-foreground max-w-full">
                                It&apos;s a client-controlled S3 interface with encrypted access, direct uploads, smart compression, secure sharing, and full control of your buckets.
                            </p>
                        </div>


                        <div className="flex items-center gap-5">
                            <Button
                                variant="brand"
                                size="lg"
                                onClick={onGetStarted}
                            >
                                Launch Interface
                            </Button>
                            <Button
                                variant="default"
                                size="lg"
                                asChild
                            >
                                <a
                                    href="https://github.com/ezDecode/CloudCore"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <img src="/icons/Github.svg" alt="GitHub" className="w-4 h-4 dark:invert" />
                                    Star on GitHub
                                </a>
                            </Button>
                        </div>
                    </div>

                    {/* Footer */}
                    <Footer />
                </div>
            </main>
        </div>
    );
};

export default LandingPage;

