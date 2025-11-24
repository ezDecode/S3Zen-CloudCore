/**
 * useModals Hook
 * Manages all modal states in the application
 */

import { useState, useCallback } from 'react';

export const useModals = () => {
    // Share Modal
    const [shareModalItem, setShareModalItem] = useState(null);

    // Delete Modal
    const [deleteModalItems, setDeleteModalItems] = useState([]);
    const [deleteCallback, setDeleteCallback] = useState(null);

    // Create Folder Modal
    const [createFolderModal, setCreateFolderModal] = useState({
        isOpen: false,
        currentPath: '',
        callback: null
    });

    // Rename Modal
    const [renameModalItem, setRenameModalItem] = useState(null);
    const [renameCallback, setRenameCallback] = useState(null);

    const handleShareModal = useCallback((item) => {
        setShareModalItem(item);
    }, []);

    const handleDeleteModal = useCallback((items, callback) => {
        setDeleteModalItems(items);
        setDeleteCallback(() => callback);
    }, []);

    const handleCreateFolderModal = useCallback((currentPath, callback) => {
        setCreateFolderModal({ isOpen: true, currentPath, callback });
    }, []);

    const handleRenameModal = useCallback((item, callback) => {
        setRenameModalItem(item);
        setRenameCallback(() => callback);
    }, []);

    const closeShareModal = useCallback(() => {
        setShareModalItem(null);
    }, []);

    const closeDeleteModal = useCallback(() => {
        setDeleteModalItems([]);
    }, []);

    const closeCreateFolderModal = useCallback(() => {
        setCreateFolderModal({ isOpen: false, currentPath: '', callback: null });
    }, []);

    const closeRenameModal = useCallback(() => {
        setRenameModalItem(null);
        setRenameCallback(null);
    }, []);

    const handleDeleteSuccess = useCallback(() => {
        if (deleteCallback) {
            deleteCallback();
        }
        setDeleteModalItems([]);
    }, [deleteCallback]);

    const handleCreateFolderSuccess = useCallback(() => {
        if (createFolderModal.callback) {
            createFolderModal.callback();
        }
        setCreateFolderModal({ isOpen: false, currentPath: '', callback: null });
    }, [createFolderModal.callback]);

    const handleRenameSuccess = useCallback(async (item, newName) => {
        if (renameCallback) {
            await renameCallback(item, newName);
        }
        setRenameModalItem(null);
        setRenameCallback(null);
    }, [renameCallback]);

    return {
        // Share Modal
        shareModalItem,
        handleShareModal,
        closeShareModal,

        // Delete Modal
        deleteModalItems,
        handleDeleteModal,
        closeDeleteModal,
        handleDeleteSuccess,

        // Create Folder Modal
        createFolderModal,
        handleCreateFolderModal,
        closeCreateFolderModal,
        handleCreateFolderSuccess,

        // Rename Modal
        renameModalItem,
        handleRenameModal,
        closeRenameModal,
        handleRenameSuccess
    };
};
