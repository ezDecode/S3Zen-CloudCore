/**
 * CloudCore - Simplified Application
 * Neo-Brutalism UI with butter-smooth UX
 * 
 * Flow: Login → Connect Bucket → Upload → Get Links
 */

import { useState, useEffect, useCallback } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import { LandingPage } from './components/app/LandingPage';
import { Dashboard } from './components/app/Dashboard';
import { AuthModal } from './components/app/AuthModal';
import { BucketSetup } from './components/app/BucketSetup';
import { Toaster } from './components/app/Toaster';
import { LoadingScreen } from './components/ui/LoadingScreen';
import { useAuth } from './hooks/useAuth';
import bucketManagerService from './services/bucketManagerService';

interface Bucket {
  id?: string;
  bucket_name?: string;
  bucketName?: string;
  region: string;
  is_default?: boolean;
}

/**
 * Main Application Content
 */
function AppContent() {
  const {
    user,
    isLoggedIn,
    isLoading,
    showAuthModal,
    setShowAuthModal,
    handleSendOTP,
    handleVerifyOTP,
    handleLogout,
    handleGetStarted
  } = useAuth();

  // App states
  const [hasBucket, setHasBucket] = useState(false);
  const [currentBucket, setCurrentBucket] = useState<Bucket | null>(null);
  const [checkingBucket, setCheckingBucket] = useState(true);
  const [showBucketSetup, setShowBucketSetup] = useState(false);



  // Check if user has a bucket configured
  useEffect(() => {
    let isCancelled = false;

    const checkUserBucket = async () => {
      if (!isLoggedIn || !user) {
        setCheckingBucket(false);
        return;
      }

      try {
        setCheckingBucket(true);
        const result = await bucketManagerService.getUserBuckets();

        if (isCancelled) return;

        if (result.success && result.buckets && result.buckets.length > 0) {
          // User has at least one bucket
          const defaultBucket = result.buckets.find((b: Bucket) => b.is_default) || result.buckets[0];
          setCurrentBucket(defaultBucket);
          setHasBucket(true);
        } else {
          setHasBucket(false);
          setShowBucketSetup(true);
        }
      } catch (error) {
        if (isCancelled) return;
        console.error('Failed to check buckets:', error);
        const err = error as { code?: string; message?: string };
        // Don't force bucket setup on error - could be temporary
        if (err.code === 'NO_AUTH' || err.message?.includes('sign in')) {
          // Auth issue - let auth flow handle it
          setHasBucket(false);
        }
      } finally {
        if (!isCancelled) {
          setCheckingBucket(false);
        }
      }
    };

    checkUserBucket();

    return () => { isCancelled = true; };
  }, [isLoggedIn, user]);

  // Handle bucket creation success
  const handleBucketCreated = useCallback((bucket: Bucket) => {
    setCurrentBucket(bucket);
    setHasBucket(true);
    setShowBucketSetup(false);
  }, []);

  // Handle logout - reset states
  const handleFullLogout = useCallback(() => {
    setHasBucket(false);
    setCurrentBucket(null);
    handleLogout();
  }, [handleLogout]);

  // Loading state
  if (isLoading) {
    return <LoadingScreen message="Loading..." />;
  }

  // Not logged in - show landing page
  if (!isLoggedIn) {
    return (
      <>
        <LandingPage onGetStarted={handleGetStarted} />
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSendOTP={handleSendOTP}
          onVerifyOTP={handleVerifyOTP}
        />
        <Toaster />
      </>
    );
  }

  // Checking bucket status
  if (checkingBucket) {
    return <LoadingScreen message="Setting Things Up..." />;
  }

  // No bucket - show bucket setup
  if (!hasBucket || showBucketSetup) {
    return (
      <>
        <BucketSetup
          user={user}
          onComplete={handleBucketCreated}
        />
        <Toaster />
      </>
    );
  }

  // Has bucket - show dashboard
  return (
    <>
      <Dashboard
        user={user}
        bucket={currentBucket}
        onLogout={handleFullLogout}
        onManageBucket={() => setShowBucketSetup(true)}
      />
      <Toaster />
    </>
  );
}

/**
 * Root App with Error Boundary
 */
function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

export default App;
