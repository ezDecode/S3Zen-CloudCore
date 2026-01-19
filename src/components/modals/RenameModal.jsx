/**
 * RenameModal Component
 * Modal for renaming files and folders
 */

import { Edit02Icon } from 'hugeicons-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Modal } from './Modal';
import { Button } from '../ui/button';

export const RenameModal = ({ isOpen, onClose, item, onSuccess }) => {

    const [newName, setNewName] = useState('');
    const [isRenaming, setIsRenaming] = useState(false);

    // Update newName when item changes or modal opens
    useEffect(() => {
        if (item && isOpen) {
            setNewName(item.name);
        }
    }, [item, isOpen]);

    const handleRename = async () => {
        if (!newName.trim()) {
            toast.error('Please enter a name');
            return;
        }

        if (newName === item.name) {
            toast.info('Name unchanged');
            setNewName('');
            onClose();
            return;
        }

        // Validate name (no special characters except - _ and .)
        if (!/^[a-zA-Z0-9-_. ]+$/.test(newName)) {
            toast.error('Name can only contain letters, numbers, spaces, hyphens, underscores, and dots');
            return;
        }

        setIsRenaming(true);
        try {
            // Call the onSuccess callback with the new name
            // The parent component will handle the actual rename logic
            await onSuccess(item, newName);
            toast.success(`Renamed to "${newName}"`);
            setNewName('');
            onClose();
        } catch (error) {
            toast.error(error.message || 'Failed to rename');
        } finally {
            setIsRenaming(false);
        }
    };

    const handleClose = () => {
        if (!isRenaming) {
            setNewName('');
            onClose();
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !isRenaming) {
            handleRename();
        }
    };

    if (!item) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={`Rename ${item.type === 'folder' ? 'Folder' : 'File'}`}
            icon={Edit02Icon}
            iconColor="text-purple-400"
            zIndex="z-[100]"
        >
            {/* Current Name Display */}
            <div className="space-y-2">
                <label className="text-xs text-white/60 font-normal">
                    Current name: <span className="text-white">{item.name}</span>
                </label>
            </div>

            {/* New Name Input */}
            <div className="space-y-2">
                <label htmlFor="new-name" className="text-sm text-white/80 font-normal">
                    New Name
                </label>
                <input
                    id="new-name"
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter new name..."
                    disabled={isRenaming}
                    autoFocus
                    className="w-full px-4 py-3.5 bg-white/6 border border-white/12 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/25 focus:bg-white/8 focus:ring-2 focus:ring-white/20 transition-all disabled:opacity-50"
                />
                <p className="text-xs text-white/60">
                    {item.type === 'folder' ? 'Folder' : 'File'} will be renamed in the same location
                </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-3">
                <Button
                    onClick={handleClose}
                    disabled={isRenaming}
                    variant="outline"
                    className="flex-1 h-auto py-3.5"
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleRename}
                    disabled={isRenaming || !newName.trim()}
                    className="flex-1 h-auto py-3.5 bg-purple-500 hover:bg-purple-600"
                >
                    {isRenaming ? 'Renaming...' : 'Rename'}
                </Button>
            </div>
        </Modal>
    );
};
