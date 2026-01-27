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
  display_name?: string;
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
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [activeUploads, setActiveUploads] = useState(0);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [showSetupForced, setShowSetupForced] = useState(false);



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
    setShowSetupForced(false);

    // If there were pending files, Dashboard will pick them up via prop
    if (pendingFiles.length > 0) {
      toast.success(`Connected to ${bucket.display_name || bucket.bucket_name}. Starting ${pendingFiles.length} pending uploads...`);
    }
  }, [pendingFiles]);

  const handlePendingUpload = useCallback((files: File[]) => {
    setPendingFiles(prev => [...prev, ...files]);
    setShowBucketSetup(true);
    setShowSetupForced(true);
    toast.info('Please connect a bucket to start your upload');
  }, []);

  const handleUploadComplete = useCallback(() => {
    setPendingFiles([]);
  }, []);

  const handleFullLogout = useCallback(() => {
    setHasBucket(false);
    setCurrentBucket(null);
    handleLogout();
  }, [handleLogout]);

  // Handle bucket disconnect (logical removal)
  const handleConfirmDisconnect = useCallback(async () => {
    if (!currentBucket?.id) return;

    try {
      setIsDisconnecting(true);
      const result = await bucketManagerService.deleteBucket(currentBucket.id);

      if (result.success) {
        localStorage.removeItem('orbit_files_cache'); // Clear cache on disconnect

        if (result.newDefault) {
          // Successfully deleted, and a new bucket was promoted to default
          try {
            const bucketResult = await bucketManagerService.getBucket(result.newDefault.id);
            if (bucketResult.success && bucketResult.bucket) {
              setCurrentBucket(bucketResult.bucket);
              setHasBucket(true);
              toast.success(`Switched to ${bucketResult.bucket.display_name || bucketResult.bucket.bucket_name}`);
            } else {
              throw new Error('Failed to fetch promoted bucket info');
            }
          } catch (promotionError) {
            console.error('Promotion fetch failed, reloading all buckets:', promotionError);
            const refreshResult = await bucketManagerService.getUserBuckets();
            if (refreshResult.success && refreshResult.buckets && refreshResult.buckets.length > 0) {
              const nextBucket = refreshResult.buckets.find((b: Bucket) => b.is_default) || refreshResult.buckets[0];
              setCurrentBucket(nextBucket);
              setHasBucket(true);
            } else {
              setHasBucket(false);
              setCurrentBucket(null);
              setShowBucketSetup(true);
            }
          }
        } else {
          // No more buckets left
          setHasBucket(false);
          setCurrentBucket(null);
          setShowBucketSetup(true);
        }

        toast.success('Bucket disconnected');
      } else {
        toast.error(result.error || 'Failed to disconnect bucket');
      }
    } catch (error) {
      console.error('Disconnect error:', error);
      toast.error('An unexpected error occurred during disconnection');
    } finally {
      setIsDisconnecting(false);
      setShowDisconnectModal(false);
    }
  }, [currentBucket]);

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
        onRemoveBucket={() => {
          setShowDisconnectModal(true);
        }}
        onUploadsChange={setActiveUploads}
        pendingFiles={pendingFiles}
        onPendingUpload={handlePendingUpload}
        onUploadComplete={handleUploadComplete}
      />

      {/* Show Bucket Setup as Modal Overlay if needed */}
      {(showBucketSetup || (!hasBucket && showSetupForced)) && (
        <BucketSetup
          user={user}
          onComplete={handleBucketCreated}
          onBack={() => {
            setShowBucketSetup(false);
            setShowSetupForced(false);
          }}
        />
      )}


      <DisconnectModal
        isOpen={showDisconnectModal}
        onClose={() => setShowDisconnectModal(false)}
        onConfirm={handleConfirmDisconnect}
        isLoading={isDisconnecting}
        bucketName={currentBucket?.display_name || currentBucket?.bucket_name || currentBucket?.bucketName || 'this bucket'}
        hasActiveUploads={activeUploads > 0}
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
