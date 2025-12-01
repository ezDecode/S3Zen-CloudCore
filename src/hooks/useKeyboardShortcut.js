import { useEffect } from 'react';

/**
 * KEYBOARD SHORTCUT HOOK - Linear-inspired keyboard navigation
 * 
 * Usage:
 * useKeyboardShortcut(['mod', 'k'], () => openSearch());
 */

export const useKeyboardShortcut = (keys, callback, options = {}) => {
    const { enabled = true, preventDefault = true } = options;

    useEffect(() => {
        if (!enabled) return;

        const handleKeyDown = (event) => {
            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const modKey = isMac ? event.metaKey : event.ctrlKey;

            const keyMap = {
                'mod': modKey,
                'ctrl': event.ctrlKey,
                'shift': event.shiftKey,
                'alt': event.altKey,
                'meta': event.metaKey
            };

            // Check if all keys match
            const allKeysMatch = keys.every(key => {
                if (keyMap[key.toLowerCase()] !== undefined) {
                    return keyMap[key.toLowerCase()];
                }
                return event.key.toLowerCase() === key.toLowerCase();
            });

            if (allKeysMatch) {
                if (preventDefault) {
                    event.preventDefault();
                }
                callback(event);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [keys, callback, enabled, preventDefault]);
};
