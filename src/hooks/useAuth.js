/**
 * useAuth Hook - Supabase Authentication Management
 * Manages user authentication with Supabase Auth
 * Bucket configurations are managed separately after login
 */

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { supabaseAuth } from '../services/supabaseClient';

export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize Supabase auth session on mount
    useEffect(() => {
        const initAuth = async () => {
            try {
                // Get current session
                const { data: { session }, error } = await supabaseAuth.getSession();
                
                if (error) {
                    console.error('Session error:', error);
                    setIsLoading(false);
                    return;
                }

                if (session?.user) {
                    console.log('[Auth] Session restored:', session.user.id);
                    setUser(session.user);
                    setIsLoggedIn(true);
                } else {
                    console.log('[Auth] No active session');
                }
                
                setIsLoading(false);
            } catch (error) {
                console.error('Auth initialization error:', error);
                setIsLoading(false);
            }
        };

        initAuth();

        // Listen for auth state changes
        const { data: { subscription } } = supabaseAuth.onAuthStateChange(async (event, session) => {
            console.log('[Auth] State changed:', event, session ? 'with session' : 'no session');
            
            // Handle all auth events consistently
            if (event === 'SIGNED_IN' && session?.user) {
                setUser(session.user);
                setIsLoggedIn(true);
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
                setIsLoggedIn(false);
            } else if (event === 'TOKEN_REFRESHED' && session?.user) {
                setUser(session.user);
                setIsLoggedIn(true);
            } else if (event === 'INITIAL_SESSION' && session?.user) {
                // Handle INITIAL_SESSION to ensure state is set
                setUser(session.user);
                setIsLoggedIn(true);
            }
        });

        return () => {
            subscription?.unsubscribe();
        };
    }, []);

    // Send OTP to email
    // NOTE: By default, this sends a Magic Link. To send 6-digit OTP codes,
    // modify the email template in Supabase Dashboard to include {{ .Token }}
    // See: docs/SUPABASE_OTP_SETUP.md
    const handleSendOTP = useCallback(async (email) => {
        try {
            // Use signInWithOtp with shouldCreateUser: true
            // This will handle both new and existing users with a single OTP
            const { data, error } = await supabaseAuth.signInWithOtp({
                email,
                options: {
                    shouldCreateUser: true,
                    // Use email type to ensure only one email is sent
                    emailRedirectTo: undefined,
                }
            });

            if (error) throw error;

            toast.success('Verification code sent! Check your email.');
            return { success: true, data };
        } catch (error) {
            const message = error.message || 'Failed to send code';
            toast.error(message);
            throw new Error(message);
        }
    }, []);

    // Verify OTP and sign in
    const handleVerifyOTP = useCallback(async (email, token) => {
        try {
            const { data, error } = await supabaseAuth.verifyOtp({
                email,
                token,
                type: 'email',
            });

            if (error) throw error;

            if (data?.session) {
                toast.success('Welcome to CloudCore!');
                setShowAuthModal(false);
                return { success: true, session: data.session };
            }
        } catch (error) {
            const message = error.message || 'Invalid verification code';
            toast.error(message);
            throw new Error(message);
        }
    }, []);

    // Handle logout
    const handleLogout = useCallback(async () => {
        try {
            const { error } = await supabaseAuth.signOut();
            if (error) throw error;
            
            setUser(null);
            setIsLoggedIn(false);
            toast.info('Logged out successfully');
        } catch (error) {
            console.error('Logout error:', error);
            toast.error('Logout failed');
        }
    }, []);

    // Handle get started
    const handleGetStarted = useCallback(() => {
        setShowAuthModal(true);
    }, []);

    // Get current user JWT token for API calls
    const getAuthToken = useCallback(async () => {
        try {
            const { data: { session } } = await supabaseAuth.getSession();
            return session?.access_token || null;
        } catch (error) {
            console.error('Failed to get auth token:', error);
            return null;
        }
    }, []);

    return {
        user,
        isLoggedIn,
        isLoading,
        showAuthModal,
        setShowAuthModal,
        handleSendOTP,
        handleVerifyOTP,
        handleLogout,
        handleGetStarted,
        getAuthToken
    };
};
