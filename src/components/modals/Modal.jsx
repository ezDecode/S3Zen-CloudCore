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
    maxWidth = 'max-w-md',
    zIndex = 'z-50'
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div
                    className={`fixed inset-0 ${zIndex} flex items-center justify-center p-4 bg-black/60 backdrop-blur-md`}
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 20 }}
                        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                        onClick={(e) => e.stopPropagation()}
                        className={`bg-[#0a0a0a] backdrop-blur-2xl rounded-2xl shadow-2xl w-full ${maxWidth} border border-white/8 z-50 overflow-hidden`}
                    >
                        {/* Premium Header */}
                        <div className="flex items-center justify-between p-5 border-b border-white/8">
                            <div className="flex items-center gap-2.5">
                                {Icon && <Icon className={`w-5 h-5 ${iconColor}`} />}
                                <h2 className="text-lg font-semibold text-white tracking-tight">{title}</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="touch-target-lg p-2 text-white/40 hover:text-white/80 hover:bg-white/6 rounded-lg transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50"
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
