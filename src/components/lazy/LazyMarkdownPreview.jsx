/**
 * Lazy-loaded Markdown Preview Component
 * Only loads react-markdown and syntax highlighter when needed
 * Reduces initial bundle size
 */

import { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';

// Lazy load markdown dependencies
const ReactMarkdown = lazy(() => import('react-markdown'));
const { Prism as SyntaxHighlighter } = lazy(() => 
    import('react-syntax-highlighter').then(mod => ({ default: mod.Prism }))
);
const { oneDark } = lazy(() => 
    import('react-syntax-highlighter/dist/esm/styles/prism').then(mod => ({ default: mod.oneDark }))
);
const remarkGfm = lazy(() => import('remark-gfm'));

// Loading fallback
const MarkdownSkeleton = () => (
    <div className="space-y-4 p-6">
        {[...Array(5)].map((_, i) => (
            <div key={i} className="space-y-2">
                <div className="h-4 bg-white/10 rounded animate-pulse" style={{ width: `${Math.random() * 40 + 60}%` }} />
                <div className="h-4 bg-white/10 rounded animate-pulse" style={{ width: `${Math.random() * 30 + 70}%` }} />
            </div>
        ))}
    </div>
);

export const LazyMarkdownPreview = ({ content, className = '' }) => {
    return (
        <Suspense fallback={<MarkdownSkeleton />}>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className={`markdown-preview ${className}`}
            >
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                        code({ node, inline, className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || '');
                            return !inline && match ? (
                                <SyntaxHighlighter
                                    style={oneDark}
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
                >
                    {content}
                </ReactMarkdown>
            </motion.div>
        </Suspense>
    );
};
