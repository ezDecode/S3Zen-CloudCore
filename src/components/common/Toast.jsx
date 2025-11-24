/**
 * Toast Notification System
 * Custom toast notifications positioned at bottom-right
 */

import { createContext, useContext, useState, useCallback } from 'react';
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

    const addToast = useCallback((message, type = 'info', duration = 2000) => {
        const id = Date.now() + Math.random();
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
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:bottom-6 sm:right-6 sm:w-auto z-[100] flex flex-col-reverse gap-2 pointer-events-none max-h-[80vh] overflow-hidden">
            <AnimatePresence mode="popLayout">
                {toasts.map((toast, index) => (
                    <ToastItem
                        key={toast.id}
                        toast={toast}
                        index={index}
                        total={toasts.length}
                        onRemove={() => onRemove(toast.id)}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
};

// Individual Toast Item Component
const ToastItem = ({ toast, index, total, onRemove }) => {
    const { message, type } = toast;

    // Calculate stacking effect
    const isStacked = index < total - 1;
    const stackOffset = Math.min(index * 4, 12); // Max 12px offset
    const stackScale = 1 - Math.min(index * 0.03, 0.09); // Max 9% scale reduction
    const stackOpacity = 1 - Math.min(index * 0.15, 0.45); // Max 45% opacity reduction

    const config = {
        success: {
            icon: CheckmarkCircle02Icon,
            bgColor: 'bg-green-500/10',
            borderColor: 'border-green-500/30',
            iconColor: 'text-green-400',
            textColor: 'text-green-100'
        },
        error: {
            icon: CancelCircleIcon,
            bgColor: 'bg-red-500/10',
            borderColor: 'border-red-500/30',
            iconColor: 'text-red-400',
            textColor: 'text-red-100'
        },
        warning: {
            icon: Alert01Icon,
            bgColor: 'bg-yellow-500/10',
            borderColor: 'border-yellow-500/30',
            iconColor: 'text-yellow-400',
            textColor: 'text-yellow-100'
        },
        info: {
            icon: InformationCircleIcon,
            bgColor: 'bg-blue-500/10',
            borderColor: 'border-blue-500/30',
            iconColor: 'text-blue-400',
            textColor: 'text-blue-100'
        }
    };

    const { icon: Icon, bgColor, borderColor, iconColor, textColor } = config[type] || config.info;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{
                opacity: 1,
                y: isStacked ? -stackOffset : 0,
                scale: isStacked ? stackScale : 1
            }}
            exit={{ opacity: 0, scale: 0.9, x: 100, transition: { duration: 0.15 } }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="pointer-events-auto"
            style={{
                zIndex: 100 - index,
                opacity: stackOpacity
            }}
        >
            <div className={`
                flex items-center gap-3 w-full sm:w-auto sm:min-w-[320px] max-w-md
                px-4 py-3.5 rounded-xl border
                backdrop-blur-2xl shadow-2xl
                ${bgColor} ${borderColor}
                ${isStacked ? 'shadow-xl' : 'shadow-2xl'}
            `}>
                <Icon className={`w-5 h-5 shrink-0 ${iconColor}`} />
                <p className={`text-sm font-medium flex-1 ${textColor}`}>
                    {message}
                </p>
                {!isStacked && (
                    <button
                        onClick={onRemove}
                        className="p-1 text-white/40 hover:text-white hover:bg-white/10 rounded-md transition-all"
                    >
                        <Cancel01Icon className="w-4 h-4" />
                    </button>
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
