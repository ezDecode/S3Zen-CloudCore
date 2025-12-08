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
                    setUser(session.user);
                    setIsLoggedIn(true);
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
            console.log('Auth state changed:', event);
            
            // Only update state for actual sign in/out events, not initial session
            if (event === 'SIGNED_IN' && session?.user) {
                setUser(session.user);
                setIsLoggedIn(true);
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
                setIsLoggedIn(false);
            } else if (event === 'TOKEN_REFRESHED' && session?.user) {
                setUser(session.user);
                setIsLoggedIn(true);
            }
            // Ignore INITIAL_SESSION to prevent premature logout
        });

        return () => {
            subscription?.unsubscribe();
        };
    }, []);

    // Sign up new user
    const handleSignUp = useCallback(async (email, password) => {
        try {
            const { data, error } = await supabaseAuth.signUp({
                email,
                password,
                options: {
                    // Skip email confirmation for development
                    emailRedirectTo: window.location.origin,
                }
            });

            if (error) throw error;

            if (data?.user) {
                // Check if email confirmation is required
                if (data.session) {
                    toast.success('Account created successfully!');
                    setShowAuthModal(false);
                } else {
                    toast.success('Account created! Please check your email to verify.');
                }
                return { success: true, user: data.user };
            }
        } catch (error) {
            const message = error.message || 'Sign up failed';
            toast.error(message);
            throw new Error(message);
        }
    }, []);

    // Sign in existing user
    const handleSignIn = useCallback(async (email, password) => {
        try {
            const { data, error } = await supabaseAuth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            if (data?.user) {
                toast.success('Welcome back!');
                setShowAuthModal(false);
                return { success: true, user: data.user };
            }
        } catch (error) {
            const message = error.message || 'Sign in failed';
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
        handleSignUp,
        handleSignIn,
        handleLogout,
        handleGetStarted,
        getAuthToken
    };
};
