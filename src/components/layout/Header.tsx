import React from 'react';
import { Icon } from '@iconify/react';
import { Button } from '../ui/button';

interface HeaderProps {
    variant: 'landing' | 'dashboard';
    bucketName?: string;
    onLogout?: () => void;
    onAddBucket?: () => void;
    onRemoveBucket?: () => void;
    className?: string;
}

export const Header: React.FC<HeaderProps> = ({
    variant,
    bucketName,
    onLogout,
    onAddBucket,
    onRemoveBucket,
    className = ""
}) => {
    const handleThemeToggle = () => {
        document.documentElement.classList.toggle('dark');
    };

    return (
        <header className={`flex items-center justify-between w-full ${className}`}>
            <div className="flex items-center gap-4">
                {/* Desktop Logos */}
                <img src="/logos/orbit-black.svg" alt="Orbit" className="h-8 hidden sm:block dark:hidden" />
                <img src="/logos/orbit-white.svg" alt="Orbit" className="h-8 hidden sm:dark:block" />

                {/* Mobile Logos (icon only) */}
                <img src="/logos/logo-black.svg" alt="Orbit" className="h-8 block sm:hidden dark:hidden" />
                <img src="/logos/logo-white.svg" alt="Orbit" className="h-8 hidden dark:block sm:hidden" />

                {variant === 'dashboard' && (
                    <>
                        <div className="h-6 w-px bg-border/50" />
                        <div className="flex flex-col">
                            <span className="text-sm sm:text-lg text-foreground font-medium">
                                {bucketName || 'No Bucket Connected'}
                            </span>
                        </div>
                    </>
                )}
            </div>

            <div className="flex items-center gap-4 text-sm font-medium">
                {variant === 'landing' && (
                    <a href="/docs" className="hover:text-brand transition-colors hidden sm:block">Docs</a>
                )}

                {variant === 'dashboard' && (
                    <div className="flex items-center gap-2">
                        {bucketName ? (
                            <Button
                                onClick={onRemoveBucket}
                                variant="outline"
                                size="sm"
                                className="text-muted-foreground hover:text-destructive hover:border-destructive/50 h-9 px-4 rounded-xl"
                            >
                                <Icon icon="solar:trash-bin-trash-linear" className="w-4 h-4" />
                                Remove Bucket
                            </Button>
                        ) : (
                            <Button
                                onClick={onAddBucket}
                                variant="brand"
                                size="sm"
                                className="h-9 px-4 rounded-xl"
                            >
                                <Icon icon="solar:add-circle-linear" className="w-4 h-4" />
                                Add Bucket
                            </Button>
                        )}
                    </div>
                )}

                <button
                    className="inline-flex items-center justify-center rounded-md border bg-background shadow-xs hover:bg-accent size-9 transition-all active:scale-95 cursor-pointer text-muted-foreground hover:text-foreground"
                    onClick={handleThemeToggle}
                    aria-label="Toggle theme"
                >
                    <Icon icon="solar:sun-2-linear" className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                    <Icon icon="solar:moon-linear" className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                </button>

                {variant === 'dashboard' && onLogout && (
                    <Button
                        onClick={onLogout}
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                        <Icon icon="solar:logout-2-linear" className="w-5 h-5" />
                    </Button>
                )}
            </div>
        </header>
    );
};
