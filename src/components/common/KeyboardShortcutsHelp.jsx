/**
 * KeyboardShortcutsHelp Component
 * Displays available keyboard shortcuts
 */

import { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Keyboard01Icon, Cancel01Icon } from 'hugeicons-react';
import { KEYBOARD_SHORTCUTS } from '../../hooks/useKeyboardShortcuts';

export const KeyboardShortcutsHelp = memo(({ isOpen, onClose }) => {
    const isMac = typeof navigator !== 'undefined' && 
                  navigator.platform.toUpperCase().indexOf('MAC') >= 0;

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div 
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-zinc-900/98 backdrop-blur-2xl rounded-2xl shadow-2xl w-full max-w-md border border-white/10 overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-5 border-b border-white/10">
                        <div className="flex items-center gap-2">
                            <Keyboard01Icon className="w-5 h-5 text-blue-400" />
                            <h2 className="text-lg font-bold text-white">Keyboard Shortcuts</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                        >
                            <Cancel01Icon className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar">
                        {KEYBOARD_SHORTCUTS.map((shortcut, index) => (
                            <div 
                                key={index}
                                className="flex items-center justify-between py-2"
                            >
                                <span className="text-sm text-zinc-300">
                                    {shortcut.action}
                                </span>
                                <div className="flex items-center gap-1">
                                    {(isMac ? shortcut.mac : shortcut.keys).map((key, keyIndex) => (
                                        <kbd
                                            key={keyIndex}
                                            className="px-2 py-1 text-xs font-mono bg-white/10 border border-white/20 rounded text-zinc-300"
                                        >
                                            {key}
                                        </kbd>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-white/10 bg-white/5">
                        <p className="text-xs text-zinc-500 text-center">
                            Press <kbd className="px-1.5 py-0.5 text-xs bg-white/10 rounded">?</kbd> to toggle this help
                        </p>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
});

// Toggle button for keyboard shortcuts
export const KeyboardShortcutsButton = memo(({ onClick }) => {
    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
            title="Keyboard shortcuts"
        >
            <Keyboard01Icon className="w-4 h-4 text-zinc-400" />
        </motion.button>
    );
});

KeyboardShortcutsHelp.displayName = 'KeyboardShortcutsHelp';
KeyboardShortcutsButton.displayName = 'KeyboardShortcutsButton';
