/**
 * CloudCore - Main Application Entry Point
 * Premium AWS S3 File Manager
 * 
 * Structure:
 * - AppContent handles authentication flow
 * - Custom hooks manage auth and modals
 * - Sonner Toaster for toast notifications
 */

import { useState, useEffect } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import { LandingPage } from './components/auth/LandingPage';
import { SupabaseAuthModal } from './components/auth/SupabaseAuthModal';
import { FileExplorer } from './components/file-explorer/FileExplorer';
import { ShareModal, DeleteConfirmModal, CreateFolderModal, RenameModal, DetailsModal, PreviewModal } from './components/modals';
import { BucketManagerModal } from './components/modals/BucketManagerModal';
import { useAuth } from './hooks/useAuth';
import { useModals } from './hooks/useModals';
import { useSessionTimeout } from './hooks/useSessionTimeout';
import { useLenis } from './hooks/useLenis';
import { Toaster } from './components/ui/sonner';
import { initializePreviewService } from './services/previewService';
import { downloadFile, getS3Client, getCurrentBucket } from './services/aws/s3Service';

/**
 * Main Application Content
 * Handles routing between Hero/Login and File Explorer
 */
function AppContent() {
  // Initialize site-wide smooth scrolling
  useLenis();

  // Authentication state and handlers
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

  // Bucket Manager Modal state
  const [showBucketManager, setShowBucketManager] = useState(false);

  // Preview Modal state
  const [previewState, setPreviewState] = useState({
    item: null,
    items: [],
    currentIndex: -1
  });

  const handlePreviewModal = (item, allItems = []) => {
    const previewableItems = allItems.filter(i => i.type === 'file');
    const index = previewableItems.findIndex(i => i.key === item.key);
    setPreviewState({
      item,
      items: previewableItems,
      currentIndex: index
    });
  };

  const closePreviewModal = () => {
    setPreviewState({ item: null, items: [], currentIndex: -1 });
  };

  const nextPreviewFile = () => {
    if (previewState.currentIndex < previewState.items.length - 1) {
      const nextIndex = previewState.currentIndex + 1;
      setPreviewState(prev => ({
        ...prev,
        item: prev.items[nextIndex],
        currentIndex: nextIndex
      }));
    }
  };

  const previousPreviewFile = () => {
    if (previewState.currentIndex > 0) {
      const prevIndex = previewState.currentIndex - 1;
      setPreviewState(prev => ({
        ...prev,
        item: prev.items[prevIndex],
        currentIndex: prevIndex
      }));
    }
  };

  // Handle single file download from preview
  const handleSingleDownload = async (item) => {
    try {
      await downloadFile(item);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  // Initialize preview service with S3 client getters
  useEffect(() => {
    initializePreviewService(getS3Client, getCurrentBucket);
  }, []);

  // Modal state and handlers
  const {
    shareModalItem,
    handleShareModal,
    closeShareModal,
    deleteModalItems,
    handleDeleteModal,
    closeDeleteModal,
    handleDeleteSuccess,
    createFolderModal,
    handleCreateFolderModal,
    closeCreateFolderModal,
    handleCreateFolderSuccess,
    renameModalItem,
    handleRenameModal,
    closeRenameModal,
    handleRenameSuccess,
    detailsModalItem,
    handleDetailsModal,
    closeDetailsModal
  } = useModals();

  // Session timeout handling
  useSessionTimeout(() => {
    handleLogout();
  }, isLoggedIn);

  return (
    <>
      {/* ============================================
          MAIN VIEW - Hero or File Explorer
          ============================================ */}
      {isLoading ? (
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-white/50">Loading...</div>
        </div>
      ) : !isLoggedIn ? (
        <>
          <LandingPage
            onGetStarted={handleGetStarted}
          />
          <SupabaseAuthModal
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
            onSendOTP={handleSendOTP}
            onVerifyOTP={handleVerifyOTP}
          />
        </>
      ) : (
        <FileExplorer
          user={user}
          isLoggedIn={isLoggedIn}
          onLogout={handleLogout}
          onShareModal={handleShareModal}
          onDeleteModal={handleDeleteModal}
          onCreateFolderModal={handleCreateFolderModal}
          onRenameModal={handleRenameModal}
          onPreviewModal={handlePreviewModal}
          onDetailsModal={handleDetailsModal}
          onOpenBucketManager={() => setShowBucketManager(true)}
        />
      )}

      {/* ============================================
          GLOBAL MODALS
          ============================================ */}

      {/* Share File Modal */}
      <ShareModal
        isOpen={!!shareModalItem}
        onClose={closeShareModal}
        item={shareModalItem}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalItems.length > 0}
        onClose={closeDeleteModal}
        items={deleteModalItems}
        onSuccess={handleDeleteSuccess}
      />

      {/* Create Folder Modal */}
      <CreateFolderModal
        isOpen={createFolderModal.isOpen}
        onClose={closeCreateFolderModal}
        currentPath={createFolderModal.currentPath}
        onSuccess={handleCreateFolderSuccess}
      />

      {/* Rename Modal */}
      <RenameModal
        isOpen={!!renameModalItem}
        onClose={closeRenameModal}
        item={renameModalItem}
        onSuccess={handleRenameSuccess}
      />

      {/* Details Modal */}
      <DetailsModal
        isOpen={!!detailsModalItem}
        onClose={closeDetailsModal}
        item={detailsModalItem}
      />

      {/* Preview Modal */}
      <PreviewModal
        item={previewState.item}
        isOpen={!!previewState.item}
        onClose={closePreviewModal}
        onDownload={handleSingleDownload}
        onShare={handleShareModal}
        hasNext={previewState.currentIndex < previewState.items.length - 1}
        hasPrevious={previewState.currentIndex > 0}
        onNext={nextPreviewFile}
        onPrevious={previousPreviewFile}
        currentIndex={previewState.currentIndex}
        totalFiles={previewState.items.length}
      />

      {/* Bucket Manager Modal */}
      <BucketManagerModal
        isOpen={showBucketManager}
        onClose={() => setShowBucketManager(false)}
        onBucketAdded={(newBucket) => {
          setShowBucketManager(false);
          // FileExplorer will auto-select the new bucket via BucketSwitcher
        }}
      />

      {/* Toaster for notifications */}
      <Toaster />
    </>
  );
}

/**
 * Root App Component with Error Boundary
 */
function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

export default App;
