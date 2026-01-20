/**
 * Neo-Brutalism Dashboard
 * The main upload and file management interface
 * Simple: Upload → Get Link → Done
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import {
    Cloud, Upload, Link, Copy, Check, Trash2, LogOut,
    Settings, FileIcon, Image, FileCode, FileText,
    Loader2, X, Download, ExternalLink, RefreshCw
} from 'lucide-react';
import { files as filesApi } from '../../services/api/files';
import { toast } from 'sonner';

// File type icons mapping
const getFileIcon = (mimeType, fileName) => {
    if (mimeType?.startsWith('image/')) return Image;
    if (mimeType?.includes('javascript') || mimeType?.includes('json') ||
        fileName?.match(/\.(js|jsx|ts|tsx|py|rb|go|rs|java|cpp|c|h|css|html|xml)$/i)) {
        return FileCode;
    }
    if (mimeType?.includes('text') || fileName?.match(/\.(txt|md|csv|log)$/i)) {
        return FileText;
    }
    return FileIcon;
};

// Format file size
const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

// Recent files storage
const RECENT_FILES_KEY = 'cloudcore_recent_files';
const MAX_RECENT_FILES = 20;

const getRecentFiles = () => {
    try {
        return JSON.parse(localStorage.getItem(RECENT_FILES_KEY) || '[]');
    } catch {
        return [];
    }
};

const saveRecentFile = (file) => {
    const recent = getRecentFiles();
    const newRecent = [file, ...recent.filter(f => f.key !== file.key)].slice(0, MAX_RECENT_FILES);
    localStorage.setItem(RECENT_FILES_KEY, JSON.stringify(newRecent));
    return newRecent;
};

const removeRecentFile = (key) => {
    const recent = getRecentFiles().filter(f => f.key !== key);
    localStorage.setItem(RECENT_FILES_KEY, JSON.stringify(recent));
    return recent;
};

export const NeoDashboard = ({ user, bucket, onLogout, onManageBucket }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [uploads, setUploads] = useState([]); // Current uploads in progress
    const [recentFiles, setRecentFiles] = useState(getRecentFiles());
    const [copiedUrl, setCopiedUrl] = useState(null);
    const [deleting, setDeleting] = useState(null);

    const fileInputRef = useRef(null);
    const dropZoneRef = useRef(null);

    // Handle drag events
    const handleDragEnter = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.currentTarget === dropZoneRef.current) {
            setIsDragging(false);
        }
    }, []);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    // Upload file
    const uploadFile = async (file) => {
        const uploadId = Date.now() + '-' + file.name;

        // Add to uploads list
        setUploads(prev => [...prev, {
            id: uploadId,
            name: file.name,
            size: file.size,
            type: file.type,
            progress: 0,
            status: 'uploading'
        }]);

        try {
            const result = await filesApi.upload(file, {
                bucketId: bucket?.id,
                onProgress: (progress) => {
                    setUploads(prev => prev.map(u =>
                        u.id === uploadId ? { ...u, progress } : u
                    ));
                }
            });

            if (result.success) {
                // Update upload status
                setUploads(prev => prev.map(u =>
                    u.id === uploadId ? { ...u, status: 'complete', url: result.file.url, key: result.file.key } : u
                ));

                // Save to recent files
                const newFile = {
                    key: result.file.key,
                    name: result.file.originalName,
                    size: result.file.size,
                    originalSize: result.file.originalSize,
                    type: result.file.type,
                    url: result.file.url,
                    compressed: result.file.compressed,
                    uploadedAt: new Date().toISOString()
                };
                setRecentFiles(saveRecentFile(newFile));

                toast.success(`${file.name} uploaded!`);

                // Remove from uploads after a delay
                setTimeout(() => {
                    setUploads(prev => prev.filter(u => u.id !== uploadId));
                }, 3000);
            } else {
                setUploads(prev => prev.map(u =>
                    u.id === uploadId ? { ...u, status: 'error', error: result.error } : u
                ));
                toast.error(`Failed to upload ${file.name}`);
            }
        } catch (error) {
            setUploads(prev => prev.map(u =>
                u.id === uploadId ? { ...u, status: 'error', error: error.message } : u
            ));
            toast.error(`Failed to upload ${file.name}`);
        }
    };

    // Handle drop
    const handleDrop = useCallback(async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer?.files || []);
        if (files.length === 0) return;

        // Upload each file
        files.forEach(file => uploadFile(file));
    }, [bucket]);

    // Handle file input change
    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files || []);
        files.forEach(file => uploadFile(file));
        e.target.value = ''; // Reset input
    };

    // Copy URL to clipboard
    const copyUrl = async (url, key) => {
        try {
            await navigator.clipboard.writeText(url);
            setCopiedUrl(key);
            toast.success('Link copied!');
            setTimeout(() => setCopiedUrl(null), 2000);
        } catch {
            toast.error('Failed to copy');
        }
    };

    // Delete file
    const handleDelete = async (file) => {
        if (deleting) return;

        setDeleting(file.key);

        try {
            const result = await filesApi.delete([file.key], bucket?.id);

            if (result.success) {
                setRecentFiles(removeRecentFile(file.key));
                toast.success(`${file.name} deleted`);
            } else {
                toast.error(result.error || 'Failed to delete');
            }
        } catch (error) {
            toast.error('Failed to delete file');
        } finally {
            setDeleting(null);
        }
    };

    // Cancel upload
    const cancelUpload = (uploadId) => {
        setUploads(prev => prev.filter(u => u.id !== uploadId));
    };

    return (
        <div className="min-h-screen bg-[var(--color-cream)]">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-[var(--color-cream)] border-b-4 border-[var(--border-color)]">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[var(--color-primary)] border-3 border-[var(--border-color)] flex items-center justify-center shadow-[3px_3px_0_var(--border-color)]">
                            <Cloud className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <span className="font-display font-bold text-xl">CloudCore</span>
                            <div className="text-xs text-[var(--color-text-muted)] font-mono">
                                {bucket?.bucket_name || 'No bucket'}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={onManageBucket}
                            className="neo-btn neo-btn-ghost neo-btn-sm"
                            title="Bucket Settings"
                        >
                            <Settings className="w-4 h-4" />
                        </button>
                        <button
                            onClick={onLogout}
                            className="neo-btn neo-btn-ghost neo-btn-sm"
                            title="Sign Out"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-5xl mx-auto px-6 py-8">
                {/* Upload Zone */}
                <div
                    ref={dropZoneRef}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`neo-upload-zone mb-8 cursor-pointer transition-all ${isDragging ? 'dragging' : ''
                        }`}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                    />

                    <div className="flex flex-col items-center">
                        <div className={`w-20 h-20 bg-[var(--color-primary)] border-4 border-[var(--border-color)] flex items-center justify-center mb-4 transition-transform ${isDragging ? 'scale-110 rotate-3' : ''
                            }`}>
                            <Upload className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="font-display text-2xl font-bold uppercase mb-2">
                            {isDragging ? 'Drop it!' : 'Drop files here'}
                        </h2>
                        <p className="text-[var(--color-text-secondary)]">
                            or click to browse • Images auto-compress
                        </p>
                    </div>
                </div>

                {/* Active Uploads */}
                {uploads.length > 0 && (
                    <div className="mb-8">
                        <h3 className="font-display font-bold uppercase text-sm mb-4 flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Uploading ({uploads.length})
                        </h3>
                        <div className="space-y-3">
                            {uploads.map(upload => (
                                <div key={upload.id} className="neo-file-item">
                                    <div className="w-10 h-10 bg-[var(--color-yellow)] border-2 border-[var(--border-color)] flex items-center justify-center flex-shrink-0">
                                        <Upload className="w-5 h-5 text-[var(--color-ink)]" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-medium truncate">{upload.name}</span>
                                            <span className="text-sm text-[var(--color-text-muted)]">
                                                {upload.status === 'uploading' && `${upload.progress || 0}%`}
                                                {upload.status === 'complete' && '✓'}
                                                {upload.status === 'error' && '✗'}
                                            </span>
                                        </div>

                                        {upload.status === 'uploading' && (
                                            <div className="neo-progress">
                                                <div
                                                    className="neo-progress-bar"
                                                    style={{ width: `${upload.progress || 0}%` }}
                                                />
                                            </div>
                                        )}

                                        {upload.status === 'complete' && upload.url && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    copyUrl(upload.url, upload.key);
                                                }}
                                                className="text-sm text-[var(--color-primary)] hover:underline flex items-center gap-1"
                                            >
                                                <Copy className="w-3 h-3" />
                                                Copy link
                                            </button>
                                        )}

                                        {upload.status === 'error' && (
                                            <span className="text-sm text-[var(--color-error)]">
                                                {upload.error || 'Upload failed'}
                                            </span>
                                        )}
                                    </div>

                                    {upload.status === 'uploading' && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                cancelUpload(upload.id);
                                            }}
                                            className="w-8 h-8 flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-error)]"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Recent Files */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-display font-bold uppercase text-sm flex items-center gap-2">
                            <Link className="w-4 h-4" />
                            Recent Uploads ({recentFiles.length})
                        </h3>
                        {recentFiles.length > 0 && (
                            <button
                                onClick={() => {
                                    localStorage.removeItem(RECENT_FILES_KEY);
                                    setRecentFiles([]);
                                }}
                                className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-error)] flex items-center gap-1"
                            >
                                <Trash2 className="w-3 h-3" />
                                Clear all
                            </button>
                        )}
                    </div>

                    {recentFiles.length === 0 ? (
                        <div className="neo-card text-center py-12 text-[var(--color-text-muted)]">
                            <FileIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p className="font-display font-bold uppercase">No uploads yet</p>
                            <p className="text-sm mt-1">Drop a file above to get started</p>
                        </div>
                    ) : (
                        <div className="space-y-0">
                            {recentFiles.map((file, index) => {
                                const IconComponent = getFileIcon(file.type, file.name);
                                const isCompressed = file.compressed && file.originalSize > file.size;
                                const savings = isCompressed
                                    ? Math.round((1 - file.size / file.originalSize) * 100)
                                    : 0;

                                return (
                                    <div key={file.key || index} className="neo-file-item group">
                                        {/* File Icon */}
                                        <div className="w-10 h-10 bg-[var(--color-mint)] border-2 border-[var(--border-color)] flex items-center justify-center flex-shrink-0">
                                            <IconComponent className="w-5 h-5 text-[var(--color-ink)]" />
                                        </div>

                                        {/* File Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium truncate">{file.name}</span>
                                                {isCompressed && (
                                                    <span className="neo-badge neo-badge-success text-[10px] py-0">
                                                        -{savings}%
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-sm text-[var(--color-text-muted)]">
                                                {formatSize(file.size)}
                                                {file.uploadedAt && (
                                                    <> • {new Date(file.uploadedAt).toLocaleDateString()}</>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => copyUrl(file.url, file.key)}
                                                className={`w-9 h-9 border-2 border-[var(--border-color)] flex items-center justify-center transition-colors ${copiedUrl === file.key
                                                        ? 'bg-[var(--color-success)] text-white'
                                                        : 'bg-white hover:bg-[var(--color-yellow)]'
                                                    }`}
                                                title="Copy link"
                                            >
                                                {copiedUrl === file.key ? (
                                                    <Check className="w-4 h-4" />
                                                ) : (
                                                    <Copy className="w-4 h-4" />
                                                )}
                                            </button>

                                            <a
                                                href={file.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-9 h-9 border-2 border-[var(--border-color)] bg-white hover:bg-[var(--color-blue)] hover:text-white flex items-center justify-center transition-colors"
                                                title="Open in new tab"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </a>

                                            <button
                                                onClick={() => handleDelete(file)}
                                                disabled={deleting === file.key}
                                                className="w-9 h-9 border-2 border-[var(--border-color)] bg-white hover:bg-[var(--color-error)] hover:text-white flex items-center justify-center transition-colors disabled:opacity-50"
                                                title="Delete"
                                            >
                                                {deleting === file.key ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-4 h-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t-4 border-[var(--border-color)] py-4 mt-8">
                <div className="max-w-5xl mx-auto px-6 flex items-center justify-between text-sm text-[var(--color-text-muted)]">
                    <span>Connected to: <span className="font-mono">{bucket?.bucket_name}</span></span>
                    <a
                        href="https://github.com/ezDecode/CloudCore"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-[var(--color-primary)]"
                    >
                        @ezDecode
                    </a>
                </div>
            </footer>
        </div>
    );
};

export default NeoDashboard;
