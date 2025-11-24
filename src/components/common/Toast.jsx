/**
 * Toast Notification System
 * Inspired by BuildUI's animated toast recipe
 * Custom implementation without Radix UI dependency
 */

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckmarkCircle02Icon, CancelCircleIcon, Alert01Icon, InformationCircleIcon, Cancel01Icon } from 'hugeicons-react';

// Toast Context
const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};

// Toast Provider Component
export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 2500) => {
        const id = window.crypto.randomUUID?.() || Date.now() + Math.random();
        const toast = { id, message, type, duration };

        setToasts(prev => [...prev, toast]);

        // Auto remove after duration
        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }

        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const toast = {
        success: (message, duration) => addToast(message, 'success', duration),
        error: (message, duration) => addToast(message, 'error', duration),
        info: (message, duration) => addToast(message, 'info', duration),
        warning: (message, duration) => addToast(message, 'warning', duration),
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </ToastContext.Provider>
    );
};

// Toast Container Component  
const ToastContainer = ({ toasts, onRemove }) => {
    return (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:bottom-6 sm:right-6 z-[100] flex w-full sm:w-80 flex-col-reverse gap-3 pointer-events-none">
            <AnimatePresence mode="popLayout">
                {toasts.map((toast) => (
                    <ToastItem
                        key={toast.id}
                        toast={toast}
                        onRemove={() => onRemove(toast.id)}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
};

// Individual Toast Item Component
const ToastItem = ({ toast, onRemove }) => {
    const { message, type, duration } = toast;
    const [progress, setProgress] = useState(100);

    const width = 320; // 80 * 4 = 320px (w-80)
    const margin = 16;

    // Progress bar countdown
    useEffect(() => {
        if (!duration || duration <= 0) return;

        const interval = setInterval(() => {
            setProgress(prev => {
                const newProgress = prev - (100 / (duration / 50));
                return newProgress > 0 ? newProgress : 0;
            });
        }, 50);

        return () => clearInterval(interval);
    }, [duration]);

    const config = {
        success: {
            icon: CheckmarkCircle02Icon,
            bgColor: 'bg-gradient-to-br from-green-500/10 to-green-600/10',
            borderColor: 'border-green-500/30',
            iconColor: 'text-green-400',
            textColor: 'text-green-100',
            progressColor: 'bg-green-500'
        },
        error: {
            icon: CancelCircleIcon,
            bgColor: 'bg-gradient-to-br from-red-500/10 to-red-600/10',
            borderColor: 'border-red-500/30',
            iconColor: 'text-red-400',
            textColor: 'text-red-100',
            progressColor: 'bg-red-500'
        },
        warning: {
            icon: Alert01Icon,
            bgColor: 'bg-gradient-to-br from-yellow-500/10 to-yellow-600/10',
            borderColor: 'border-yellow-500/30',
            iconColor: 'text-yellow-400',
            textColor: 'text-yellow-100',
            progressColor: 'bg-yellow-500'
        },
        info: {
            icon: InformationCircleIcon,
            bgColor: 'bg-gradient-to-br from-blue-500/10 to-blue-600/10',
            borderColor: 'border-blue-500/30',
            iconColor: 'text-blue-400',
            textColor: 'text-blue-100',
            progressColor: 'bg-blue-500'
        }
    };

    const { icon: Icon, bgColor, borderColor, iconColor, textColor, progressColor } = config[type] || config.info;

    return (
        <motion.div
            layout
            initial={{ x: width + margin }}
            animate={{ x: 0 }}
            exit={{
                opacity: 0,
                zIndex: -1,
                transition: {
                    opacity: { duration: 0.2 }
                }
            }}
            transition={{
                type: 'spring',
                mass: 1,
                damping: 30,
                stiffness: 200
            }}
            style={{
                width,
                WebkitTapHighlightColor: 'transparent'
            }}
            className="pointer-events-auto"
        >
            <div className={`
                flex flex-col overflow-hidden rounded-xl border shadow-2xl backdrop-blur-2xl
                ${bgColor} ${borderColor}
            `}>
                {/* Content */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 p-4 flex-1 min-w-0">
                        <Icon className={`w-5 h-5 shrink-0 ${iconColor}`} />
                        <p className={`text-sm font-medium truncate ${textColor}`}>
                            {message}
                        </p>
                    </div>
                    <button
                        onClick={onRemove}
                        className="border-l border-white/10 p-4 text-white/40 transition-all hover:bg-white/10 hover:text-white active:text-white"
                    >
                        <Cancel01Icon className="w-5 h-5" />
                    </button>
                </div>

                {/* Progress Bar */}
                {duration > 0 && (
                    <div className="h-1 w-full bg-white/5">
                        <motion.div
                            className={`h-full ${progressColor}`}
                            initial={{ width: '100%' }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.1, ease: 'linear' }}
                        />
                    </div>
                )}
            </div>
        </motion.div>
    );
};

// Export a simple toast object for backwards compatibility
export const toast = {
    success: (message) => console.warn('Toast not initialized. Wrap app in ToastProvider.'),
    error: (message) => console.warn('Toast not initialized. Wrap app in ToastProvider.'),
    info: (message) => console.warn('Toast not initialized. Wrap app in ToastProvider.'),
    warning: (message) => console.warn('Toast not initialized. Wrap app in ToastProvider.'),
};
