/**
 * Tooltip Component
 * 
 * A lightweight, accessible tooltip primitive for general use.
 * Uses CSS animations for smooth, non-blocking display.
 */

import { useState, useRef, useEffect, useCallback, createContext, useContext } from 'react';

const TooltipContext = createContext(null);

export const TooltipProvider = ({ children, delayDuration = 200 }) => {
    return (
        <TooltipContext.Provider value={{ delayDuration }}>
            {children}
        </TooltipContext.Provider>
    );
};

export const useTooltipContext = () => {
    const context = useContext(TooltipContext);
    return context || { delayDuration: 200 };
};

export const Tooltip = ({
    children,
    content,
    side = 'top',
    align = 'center',
    sideOffset = 8,
    delayDuration,
    className = '',
    asChild = false,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const triggerRef = useRef(null);
    const tooltipRef = useRef(null);
    const timeoutRef = useRef(null);
    const context = useTooltipContext();
    const delay = delayDuration ?? context.delayDuration;

    // Calculate position
    const updatePosition = useCallback(() => {
        if (!triggerRef.current || !tooltipRef.current) return;

        const triggerRect = triggerRef.current.getBoundingClientRect();
        const tooltipRect = tooltipRef.current.getBoundingClientRect();
        const scrollY = window.scrollY;
        const scrollX = window.scrollX;

        let top = 0;
        let left = 0;

        // Calculate vertical position
        switch (side) {
            case 'top':
                top = triggerRect.top + scrollY - tooltipRect.height - sideOffset;
                break;
            case 'bottom':
                top = triggerRect.bottom + scrollY + sideOffset;
                break;
            case 'left':
                top = triggerRect.top + scrollY + (triggerRect.height - tooltipRect.height) / 2;
                break;
            case 'right':
                top = triggerRect.top + scrollY + (triggerRect.height - tooltipRect.height) / 2;
                break;
        }

        // Calculate horizontal position
        switch (side) {
            case 'top':
            case 'bottom':
                switch (align) {
                    case 'start':
                        left = triggerRect.left + scrollX;
                        break;
                    case 'center':
                        left = triggerRect.left + scrollX + (triggerRect.width - tooltipRect.width) / 2;
                        break;
                    case 'end':
                        left = triggerRect.right + scrollX - tooltipRect.width;
                        break;
                }
                break;
            case 'left':
                left = triggerRect.left + scrollX - tooltipRect.width - sideOffset;
                break;
            case 'right':
                left = triggerRect.right + scrollX + sideOffset;
                break;
        }

        // Keep tooltip within viewport
        const padding = 8;
        left = Math.max(padding, Math.min(left, window.innerWidth - tooltipRect.width - padding));
        top = Math.max(padding, top);

        setPosition({ top, left });
    }, [side, align, sideOffset]);

    useEffect(() => {
        if (isOpen) {
            updatePosition();
            window.addEventListener('scroll', updatePosition, true);
            window.addEventListener('resize', updatePosition);
            return () => {
                window.removeEventListener('scroll', updatePosition, true);
                window.removeEventListener('resize', updatePosition);
            };
        }
    }, [isOpen, updatePosition]);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    const handleOpen = useCallback(() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setIsOpen(true), delay);
    }, [delay]);

    const handleClose = useCallback(() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsOpen(false);
    }, []);

    const triggerProps = {
        ref: triggerRef,
        onMouseEnter: handleOpen,
        onMouseLeave: handleClose,
        onFocus: handleOpen,
        onBlur: handleClose,
        'aria-describedby': isOpen ? 'tooltip' : undefined,
    };

    return (
        <>
            {asChild ? (
                <span {...triggerProps} className="inline-flex">
                    {children}
                </span>
            ) : (
                <span {...triggerProps} className="inline-flex">
                    {children}
                </span>
            )}

            {isOpen && content && (
                <div
                    ref={tooltipRef}
                    role="tooltip"
                    id="tooltip"
                    style={{
                        position: 'fixed',
                        top: position.top,
                        left: position.left,
                        zIndex: 9999,
                    }}
                    className={`
                        px-2.5 py-1.5
                        text-xs font-medium
                        bg-[var(--color-ink)] text-white
                        border-2 border-[var(--border-color)]
                        shadow-[2px_2px_0_var(--border-color)]
                        animate-in fade-in-0 zoom-in-95 duration-100
                        ${className}
                    `}
                >
                    {content}
                </div>
            )}
        </>
    );
};

export default Tooltip;
