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
import { useAuth } from './hooks/useAuth';
import bucketManagerService from './services/bucketManagerService';

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
  const [currentBucket, setCurrentBucket] = useState(null);
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
          const defaultBucket = result.buckets.find(b => b.is_default) || result.buckets[0];
          setCurrentBucket(defaultBucket);
          setHasBucket(true);
        } else {
          setHasBucket(false);
          setShowBucketSetup(true);
        }
      } catch (error) {
        if (isCancelled) return;
        console.error('Failed to check buckets:', error);
        // Don't force bucket setup on error - could be temporary
        if (error.code === 'NO_AUTH' || error.message?.includes('sign in')) {
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
  const handleBucketCreated = useCallback((bucket) => {
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
    return (
      <div className="min-h-screen bg-[var(--color-cream)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[var(--border-color)] border-t-[var(--color-primary)] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-display text-lg font-bold uppercase tracking-wide">Loading...</p>
        </div>
      </div>
    );
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
    return (
      <div className="min-h-screen bg-[var(--color-cream)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[var(--border-color)] border-t-[var(--color-secondary)] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-display text-lg font-bold uppercase tracking-wide">Setting things up...</p>
        </div>
      </div>
    );
  }

  // No bucket - show bucket setup
  if (!hasBucket || showBucketSetup) {
    return (
      <>
        <BucketSetup
          user={user}
          onBucketCreated={handleBucketCreated}
          onLogout={handleFullLogout}
          onSkip={() => setShowBucketSetup(false)}
          isFirstTime={!hasBucket}
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
