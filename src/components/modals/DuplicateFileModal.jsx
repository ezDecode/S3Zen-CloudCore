/**
 * DuplicateFileModal Component
 * Modal for handling duplicate file uploads
 */

import { Alert02Icon } from 'hugeicons-react';
import { useState } from 'react';
import { Modal } from './Modal';
import { Button } from '../ui/button';

export const DuplicateFileModal = ({ isOpen, onClose, fileName, onResolve }) => {
    const [newFileName, setNewFileName] = useState(fileName);

    const handleKeepBoth = () => {
        // Generate a unique filename with (1), (2), etc.
        const lastDot = fileName.lastIndexOf('.');
        const baseName = lastDot > 0 ? fileName.substring(0, lastDot) : fileName;
        const extension = lastDot > 0 ? fileName.substring(lastDot) : '';
        const uniqueName = `${baseName} (1)${extension}`;

        onResolve({ action: 'keepBoth', newFileName: uniqueName });
        onClose();
    };

    const handleReplace = () => {
        onResolve({ action: 'replace', newFileName: fileName });
        onClose();
    };

    const handleRename = () => {
        if (!newFileName.trim()) return;
        onResolve({ action: 'rename', newFileName: newFileName.trim() });
        onClose();
    };

    const handleCancel = () => {
        onResolve({ action: 'cancel' });
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleCancel}
            title="File Already Exists"
            icon={Alert02Icon}
            iconColor="text-yellow-400"
            zIndex="z-[100]"
        >
            <div className="space-y-4">
                <p className="text-sm text-zinc-400">
                    A file with the name <span className="font-normal text-white">{fileName}</span> already exists in this folder.
                </p>

                {/* Custom Name Input */}
                <div className="space-y-2">
                    <label htmlFor="rename-input" className="text-sm text-white/80 font-normal">
                        Rename to:
                    </label>
                    <input
                        id="rename-input"
                        type="text"
                        value={newFileName}
                        onChange={(e) => setNewFileName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-colors duration-150"
                    />
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-2">
                    <Button
                        onClick={handleRename}
                        disabled={!newFileName.trim()}
                        className="w-full bg-blue-500 hover:bg-blue-600"
                    >
                        Rename & Upload
                    </Button>
                    <Button
                        onClick={handleKeepBoth}
                        variant="secondary"
                        className="w-full"
                    >
                        Keep Both (Add "1")
                    </Button>
                    <Button
                        onClick={handleReplace}
                        variant="outline"
                        className="w-full bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 border-yellow-600/40"
                    >
                        Replace Existing
                    </Button>
                    <Button
                        onClick={handleCancel}
                        variant="ghost"
                        className="w-full text-zinc-400"
                    >
                        Cancel Upload
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
