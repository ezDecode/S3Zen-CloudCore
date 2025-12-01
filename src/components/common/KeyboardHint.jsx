/**
 * KEYBOARD HINT - Linear-inspired keyboard shortcut display
 * 
 * Features:
 * - Visual keyboard shortcut indicators
 * - Platform-aware (Cmd on Mac, Ctrl on Windows)
 * - Consistent styling
 */

export const KeyboardHint = ({ keys, className = '' }) => {
    const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    
    const formatKey = (key) => {
        if (key === 'mod') return isMac ? '⌘' : 'Ctrl';
        if (key === 'shift') return '⇧';
        if (key === 'alt') return isMac ? '⌥' : 'Alt';
        if (key === 'enter') return '↵';
        if (key === 'esc') return 'Esc';
        return key.toUpperCase();
    };

    return (
        <div className={`inline-flex items-center gap-1 ${className}`}>
            {keys.map((key, index) => (
                <span key={index}>
                    <kbd className="inline-flex items-center justify-center min-w-[1.5rem] h-6 px-2 text-xs font-normal text-white/70 bg-white/[0.06] border border-white/[0.1] rounded shadow-sm">
                        {formatKey(key)}
                    </kbd>
                    {index < keys.length - 1 && (
                        <span className="mx-1 text-white/40">+</span>
                    )}
                </span>
            ))}
        </div>
    );
};

// Preset shortcuts
export const KeyboardShortcuts = {
    SEARCH: ['mod', 'k'],
    CLOSE: ['esc'],
    SAVE: ['mod', 's'],
    UPLOAD: ['mod', 'u'],
    NEW_FOLDER: ['mod', 'shift', 'n'],
    DELETE: ['del'],
    REFRESH: ['mod', 'r'],
    SELECT_ALL: ['mod', 'a']
};
