import React, { lazy, Suspense } from 'react';
import { Button } from '../ui/button';
import { Header } from '../layout/Header';
import { Footer } from '../layout/Footer';

const FlickeringGrid = lazy(() => import('../ui/flickering-grid').then(module => ({ default: module.FlickeringGrid })));

export const LandingPage = ({ onGetStarted }) => {
    return (
        <div className="relative flex min-h-screen items-center justify-center bg-background w-full">
            <Suspense fallback={null}>
                <FlickeringGrid
                    className="absolute inset-0 z-0 [mask-image:radial-gradient(450px_circle_at_center,white,transparent)]"
                    squareSize={4}
                    gridGap={6}
                    color="#60a5fa"
                    maxOpacity={0.5}
                    flickerChance={0.1}
                />
            </Suspense>
            <main className="relative z-10 flex min-h-screen flex-col justify-between md:p-16 p-8 gap-8 w-full max-w-[1200px] xl:max-w-[60vw] mx-auto">
                <div className="justify-between flex-1 w-full gap-20 flex flex-col">
                    {/* Header */}
                    <Header variant="landing" />

                    {/* Main Content - Vertically centered and left aligned */}
                    <div className="flex flex-col gap-10 my-auto max-w-4xl">
                        <div className="flex flex-col gap-6">
                            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif font-medium leading-tight tracking-tight text-foreground">
                                Faster <span className="italic text-brand inline">asset manager</span> <br className="lg:hidden" /> for UI Libraries<span className="text-brand">.</span>
                            </h1>
                            <p className="md:text-xl text-lg leading-relaxed text-muted-foreground max-w-full">
                                It&apos;s a client-controlled S3 interface with encrypted access, direct uploads, smart compression, secure sharing, and full control of your buckets.
                            </p>
                        </div>


                        <div className="flex items-center gap-3">
                            <Button
                                variant="brand"
                                size="launch"
                                onClick={onGetStarted}
                                className="rounded-xl"
                            >
                                Launch Interface
                            </Button>
                            <Button
                                variant="outline"
                                size="default"
                                className="rounded-xl"
                                asChild
                            >
                                <a
                                    href="https://github.com/ezDecode/CloudCore"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <img src="/icons/Github.svg" alt="GitHub" className="w-5 h-5 dark:invert" />
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

