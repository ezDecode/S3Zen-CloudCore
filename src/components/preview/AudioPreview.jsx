/**
 * AudioPreview Component
 * Preview audio files with waveform
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loading03Icon, MusicNote01Icon } from 'hugeicons-react';
import { getPreviewUrl } from '../../services/previewService';

export const AudioPreview = ({ item }) => {
    const [audioUrl, setAudioUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let mounted = true;

        const loadAudio = async () => {
            try {
                setLoading(true);
                setError(null);
                const url = await getPreviewUrl(item.key);
                if (mounted) {
                    setAudioUrl(url);
                }
            } catch (err) {
                if (mounted) {
                    setError('Failed to load audio');
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        loadAudio();

        return () => {
            mounted = false;
        };
    }, [item.key]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <Loading03Icon className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
                    <p className="text-white">Loading audio...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <p className="text-red-400 mb-2">{error}</p>
                    <p className="text-zinc-500 text-sm">Unable to preview this audio file</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center h-full">
            <div className="w-full max-w-2xl">
                {/* Album Art Placeholder */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-64 h-64 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-white/10"
                >
                    <MusicNote01Icon className="w-24 h-24 text-blue-400" />
                </motion.div>

                {/* File Name */}
                <h3 className="text-xl font-bold text-white text-center mb-6">
                    {item.name}
                </h3>

                {/* Audio Player */}
                <audio
                    src={audioUrl}
                    controls
                    className="w-full"
                    onLoadedData={() => setLoading(false)}
                >
                    Your browser does not support the audio tag.
                </audio>
            </div>
        </div>
    );
};
