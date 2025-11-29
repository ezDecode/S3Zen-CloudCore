/**
 * ImagePreview Component
 * Preview images with zoom, pan, and rotate
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    PlusSignIcon, 
    MinusSignIcon, 
    Rotate01Icon,
    Maximize01Icon,
    Loading03Icon
} from 'hugeicons-react';
import { getPreviewUrl } from '../../services/previewService';

export const ImagePreview = ({ item }) => {
    const [imageUrl, setImageUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [scale, setScale] = useState(1);
    const [rotation, setRotation] = useState(0);

    useEffect(() => {
        let mounted = true;

        const loadImage = async () => {
            try {
                setLoading(true);
                setError(null);
                const url = await getPreviewUrl(item.key);
                if (mounted) {
                    setImageUrl(url);
                }
            } catch (err) {
                if (mounted) {
                    setError('Failed to load image');
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        loadImage();

        return () => {
            mounted = false;
        };
    }, [item.key]);

    const handleZoomIn = () => setScale(prev => Math.min(prev + 0.25, 3));
    const handleZoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5));
    const handleRotate = () => setRotation(prev => (prev + 90) % 360);
    const handleFitToScreen = () => {
        setScale(1);
        setRotation(0);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <Loading03Icon className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
                    <p className="text-white">Loading image...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <p className="text-red-400 mb-2">{error}</p>
                    <p className="text-zinc-500 text-sm">Unable to preview this image</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full flex flex-col">
            {/* Controls */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-black/80 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleZoomOut}
                    disabled={scale <= 0.5}
                    className="p-2 rounded-lg hover:bg-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Zoom Out"
                >
                    <MinusSignIcon className="w-5 h-5" />
                </motion.button>

                <span className="text-white text-sm font-medium min-w-[60px] text-center">
                    {Math.round(scale * 100)}%
                </span>

                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleZoomIn}
                    disabled={scale >= 3}
                    className="p-2 rounded-lg hover:bg-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Zoom In"
                >
                    <PlusSignIcon className="w-5 h-5" />
                </motion.button>

                <div className="w-px h-6 bg-white/20 mx-1" />

                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleRotate}
                    className="p-2 rounded-lg hover:bg-white/10 text-white transition-colors"
                    title="Rotate"
                >
                    <Rotate01Icon className="w-5 h-5" />
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleFitToScreen}
                    className="p-2 rounded-lg hover:bg-white/10 text-white transition-colors"
                    title="Fit to Screen"
                >
                    <Maximize01Icon className="w-5 h-5" />
                </motion.button>
            </div>

            {/* Image */}
            <div className="flex-1 flex items-center justify-center overflow-hidden">
                <motion.img
                    src={imageUrl}
                    alt={item.name}
                    animate={{ 
                        scale, 
                        rotate: rotation 
                    }}
                    transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                    className="max-w-full max-h-full object-contain cursor-move"
                    draggable={false}
                    onLoad={() => setLoading(false)}
                />
            </div>
        </div>
    );
};
