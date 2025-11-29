/**
 * MarkdownPreview Component
 * Preview markdown files with rendering
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Loading03Icon } from 'hugeicons-react';
import { getFileContent } from '../../services/previewService';

export const MarkdownPreview = ({ item }) => {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
                    setError('Failed to load markdown');
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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <Loading03Icon className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
                    <p className="text-white">Loading markdown...</p>
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
        <div className="w-full h-full overflow-auto custom-scrollbar bg-zinc-900 rounded-lg">
            <div className="max-w-4xl mx-auto p-8">
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                        code({ node, inline, className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || '');
                            return !inline && match ? (
                                <SyntaxHighlighter
                                    style={vscDarkPlus}
                                    language={match[1]}
                                    PreTag="div"
                                    {...props}
                                >
                                    {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                            ) : (
                                <code className={className} {...props}>
                                    {children}
                                </code>
                            );
                        }
                    }}
                    className="prose prose-invert prose-zinc max-w-none"
                >
                    {content}
                </ReactMarkdown>
            </div>
        </div>
    );
};
