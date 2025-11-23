/**
 * DeleteConfirmModal Component
 * Confirmation modal for file/folder deletion
 */

import { X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useToast } from '../common/Toast';
import { deleteObjects } from '../../services/aws/s3Service';

export const DeleteConfirmModal = ({ isOpen, onClose, items, onSuccess }) => {
    const toast = useToast();
    const [isDeleting, setIsDeleting] = useState(false);
    const [confirmationText, setConfirmationText] = useState('');

    const handleDelete = async () => {
        if (!items || items.length === 0) return;

        // Validate confirmation text for single item
        if (items.length === 1) {
            if (confirmationText !== items[0].name) {
                toast.error('Name does not match. Please type the exact name.');
                return;
            }
        }

        setIsDeleting(true);
        try {
            const keys = items.map(item => item.key);
            const result = await deleteObjects(keys);

            if (result.success) {
                toast.success(`Deleted ${items.length} item(s)`);
                onSuccess();
                onClose();
                setConfirmationText('');
            } else {
                toast.error(`Failed to delete: ${result.error}`);
            }
        } catch (error) {
            toast.error('Failed to delete items');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleCloseModal = () => {
        setConfirmationText('');
        onClose();
    };

    if (!items || items.length === 0) return null;

    const isSingleItem = items.length === 1;
    const canDelete = isSingleItem ? confirmationText === items[0].name : true;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={handleCloseModal}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-zinc-900/95 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-md border border-white/20 z-50"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-white/10">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-red-400" />
                                <h2 className="text-lg font-bold text-white">Confirm Deletion</h2>
                            </div>
                            <button
                                onClick={handleCloseModal}
                                className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-5 space-y-4">
                            <p className="text-sm text-white/80">
                                {isSingleItem
                                    ? `You are about to delete "${items[0].name}". This action cannot be undone.`
                                    : `Are you sure you want to delete ${items.length} item(s)? This action cannot be undone.`
                                }
                            </p>

                            {items.length <= 5 && items.length > 1 && (
                                <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                                    <p className="text-xs text-white/60 mb-2">Items to be deleted:</p>
                                    <ul className="text-xs text-white space-y-1">
                                        {items.map((item, index) => (
                                            <li key={index} className="truncate">• {item.name}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Confirmation Input for Single Item */}
                            {isSingleItem && (
                                <div className="space-y-2">
                                    <label className="text-sm text-white/80 font-medium">
                                        Type <span className="font-mono text-red-400">{items[0].name}</span> to confirm
                                    </label>
                                    <input
                                        type="text"
                                        value={confirmationText}
                                        onChange={(e) => setConfirmationText(e.target.value)}
                                        placeholder="Type name here..."
                                        disabled={isDeleting}
                                        autoFocus
                                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-red-500/50 focus:bg-white/10 transition-all disabled:opacity-50"
                                    />
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-2 pt-3">
                                <button
                                    onClick={handleCloseModal}
                                    disabled={isDeleting}
                                    className="flex-1 py-2.5 px-4 text-sm bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting || !canDelete}
                                    className="flex-1 py-2.5 px-4 text-sm bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isDeleting ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
