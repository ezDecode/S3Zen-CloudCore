/**
 * useAuth Hook - Secure Authentication Management
 * Manages authentication state with encrypted storage
 */

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
    initializeS3Client,
    validateCredentials
} from '../services/aws/s3Service';
import {
    initializeAuth,
    isAuthenticated,
    saveCredentials,
    saveBucketConfig,
    getCredentials,
    getBucketConfig,
    clearAuth,
    isCryptoInitialized
} from '../utils/authUtils';

export const useAuth = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authInitialized, setAuthInitialized] = useState(false);

    // Initialize secure auth system on mount
    useEffect(() => {
        const init = async () => {
            try {
                // Initialize encryption system
                const result = await initializeAuth();
                if (!result.success) {
                    console.error('Failed to initialize auth system:', result.error);
                    toast.error('Security system initialization failed');
                    return;
                }

                setAuthInitialized(true);

                // Check if user was previously authenticated
                if (isAuthenticated()) {
                    const credentials = getCredentials();
                    const bucketConfig = getBucketConfig();

                    if (credentials && bucketConfig) {
                        // Re-initialize S3 client with stored credentials
                        initializeS3Client(
                            credentials,
                            bucketConfig.region,
                            bucketConfig.bucketName
                        );
                        setIsLoggedIn(true);
                    } else {
                        // Clear invalid session
                        clearAuth();
                    }
                }
            } catch (error) {
                console.error('Auth initialization error:', error);
                toast.error('Failed to initialize secure storage');
            }
        };

        init();
    }, []);

    // Handle authentication
    const handleAuthenticate = useCallback(async (formData) => {
        // Ensure auth system is initialized (re-init if needed after logout)
        if (!authInitialized || !isCryptoInitialized()) {
            console.log('Re-initializing auth system...');
            const result = await initializeAuth();
            if (!result.success) {
                throw new Error('Failed to initialize security system. Please refresh.');
            }
            setAuthInitialized(true);
        }

        try {
            const credentials = {
                accessKeyId: formData.accessKeyId,
                secretAccessKey: formData.secretAccessKey,
                sessionToken: formData.sessionToken || null
            };

            // Initialize S3 client
            const initResult = initializeS3Client(
                credentials,
                formData.region,
                formData.bucketName
            );

            if (!initResult.success) {
                throw new Error(initResult.error);
            }

            // Validate credentials with bucket access + STS identity check
            const validateResult = await validateCredentials();
            if (!validateResult.success) {
                throw new Error(validateResult.error);
            }

            // Display identity information
            if (validateResult.identity) {
                console.log('✓ Authenticated as:', validateResult.identity.arn);
            }

            // Save credentials securely (encrypted in memory)
            await saveCredentials(credentials);
            saveBucketConfig(formData.bucketName, formData.region);

            // Success
            setIsLoggedIn(true);
            setShowAuthModal(false);
            toast.success('Connected securely!');
        } catch (error) {
            // Clear any partial state on error
            clearAuth();
            throw new Error(error.message || 'Authentication failed');
        }
    }, [authInitialized]);

    // Handle logout
    const handleLogout = useCallback(() => {
        clearAuth();
        setIsLoggedIn(false);
        toast.info('Logged out - credentials securely cleared');
    }, []);

    // Handle get started
    const handleGetStarted = useCallback(() => {
        if (!authInitialized) {
            toast.error('Please wait for security system to initialize');
            return;
        }
        setShowAuthModal(true);
    }, [authInitialized]);

    return {
        isLoggedIn,
        showAuthModal,
        setShowAuthModal,
        handleAuthenticate,
        handleLogout,
        handleGetStarted,
        authInitialized
    };
};
