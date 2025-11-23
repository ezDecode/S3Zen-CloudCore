/**
 * CloudCore Main Application
 * Premium AWS S3 File Manager
 */

import { useState, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import { Hero } from './components/auth/Hero';
import { AuthModal } from './components/auth/AuthModal';
import { FileExplorer } from './components/file-explorer/FileExplorer';
import { ShareModal } from './components/modals/ShareModal';
import { DeleteConfirmModal } from './components/modals/DeleteConfirmModal';
import {
  initializeS3Client,
  validateCredentials
} from './services/aws/s3Service';
import {
  isAuthenticated,
  saveCredentials,
  saveBucketConfig,
  clearAuth
} from './utils/authUtils';
import { useSessionTimeout } from './hooks/useSessionTimeout';

function App() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [shareModalItem, setShareModalItem] = useState(null);
  const [deleteModalItems, setDeleteModalItems] = useState([]);
  const [deleteCallback, setDeleteCallback] = useState(null);

  // Session timeout handling
  useSessionTimeout(() => {
    toast.error('Session expired. Please login again.');
    handleLogout();
  });

  // Check authentication on mount
  useEffect(() => {
    if (isAuthenticated()) {
      setIsLoggedIn(true);
    }
  }, []);

  // Handle authentication
  const handleAuthenticate = async (formData) => {
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
  };

  // Handle logout
  const handleLogout = () => {
    clearAuth();
    setIsLoggedIn(false);
    toast.info(' Logged out');
  };

  // Handle get started
  const handleGetStarted = () => {
    setShowAuthModal(true);
  };

  // Handle share modal
  const handleShareModal = (item) => {
    setShareModalItem(item);
  };

  // Handle delete modal
  const handleDeleteModal = (items, callback) => {
    setDeleteModalItems(items);
    setDeleteCallback(() => callback);
  };

  return (
    <div className="min-h-screen">
      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#fff',
          },
        }}
      />

      {/* Main Content */}
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
        />
      )}

      {/* Modals */}
      <ShareModal
        isOpen={!!shareModalItem}
        onClose={() => setShareModalItem(null)}
        item={shareModalItem}
      />

      <DeleteConfirmModal
        isOpen={deleteModalItems.length > 0}
        onClose={() => setDeleteModalItems([])}
        items={deleteModalItems}
        onSuccess={() => {
          if (deleteCallback) {
            deleteCallback();
          }
          setDeleteModalItems([]);
        }}
      />
    </div>
  );
}

export default App;
