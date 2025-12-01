/**
 * TextPreview Component
 * Preview text and code files with syntax highlighting
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Loading03Icon, Copy01Icon, Tick02Icon } from 'hugeicons-react';
import { getFileContent } from '../../services/previewService';
import { getLanguageFromExtension } from '../../utils/fileTypeUtils';

export const TextPreview = ({ item }) => {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);

    const language = getLanguageFromExtension(item.name);

    useEffect(() => {
        let mounted = true;

        const loadContent = async () => {
            try {
                setLoading(true);
                setError(null);
                const text = await getFileContent(item.key);
                if (mounted) {
                    setContent(text);
                }
            } catch (err) {
                if (mounted) {
                    setError('Failed to load file content');
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        loadContent();

        return () => {
            mounted = false;
        };
    }, [item.key]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <Loading03Icon className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
                    <p className="text-white">Loading file...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <p className="text-red-400 mb-2">{error}</p>
                    <p className="text-zinc-500 text-sm">Unable to preview this file</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full flex flex-col bg-[#1e1e1e] rounded-lg overflow-hidden">
            {/* Header with Copy Button */}
            <div className="flex items-center justify-between px-4 py-2 bg-black/50 border-b border-white/10">
                <span className="text-sm text-zinc-400">{language}</span>
                <motion.button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/[0.15] text-white text-sm transition-colors duration-150"
                >
                    {copied ? (
                        <>
                            <Tick02Icon className="w-4 h-4" />
                            Copied!
                        </>
                    ) : (
                        <>
                            <Copy01Icon className="w-4 h-4" />
                            Copy
                        </>
                    )}
                </motion.button>
            </div>

            {/* Code Content */}
            <div className="flex-1 overflow-auto custom-scrollbar">
                <SyntaxHighlighter
                    language={language}
                    style={vscDarkPlus}
                    showLineNumbers
                    wrapLines
                    customStyle={{
                        margin: 0,
                        padding: '1rem',
                        background: 'transparent',
                        fontSize: '14px'
                    }}
                >
                    {content}
                </SyntaxHighlighter>
            </div>
        </div>
    );
};
