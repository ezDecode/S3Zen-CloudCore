/**
 * UnsupportedPreview Component
 * Fallback for unsupported file types
 */

import { motion } from 'framer-motion';
import { File02Icon, Download01Icon } from 'hugeicons-react';
import { formatFileSize } from '../../utils/fileTypeUtils';

export const UnsupportedPreview = ({ item, onDownload }) => {
    return (
        <div className="flex items-center justify-center h-full">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center max-w-md"
            >
                {/* File Icon */}
                <div className="w-32 h-32 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center border border-white/10">
                    <File02Icon className="w-16 h-16 text-zinc-600" />
                </div>

                {/* File Info */}
                <h3 className="text-xl font-bold text-white mb-2">
                    {item.name}
                </h3>
                <p className="text-zinc-400 mb-6">
                    {formatFileSize(item.size)}
                </p>

                {/* Message */}
                <p className="text-zinc-500 mb-6">
                    Preview not available for this file type
                </p>

                {/* Download Button */}
                {onDownload && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onDownload(item)}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors mx-auto"
                    >
                        <Download01Icon className="w-5 h-5" />
                        Download File
                    </motion.button>
                )}
            </motion.div>
        </div>
    );
};
