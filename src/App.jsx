/**
 * CloudCore - Simplified Application
 * Neo-Brutalism UI with butter-smooth UX
 * 
 * Flow: Login → Connect Bucket → Upload → Get Links
 */

import { useState, useEffect, useCallback } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import { NeoLandingPage } from './components/neo/NeoLandingPage';
import { NeoDashboard } from './components/neo/NeoDashboard';
import { NeoAuthModal } from './components/neo/NeoAuthModal';
import { NeoBucketSetup } from './components/neo/NeoBucketSetup';
import { NeoToaster } from './components/neo/NeoToaster';
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
    const checkUserBucket = async () => {
      if (!isLoggedIn || !user) {
        setCheckingBucket(false);
        return;
      }

      try {
        setCheckingBucket(true);
        const result = await bucketManagerService.getUserBuckets();

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
        console.error('Failed to check buckets:', error);
        setHasBucket(false);
      } finally {
        setCheckingBucket(false);
      }
    };

    checkUserBucket();
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
        <NeoLandingPage onGetStarted={handleGetStarted} />
        <NeoAuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSendOTP={handleSendOTP}
          onVerifyOTP={handleVerifyOTP}
        />
        <NeoToaster />
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
        <NeoBucketSetup
          user={user}
          onBucketCreated={handleBucketCreated}
          onLogout={handleFullLogout}
          onSkip={() => setShowBucketSetup(false)}
          isFirstTime={!hasBucket}
        />
        <NeoToaster />
      </>
    );
  }

  // Has bucket - show dashboard
  return (
    <>
      <NeoDashboard
        user={user}
        bucket={currentBucket}
        onLogout={handleFullLogout}
        onManageBucket={() => setShowBucketSetup(true)}
      />
      <NeoToaster />
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
