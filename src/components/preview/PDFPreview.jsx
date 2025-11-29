/**
 * PDFPreview Component
 * Preview PDF files
 */

import { useState, useEffect } from 'react';
import { Loading03Icon } from 'hugeicons-react';
import { getPreviewUrl } from '../../services/previewService';

export const PDFPreview = ({ item }) => {
    const [pdfUrl, setPdfUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let mounted = true;

        const loadPDF = async () => {
            try {
                setLoading(true);
                setError(null);
                const url = await getPreviewUrl(item.key);
                if (mounted) {
                    setPdfUrl(url);
                }
            } catch (err) {
                if (mounted) {
                    setError('Failed to load PDF');
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        loadPDF();

        return () => {
            mounted = false;
        };
    }, [item.key]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <Loading03Icon className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
                    <p className="text-white">Loading PDF...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <p className="text-red-400 mb-2">{error}</p>
                    <p className="text-zinc-500 text-sm">Unable to preview this PDF</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full">
            <iframe
                src={pdfUrl}
                className="w-full h-full rounded-lg"
                title={item.name}
            />
        </div>
    );
};
