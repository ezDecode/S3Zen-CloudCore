/**
 * Breadcrumb Component
 * Navigation breadcrumbs for folder hierarchy
 */

import { Home, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const Breadcrumb = ({ currentPath, onNavigate }) => {
    const pathParts = currentPath ? currentPath.split('/').filter(Boolean) : [];

    return (
        <div className="flex items-center gap-1 py-3 px-6 bg-white/5 border-b border-white/10 overflow-x-auto">
            {/* Home */}
            <button
                onClick={() => onNavigate('')}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all"
            >
                <Home className="w-4 h-4" />
                <span className="text-sm font-medium">Home</span>
            </button>

            {/* Path Parts */}
            {pathParts.map((part, index) => {
                const pathUpToHere = pathParts.slice(0, index + 1).join('/') + '/';
                const isLast = index === pathParts.length - 1;

                return (
                    <div key={index} className="flex items-center gap-1">
                        <ChevronRight className="w-4 h-4 text-white/40" />
                        <button
                            onClick={() => !isLast && onNavigate(pathUpToHere)}
                            className={`px-2.5 py-1.5 rounded-lg text-sm font-medium transition-all ${isLast
                                    ? 'text-purple-400 bg-purple-500/10'
                                    : 'text-white/70 hover:text-white hover:bg-white/10'
                                }`}
                            disabled={isLast}
                        >
                            {part}
                        </button>
                    </div>
                );
            })}
        </div>
    );
};
