/**
 * CloudCore - Main Application Entry Point
 * Premium AWS S3 File Manager
 * 
 * Structure:
 * - AppContent handles authentication flow
 * - Custom hooks manage auth and modals
 * - Sonner Toaster for toast notifications
 */

import { useState } from 'react';
import { Hero } from './components/auth/Hero';
import { AuthModal } from './components/auth/AuthModal';
import { FileExplorer } from './components/file-explorer/FileExplorer';
import { ShareModal, DeleteConfirmModal, CreateFolderModal, RenameModal, DetailsModal, SetupGuideModal } from './components/modals';
import { useAuth } from './hooks/useAuth';
import { useModals } from './hooks/useModals';
import { useSessionTimeout } from './hooks/useSessionTimeout';
import { Toaster } from './components/ui/sonner';

/**
 * Main Application Content
 * Handles routing between Hero/Login and File Explorer
 */
function AppContent() {
  // Authentication state and handlers
  const {
    isLoggedIn,
    showAuthModal,
    setShowAuthModal,
    handleAuthenticate,
    handleLogout,
    handleGetStarted
  } = useAuth();

  // Setup Guide Modal state
  const [showSetupGuide, setShowSetupGuide] = useState(false);

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
      {!isLoggedIn ? (
        <>
          <Hero
            onGetStarted={handleGetStarted}
            onShowSetupGuide={() => setShowSetupGuide(true)}
          />
          <AuthModal
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
            onAuthenticate={handleAuthenticate}
          />
        </>
      ) : (
        <FileExplorer
          onLogout={handleLogout}
          onShareModal={handleShareModal}
          onDeleteModal={handleDeleteModal}
          onCreateFolderModal={handleCreateFolderModal}
          onRenameModal={handleRenameModal}
          onDetailsModal={handleDetailsModal}
          onShowSetupGuide={() => setShowSetupGuide(true)}
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

      {/* Setup Guide Modal */}
      <SetupGuideModal
        isOpen={showSetupGuide}
        onClose={() => setShowSetupGuide(false)}
      />

      {/* Toaster for notifications */}
      <Toaster />
    </>
  );
}

/**
 * Root App Component
 */
function App() {
  return <AppContent />;
}

export default App;
