/**
 * Session Timeout Hook
 * Monitors user activity and handles session timeout
 */

import { useEffect, useCallback, useRef } from 'react';
import { isSessionExpired, updateSessionTimestamp, clearAuth } from '../utils/authUtils';

const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
const CHECK_INTERVAL_MS = 60000; // Check every minute

export const useSessionTimeout = (onTimeout, isEnabled = true) => {
    const timeoutCheckRef = useRef(null);
    const activityListenersRef = useRef([]);

    /**
     * Handle user activity
     */
    const handleActivity = useCallback(() => {
        if (isEnabled) {
            updateSessionTimestamp();
        }
    }, [isEnabled]);

    /**
     * Check session status
     */
    const checkSession = useCallback(() => {
        if (!isEnabled) return;

        if (isSessionExpired()) {
            clearAuth();
            if (onTimeout) {
                onTimeout();
            }
        }
    }, [onTimeout, isEnabled]);

    /**
     * Setup activity listeners
     */
    useEffect(() => {
        if (!isEnabled) return;

        // Add activity event listeners
        ACTIVITY_EVENTS.forEach(event => {
            window.addEventListener(event, handleActivity);
        });

        // Setup interval to check session
        timeoutCheckRef.current = setInterval(checkSession, CHECK_INTERVAL_MS);

        // Initial check
        checkSession();

        // Cleanup
        return () => {
            // Remove activity listeners
            ACTIVITY_EVENTS.forEach(event => {
                window.removeEventListener(event, handleActivity);
            });

            // Clear interval
            if (timeoutCheckRef.current) {
                clearInterval(timeoutCheckRef.current);
            }
        };
    }, [handleActivity, checkSession, isEnabled]);

    return {
        checkSession,
        updateSession: updateSessionTimestamp
    };
};
