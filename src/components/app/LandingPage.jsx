import React from 'react';
import { Sun, Moon, Linkedin } from 'lucide-react';
import { Button } from '../ui/button';

const TwitterIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" className={className} fill="currentColor">
        <path d="m9.237 7.004l4.84-5.505H12.93L8.727 6.28L5.371 1.5H1.5l5.075 7.228L1.5 14.499h1.147l4.437-5.047l3.545 5.047H14.5zM7.666 8.791l-.514-.72L3.06 2.344h1.762l3.302 4.622l.514.72l4.292 6.007h-1.761z" />
    </svg>
);

const GithubIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" className={className} fill="currentColor">
        <path fillRule="evenodd" clipRule="evenodd" d="M7.976 0A7.977 7.977 0 0 0 0 7.976c0 3.523 2.3 6.507 5.431 7.584c.392.049.538-.196.538-.392v-1.37c-2.201.49-2.69-1.076-2.69-1.076c-.343-.93-.881-1.175-.881-1.175c-.734-.489.048-.489.048-.489c.783.049 1.224.832 1.224.832c.734 1.223 1.859.88 2.3.685c.048-.538.293-.88.489-1.076c-1.762-.196-3.621-.881-3.621-3.964c0-.88.293-1.566.832-2.153c-.05-.147-.343-.978.098-2.055c0 0 .685-.195 2.201.832c.636-.196 1.322-.245 2.007-.245s1.37.098 2.006.245c1.517-1.027 2.202-.832 2.202-.832c.44 1.077.146 1.908.097 2.104a3.16 3.16 0 0 1 .832 2.153c0 3.083-1.86 3.719-3.62 3.915c.293.244.538.733.538 1.467v2.202c0 .196.146.44.538.392A7.98 7.98 0 0 0 16 7.976C15.951 3.572 12.38 0 7.976 0" />
    </svg>
);

export const LandingPage = ({ onGetStarted }) => {
    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/50 w-full">
            <main className="flex min-h-screen flex-col justify-between md:p-16 p-8 bg-background border-x gap-8 max-w-[70rem] w-full">
                <div className="justify-between flex-1 w-full gap-20 flex flex-col">
                    {/* Header */}
                    <header className="flex items-center justify-between w-full">
                        <div className="flex items-center">
                            <img src="/logos/logo-black.svg" alt="Orbit Logo" className="h-8 block dark:hidden" />
                            <img src="/logos/logo-white.svg" alt="Orbit Logo" className="h-8 hidden dark:block" />
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
                            <h1 className="md:text-4xl text-3xl font-mono font-medium leading-tight tracking-tighter text-foreground">
                                Faster asset manager for UI Libraries<span className="text-brand">.</span>
                            </h1>
                            <p className="md:text-xl text-lg leading-relaxed text-muted-foreground max-w-full">
                                It&apos;s a client-controlled S3 interface with encrypted access, direct uploads, smart compression, secure sharing, and full control of your buckets.
                            </p>
                        </div>

                        <div className="flex items-center gap-5">
                            <Button
                                onClick={onGetStarted}
                                variant="brand"
                                size="launch"
                            >
                                Launch Interface
                            </Button>
                            <Button
                                variant="default"
                                size="launch"
                                asChild
                            >
                                <a
                                    href="https://github.com/ezDecode/CloudCore"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <GithubIcon className="w-4 h-4" />
                                    Star on GitHub
                                </a>
                            </Button>
                        </div>
                    </div>

                    {/* Footer */}
                    <footer className="w-full flex items-center justify-between pt-8 border-t border-dotted border-border/50">
                        <div className="flex items-center gap-3">
                            <p className="text-sm text-muted-foreground">
                                Built with ❤️ by Orbit Team
                            </p>
                        </div>
                        <ul className="flex items-center gap-2">
                            <li><a href="https://twitter.com/ezDecode" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-brand transition-all block"><TwitterIcon className="w-5 h-5" /></a></li>
                            <li><a href="https://github.com/ezDecode" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-brand transition-all block"><GithubIcon className="w-5 h-5" /></a></li>
                            {/* <li><a href="https://linkedin.com/company/noname" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-brand transition-all block"><Linkedin className="size-5" /></a></li> */}
                        </ul>
                    </footer>
                </div>
            </main>
        </div>
    );
};

export default LandingPage;

