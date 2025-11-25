/**
 * CloudCore - Main Application Entry Point
 * Premium AWS S3 File Manager
 * 
 * Structure:
 * - ToastProvider wraps the entire app
 * - AppContent handles authentication flow
 * - Custom hooks manage auth and modals
 */

import { ToastProvider } from './components/common/Toast';
import { Hero } from './components/auth/Hero';
import { AuthModal } from './components/auth/AuthModal';
import { FileExplorer } from './components/file-explorer/FileExplorer';
import { ShareModal, DeleteConfirmModal, CreateFolderModal, RenameModal, DetailsModal } from './components/modals';
import { useAuth } from './hooks/useAuth';
import { useModals } from './hooks/useModals';
import { useSessionTimeout } from './hooks/useSessionTimeout';

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
          <Hero onGetStarted={handleGetStarted} />
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
    </>
  );
}

/**
 * Root App Component
 * Wraps everything with ToastProvider
 */
function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

export default App;
