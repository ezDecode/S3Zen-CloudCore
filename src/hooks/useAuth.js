/**
 * useAuth Hook
 * Manages authentication state and operations
 */

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../components/common/Toast';
import {
    initializeS3Client,
    validateCredentials
} from '../services/aws/s3Service';
import {
    isAuthenticated,
    saveCredentials,
    saveBucketConfig,
    clearAuth
} from '../utils/authUtils';

export const useAuth = () => {
    const toast = useToast();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);

    // Check authentication on mount
    useEffect(() => {
        if (isAuthenticated()) {
            const credentials = JSON.parse(localStorage.getItem('cloudcore_aws_credentials'));
            const bucketName = localStorage.getItem('cloudcore_bucket_name');
            const region = localStorage.getItem('cloudcore_region');

            if (credentials && bucketName && region) {
                initializeS3Client(credentials, region, bucketName);
                setIsLoggedIn(true);
            } else {
                clearAuth();
            }
        }
    }, []);

    // Handle authentication
    const handleAuthenticate = useCallback(async (formData) => {
        try {
            // Initialize S3 client
            const initResult = initializeS3Client(
                {
                    accessKeyId: formData.accessKeyId,
                    secretAccessKey: formData.secretAccessKey,
                    sessionToken: formData.sessionToken
                },
                formData.region,
                formData.bucketName
            );

            if (!initResult.success) {
                throw new Error(initResult.error);
            }

            // Validate credentials
            const validateResult = await validateCredentials();
            if (!validateResult.success) {
                throw new Error(validateResult.error);
            }

            // Save credentials and config
            saveCredentials({
                accessKeyId: formData.accessKeyId,
                secretAccessKey: formData.secretAccessKey,
                sessionToken: formData.sessionToken
            });
            saveBucketConfig(formData.bucketName, formData.region);

            // Success
            setIsLoggedIn(true);
            setShowAuthModal(false);
            toast.success('Connected successfully!');
        } catch (error) {
            throw new Error(error.message || 'Authentication failed');
        }
    }, [toast]);

    // Handle logout
    const handleLogout = useCallback(() => {
        clearAuth();
        setIsLoggedIn(false);
        toast.info('Logged out');
    }, [toast]);

    // Handle get started
    const handleGetStarted = useCallback(() => {
        setShowAuthModal(true);
    }, []);

    return {
        isLoggedIn,
        showAuthModal,
        setShowAuthModal,
        handleAuthenticate,
        handleLogout,
        handleGetStarted
    };
};
