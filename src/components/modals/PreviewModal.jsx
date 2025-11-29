/**
 * PreviewModal Component
 * Main container for file preview with navigation
 */

import { motion, AnimatePresence } from 'framer-motion';
import { 
    Cancel01Icon, 
    Download01Icon, 
    ArrowLeft01Icon, 
    ArrowRight01Icon,
    Share01Icon
} from 'hugeicons-react';
import { detectFileType, formatFileSize, FILE_CATEGORIES } from '../../utils/fileTypeUtils';
import { ImagePreview } from '../preview/ImagePreview';
import { VideoPreview } from '../preview/VideoPreview';
import { AudioPreview } from '../preview/AudioPreview';
import { PDFPreview } from '../preview/PDFPreview';
import { TextPreview } from '../preview/TextPreview';
import { MarkdownPreview } from '../preview/MarkdownPreview';
import { UnsupportedPreview } from '../preview/UnsupportedPreview';

export const PreviewModal = ({
    item,
    isOpen,
    onClose,
    onDownload,
    onShare,
    hasNext,
    hasPrevious,
    onNext,
    onPrevious,
    currentIndex,
    totalFiles
}) => {
    if (!isOpen || !item) return null;

    const fileType = detectFileType(item.name);

    // Get appropriate preview component
    const getPreviewComponent = () => {
        switch (fileType) {
            case FILE_CATEGORIES.IMAGE:
                return <ImagePreview item={item} />;
            case FILE_CATEGORIES.VIDEO:
                return <VideoPreview item={item} />;
            case FILE_CATEGORIES.AUDIO:
                return <AudioPreview item={item} />;
            case FILE_CATEGORIES.PDF:
                return <PDFPreview item={item} />;
            case FILE_CATEGORIES.TEXT:
            case FILE_CATEGORIES.CODE:
                return <TextPreview item={item} />;
            case FILE_CATEGORIES.MARKDOWN:
                return <MarkdownPreview item={item} />;
            default:
                return <UnsupportedPreview item={item} onDownload={onDownload} />;
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm"
                onClick={onClose}
            >
                {/* Header */}
                <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent">
                    <div className="flex items-center justify-between px-6 py-4">
                        {/* File Info */}
                        <div className="flex-1 min-w-0">
                            <h2 className="text-lg font-bold text-white truncate">
                                {item.name}
                            </h2>
                            <p className="text-sm text-zinc-400">
                                {formatFileSize(item.size)}
                                {totalFiles > 1 && ` • ${currentIndex + 1} of ${totalFiles}`}
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 ml-4">
                            {onShare && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onShare(item);
                                    }}
                                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                                    title="Share"
                                >
                                    <Share01Icon className="w-5 h-5" />
                                </motion.button>
                            )}
                            
                            {onDownload && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDownload(item);
                                    }}
                                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                                    title="Download"
                                >
                                    <Download01Icon className="w-5 h-5" />
                                </motion.button>
                            )}

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={onClose}
                                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                                title="Close (ESC)"
                            >
                                <Cancel01Icon className="w-5 h-5" />
                            </motion.button>
                        </div>
                    </div>
                </div>

                {/* Preview Content */}
                <div 
                    className="absolute inset-0 flex items-center justify-center p-4 pt-20 pb-20"
                    onClick={(e) => e.stopPropagation()}
                >
                    <motion.div
                        key={item.key}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="w-full h-full max-w-7xl"
                    >
                        {getPreviewComponent()}
                    </motion.div>
                </div>

                {/* Navigation Arrows */}
                {hasPrevious && (
                    <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            onPrevious();
                        }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-colors"
                        title="Previous (←)"
                    >
                        <ArrowLeft01Icon className="w-6 h-6" />
                    </motion.button>
                )}

                {hasNext && (
                    <motion.button
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            onNext();
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-colors"
                        title="Next (→)"
                    >
                        <ArrowRight01Icon className="w-6 h-6" />
                    </motion.button>
                )}
            </motion.div>
        </AnimatePresence>
    );
};
