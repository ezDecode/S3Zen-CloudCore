/**
 * DuplicateFileModal Component
 * Modal for handling duplicate file uploads
 */

import { AlertTriangleIcon } from 'hugeicons-react';
import { useState } from 'react';
import { Modal } from './Modal';

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
            icon={AlertTriangleIcon}
            iconColor="text-yellow-400"
            zIndex="z-[100]"
        >
            <div className="space-y-4">
                <p className="text-sm text-zinc-400">
                    A file with the name <span className="font-semibold text-white">{fileName}</span> already exists in this folder.
                </p>

                {/* Custom Name Input */}
                <div className="space-y-2">
                    <label htmlFor="rename-input" className="text-sm text-white/80 font-medium">
                        Rename to:
                    </label>
                    <input
                        id="rename-input"
                        type="text"
                        value={newFileName}
                        onChange={(e) => setNewFileName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all"
                    />
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-2">
                    <button
                        onClick={handleRename}
                        disabled={!newFileName.trim()}
                        className="w-full py-2.5 px-4 text-sm bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Rename & Upload
                    </button>
                    <button
                        onClick={handleKeepBoth}
                        className="w-full py-2.5 px-4 text-sm bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
                    >
                        Keep Both (Add "1")
                    </button>
                    <button
                        onClick={handleReplace}
                        className="w-full py-2.5 px-4 text-sm bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 border border-yellow-600/40 rounded-lg transition-all"
                    >
                        Replace Existing
                    </button>
                    <button
                        onClick={handleCancel}
                        className="w-full py-2.5 px-4 text-sm bg-white/5 hover:bg-white/10 text-zinc-400 rounded-lg transition-all"
                    >
                        Cancel Upload
                    </button>
                </div>
            </div>
        </Modal>
    );
};
