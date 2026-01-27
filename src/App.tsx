/**
 * Orbit - Simplified Application
 * Neo-Brutalism UI with butter-smooth UX
 * 
 * Flow: Login → Connect Bucket → Upload → Get Links
 */

import { useState, useEffect, useCallback } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import { LandingPage } from './components/app/LandingPage';
import Dashboard from './components/app/Dashboard';
import { AuthModal } from './components/app/AuthModal';
import { BucketSetup } from './components/app/BucketSetup';
import { DisconnectModal } from './components/app/DisconnectModal';
import { LoadingScreen } from './components/ui/LoadingScreen';
import { useAuth } from './hooks/useAuth';
import bucketManagerService from './services/bucketManagerService';
import { toast } from 'sonner';

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
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);



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

  const handleFullLogout = useCallback(() => {
    setHasBucket(false);
    setCurrentBucket(null);
    handleLogout();
  }, [handleLogout]);

  // Handle bucket disconnect (logical removal)
  const handleConfirmDisconnect = useCallback(() => {
    setHasBucket(false);
    setCurrentBucket(null);
    setShowDisconnectModal(false);
    localStorage.removeItem('orbit_files_cache'); // Clear cache on disconnect
    toast.success('Bucket disconnected');
  }, []);

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
      </>
    );
  }

  // Checking bucket status
  if (checkingBucket) {
    return <LoadingScreen message="Setting Things Up..." />;
  }

  // Has bucket or is setting up - show dashboard as base
  return (
    <>
      <Dashboard
        user={user}
        bucket={currentBucket}
        onLogout={handleFullLogout}
        onAddBucket={() => setShowBucketSetup(true)}
        onRemoveBucket={() => setShowDisconnectModal(true)}
      />

      {/* Show Bucket Setup as Modal Overlay if needed */}
      {(showBucketSetup || !hasBucket) && (
        <BucketSetup
          user={user}
          onComplete={handleBucketCreated}
          onBack={hasBucket ? () => setShowBucketSetup(false) : undefined}
        />
      )}


      <DisconnectModal
        isOpen={showDisconnectModal}
        onClose={() => setShowDisconnectModal(false)}
        onConfirm={handleConfirmDisconnect}
        bucketName={currentBucket?.bucket_name || currentBucket?.bucketName || 'this bucket'}
      />
    </>
  );
}

/**
 * Root App with Error Boundary
 */
function App() {
  return (
    <div className="min-h-screen bg-background flex justify-center selection:bg-brand/20 selection:text-brand">
      <ErrorBoundary>
        <AppContent />
      </ErrorBoundary>
    </div>
  );
}

export default App;
