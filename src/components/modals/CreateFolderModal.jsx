/**
 * CreateFolderModal Component
 * Modal for creating new folders with validation
 */

import { FolderAddIcon } from 'hugeicons-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { createFolder } from '../../services/aws/s3Service';
import { Modal } from './Modal';
import { Button } from '../ui/button';

export const CreateFolderModal = ({ isOpen, onClose, currentPath, onSuccess }) => {

    const [folderName, setFolderName] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const handleCreate = async () => {
        if (!folderName.trim()) {
            toast.error('Please enter a folder name');
            return;
        }

        // Validate folder name (no special characters except - and _)
        if (!/^[a-zA-Z0-9-_ ]+$/.test(folderName)) {
            toast.error('Folder name can only contain letters, numbers, spaces, hyphens, and underscores');
            return;
        }

        setIsCreating(true);
        try {
            const folderKey = currentPath ? `${currentPath}${folderName}/` : `${folderName}/`;
            const result = await createFolder(folderKey);

            if (result.success) {
                toast.success(`Folder "${folderName}" created successfully`);
                setFolderName('');
                onSuccess();
                onClose();
            } else {
                toast.error(`Failed to create folder: ${result.error}`);
            }
        } catch (error) {
            toast.error('Failed to create folder');
        } finally {
            setIsCreating(false);
        }
    };

    const handleClose = () => {
        if (!isCreating) {
            setFolderName('');
            onClose();
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !isCreating) {
            handleCreate();
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Create New Folder"
            icon={FolderAddIcon}
            iconColor="text-blue-400"
            zIndex="z-[100]"
        >
            {/* Folder Name Input */}
            <div className="space-y-2">
                <label htmlFor="folder-name" className="text-sm text-white/80 font-normal">
                    Folder Name
                </label>
                <input
                    id="folder-name"
                    type="text"
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter folder name..."
                    disabled={isCreating}
                    autoFocus
                    className="w-full px-4 py-3.5 bg-white/6 border border-white/12 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/25 focus:bg-white/8 focus:ring-2 focus:ring-white/20 transition-all disabled:opacity-50"
                />
                <p className="text-xs text-white/60">
                    {currentPath ? `Will be created in: ${currentPath}` : 'Will be created in root directory'}
                </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-3">
                <Button
                    onClick={handleClose}
                    disabled={isCreating}
                    variant="outline"
                    className="flex-1 h-auto py-3.5"
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleCreate}
                    disabled={isCreating || !folderName.trim()}
                    className="flex-1 h-auto py-3.5 bg-blue-500 hover:bg-blue-600"
                >
                    {isCreating ? 'Creating...' : 'Create Folder'}
                </Button>
            </div>
        </Modal>
    );
};
