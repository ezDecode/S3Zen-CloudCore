/**
 * VideoPreview Component
 * Preview videos with custom controls
 */

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Loading03Icon } from 'hugeicons-react';
import { getPreviewUrl } from '../../services/previewService';

export const VideoPreview = ({ item }) => {
    const [videoUrl, setVideoUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const videoRef = useRef(null);

    useEffect(() => {
        let mounted = true;

        const loadVideo = async () => {
            try {
                setLoading(true);
                setError(null);
                const url = await getPreviewUrl(item.key);
                if (mounted) {
                    setVideoUrl(url);
                }
            } catch (err) {
                if (mounted) {
                    setError('Failed to load video');
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        loadVideo();

        return () => {
            mounted = false;
        };
    }, [item.key]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <Loading03Icon className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
                    <p className="text-white">Loading video...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <p className="text-red-400 mb-2">{error}</p>
                    <p className="text-zinc-500 text-sm">Unable to preview this video</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center h-full">
            <video
                ref={videoRef}
                src={videoUrl}
                controls
                className="max-w-full max-h-full rounded-lg shadow-2xl"
                onLoadedData={() => setLoading(false)}
            >
                Your browser does not support the video tag.
            </video>
        </div>
    );
};
