/**
 * DeleteConfirmModal Component
 * Confirmation modal for file/folder deletion
 */

import { X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { toast } from 'sonner';
import { deleteObjects } from '../../services/aws/s3Service';

export const DeleteConfirmModal = ({ isOpen, onClose, items, onSuccess }) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!items || items.length === 0) return;

        setIsDeleting(true);
        try {
            const keys = items.map(item => item.key);
            const result = await deleteObjects(keys);

            if (result.success) {
                toast.success(`Deleted ${items.length} item(s)`);
                onSuccess();
                onClose();
            } else {
                toast.error(`Failed to delete: ${result.error}`);
            }
        } catch (error) {
            toast.error('Failed to delete items');
        } finally {
            setIsDeleting(false);
        }
    };

    if (!items || items.length === 0) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-md border border-white/20"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-white/10">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-red-400" />
                                <h2 className="text-lg font-bold text-white">Confirm Deletion</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-5 space-y-4">
                            <p className="text-sm text-white/80">
                                Are you sure you want to delete {items.length} item(s)? This action cannot be undone.
                            </p>

                            {items.length <= 5 && (
                                <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                                    <p className="text-xs text-white/60 mb-2">Items to be deleted:</p>
                                    <ul className="text-xs text-white space-y-1">
                                        {items.map((item, index) => (
                                            <li key={index} className="truncate">• {item.name}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-2 pt-3">
                                <button
                                    onClick={onClose}
                                    disabled={isDeleting}
                                    className="flex-1 py-2.5 px-4 text-sm bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
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
