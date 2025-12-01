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
                <div className="markdown-content text-zinc-100">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            h1: ({ children }) => <h1 className="text-4xl font-normal mb-6 mt-8 text-white border-b border-zinc-700 pb-2">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-3xl font-normal mb-4 mt-6 text-white border-b border-zinc-800 pb-2">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-2xl font-normal mb-3 mt-5 text-white">{children}</h3>,
                            h4: ({ children }) => <h4 className="text-xl font-normal mb-2 mt-4 text-white">{children}</h4>,
                            h5: ({ children }) => <h5 className="text-lg font-normal mb-2 mt-3 text-white">{children}</h5>,
                            h6: ({ children }) => <h6 className="text-base font-normal mb-2 mt-3 text-zinc-300">{children}</h6>,
                            p: ({ children }) => <p className="mb-4 leading-7 text-zinc-300">{children}</p>,
                            a: ({ href, children }) => <a href={href} className="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">{children}</a>,
                            ul: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-2 text-zinc-300">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-2 text-zinc-300">{children}</ol>,
                            li: ({ children }) => <li className="ml-4">{children}</li>,
                            blockquote: ({ children }) => <blockquote className="border-l-4 border-blue-500 pl-4 py-2 mb-4 italic text-zinc-400 bg-zinc-800/50">{children}</blockquote>,
                            table: ({ children }) => <div className="overflow-x-auto mb-4"><table className="min-w-full border border-zinc-700">{children}</table></div>,
                            thead: ({ children }) => <thead className="bg-zinc-800">{children}</thead>,
                            tbody: ({ children }) => <tbody className="divide-y divide-zinc-700">{children}</tbody>,
                            tr: ({ children }) => <tr>{children}</tr>,
                            th: ({ children }) => <th className="px-4 py-2 text-left text-white font-normal border border-zinc-700">{children}</th>,
                            td: ({ children }) => <td className="px-4 py-2 text-zinc-300 border border-zinc-700">{children}</td>,
                            hr: () => <hr className="my-8 border-zinc-700" />,
                            strong: ({ children }) => <strong className="font-normal text-white">{children}</strong>,
                            em: ({ children }) => <em className="italic text-zinc-300">{children}</em>,
                            code({ node, inline, className, children, ...props }) {
                                const match = /language-(\w+)/.exec(className || '');
                                return !inline && match ? (
                                    <div className="mb-4">
                                        <SyntaxHighlighter
                                            style={vscDarkPlus}
                                            language={match[1]}
                                            PreTag="div"
                                            className="rounded-lg"
                                            {...props}
                                        >
                                            {String(children).replace(/\n$/, '')}
                                        </SyntaxHighlighter>
                                    </div>
                                ) : (
                                    <code className="bg-zinc-800 text-blue-400 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                                        {children}
                                    </code>
                                );
                            }
                        }}
                    >
                        {content}
                    </ReactMarkdown>
                </div>
            </div>
        </div>
    );
};
