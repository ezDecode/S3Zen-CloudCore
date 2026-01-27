import React from 'react';

interface FooterProps {
    className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className = "" }) => {
    return (
        <footer className={`w-full flex items-center justify-between pt-8 border-t border-dotted border-border/50 ${className}`}>
            <div className="flex items-center gap-3">
                <p className="text-sm text-muted-foreground">
                    Built with ❤️ by Orbit Team
                </p>
            </div>
            <ul className="flex items-center gap-2 sm:gap-6">
                <li>
                    <a href="https://twitter.com/ezDecode" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-all block">
                        <img src="/icons/Twitter.svg" alt="Twitter" className="w-5 h-5 dark:invert opacity-70 hover:opacity-100 transition-opacity" />
                    </a>
                </li>
                <li>
                    <a href="https://github.com/ezDecode" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-all block">
                        <img src="/icons/Github.svg" alt="GitHub" className="w-5 h-5 dark:invert opacity-70 hover:opacity-100 transition-opacity" />
                    </a>
                </li>
            </ul>
        </footer>
    );
};
