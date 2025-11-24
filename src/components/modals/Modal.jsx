/**
 * Modal Component
 * Reusable modal base component with consistent styling
 */

import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Modal = ({
    isOpen,
    onClose,
    title,
    icon: Icon,
    iconColor = 'text-white',
    children,
    maxWidth = 'max-w-md'
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        onClick={(e) => e.stopPropagation()}
                        className={`bg-zinc-900/98 backdrop-blur-2xl rounded-2xl shadow-2xl w-full ${maxWidth} border border-white/10 z-50 overflow-hidden`}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-white/10">
                            <div className="flex items-center gap-2">
                                {Icon && <Icon className={`w-5 h-5 ${iconColor}`} />}
                                <h2 className="text-lg font-bold text-white">{title}</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-5 space-y-4">
                            {children}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
