/**
 * Dashboard
 * ncdai design system with Black/White/Orange palette
 * main upload and file management interface with grid lines
 */

import { useState, useCallback, useRef, useEffect, memo } from 'react';
import { Icon } from '@iconify/react';
import { files as filesApi } from '../../services/api/files';
import { toast } from 'sonner';
import { DiagonalSeparator as Separator } from '../ui/DiagonalSeparator';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Header } from '../layout/Header';
import { Footer } from '../layout/Footer';


import { formatBytes as formatSize, formatDate } from '../../lib/utils';

// Constants
const CACHE_KEY = 'orbit_files_cache';
const CACHE_TIME_KEY = 'orbit_cache_time';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Helpers
const getLocalCache = () => {
    try {
        const cached = localStorage.getItem(CACHE_KEY);
        return cached ? JSON.parse(cached) : [];
    } catch { return []; }
};

const setLocalCache = (files) => {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(files));
        localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
    } catch { }
};

const isCacheFresh = () => {
    const last = localStorage.getItem(CACHE_TIME_KEY);
    return last && (Date.now() - parseInt(last) < CACHE_DURATION);
};

const getFileIcon = (type, name) => {
    if (!type) return 'solar:file-linear';
    if (type.startsWith('image/')) return 'solar:gallery-linear';
    if (type.includes('json') || type.includes('javascript') || type.includes('html') || type.includes('css')) return 'solar:code-circle-linear';
    if (type.startsWith('text/')) return 'solar:document-text-linear';
    return 'solar:file-linear';
};

const FileItem = memo(({ file, copiedUrl, deleting, onCopy, onDelete }) => {
    const iconString = getFileIcon(file.type, file.name);
    const isCopied = copiedUrl === file.key;

    return (
        <div className="py-5 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 transition-colors border-b border-dotted border-border/50 last:border-0 group">
            <div className="flex items-center gap-4 sm:gap-5 flex-1 min-w-0">
                <div className="w-11 h-11 bg-secondary rounded-lg flex items-center justify-center shrink-0 transition-colors group-hover:bg-brand/10">
                    <Icon icon={iconString} className="w-5 h-5 text-muted-foreground group-hover:text-brand transition-colors" />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-2 sm:gap-3">
                        <span className="text-sm truncate font-medium max-w-[150px] sm:max-w-none">{file.name}</span>
                        {file.compressed && (
                            <Badge variant="brand">Compressed</Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                            <Icon icon="solar:ssd-linear" className="w-3 h-3" />
                            {formatSize(file.size)}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                        <span className="flex items-center gap-1">
                            <Icon icon="solar:clock-circle-linear" className="w-3 h-3" />
                            {formatDate(file.uploadedAt)}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:ml-auto">
                    <Button
                        onClick={() => onCopy(file.url, file.key)}
                        variant={isCopied ? "default" : "secondary"}
                        size="sm"
                        className="flex-1 sm:min-w-[100px] transition-all duration-300"
                    >
                        {isCopied ? (
                            <>
                                <Icon icon="solar:check-circle-linear" className="w-4 h-4" />
                                Copied
                            </>
                        ) : (
                            'Copy Link'
                        )}
                    </Button>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            asChild
                        >
                            <a
                                href={file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Open File"
                                aria-label={`Open ${file.name}`}
                            >
                                <Icon icon="solar:link-circle-linear" className="w-4 h-4" />
                            </a>
                        </Button>
                        <Button
                            onClick={() => onDelete(file)}
                            disabled={deleting === file.key}
                            variant="ghost"
                            size="icon"
                            className="hover:text-destructive hover:bg-destructive/10"
                            title="Delete File"
                            aria-label={`Delete ${file.name}`}
                        >
                            {deleting === file.key ? (
                                <Icon icon="solar:refresh-circle-linear" className="w-4 h-4 animate-spin" />
                            ) : (
                                <Icon icon="solar:trash-bin-trash-linear" className="w-4 h-4" />
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
});

const UploadItem = memo(({ upload }) => {
    const isCompressing = upload.progress === 100 && upload.status === 'uploading';

    return (
        <div className="py-4 flex items-center gap-4 border-b border-dotted border-border/50 last:border-0 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center shrink-0">
                {upload.status === 'error' ? (
                    <Icon icon="solar:danger-triangle-linear" className="w-5 h-5 text-destructive" />
                ) : isCompressing ? (
                    <Icon icon="solar:minimize-square-3-linear" className="w-5 h-5 text-brand animate-pulse-subtle" />
                ) : (
                    <Icon icon="solar:cloud-upload-linear" className="w-5 h-5 text-brand animate-bounce" />
                )}
            </div>

            <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center justify-between text-sm">
                    <span className="font-medium truncate pr-4">{upload.name}</span>
                    <span className="text-muted-foreground text-xs whitespace-nowrap font-mono feature-settings-tnum">
                        {upload.status === 'error' ? 'Failed' : isCompressing ? 'Compressing Image...' : `Uploading... ${upload.progress}%`}
                    </span>
                </div>

                <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-300 ease-out rounded-full ${upload.status === 'error' ? 'bg-destructive' : 'bg-brand'}`}
                        style={{ width: `${Math.max(5, upload.progress)}%` }}
                    />
                </div>
            </div>
        </div>
    );
});

/**
 * @param {Object} props
            * @param {any} props.user
            * @param {any} props.bucket
            * @param {Function} props.onLogout
            * @param {Function} props.onAddBucket
            * @param {Function} props.onRemoveBucket
            * @param {Function} [props.onUploadsChange]
            * @param {File[]} [props.pendingFiles]
            * @param {Function} [props.onPendingUpload]
            * @param {Function} [props.onUploadComplete]
            */
const Dashboard = ({ user, bucket, onLogout, onAddBucket, onRemoveBucket, onUploadsChange, pendingFiles = [], onPendingUpload, onUploadComplete }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [uploads, setUploads] = useState([]);
    const [recentFiles, setRecentFiles] = useState(getLocalCache());
    const [copiedUrl, setCopiedUrl] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [isSyncing, setIsSyncing] = useState(false);

    // Initial sync and cleanup on bucket change
    useEffect(() => {
        // Clear recent files and active uploads when bucket changes 
        // to avoid showing stale data or keeping orphaned upload UI from previous bucket
        setRecentFiles([]);
        setUploads([]);
        syncHistory(true);
    }, [bucket?.id]);

    // Handle pending files from App.tsx (after bucket setup)
    useEffect(() => {
        if (bucket?.id && pendingFiles.length > 0) {
            console.log(`[Dashboard] Processing ${pendingFiles.length} pending files...`);
            pendingFiles.forEach(file => uploadFile(file));
            if (onUploadComplete) onUploadComplete();
        }
    }, [bucket?.id, pendingFiles, onUploadComplete]);

    // Notify parent of active uploads count
    useEffect(() => {
        if (onUploadsChange) {
            onUploadsChange(uploads.length);
        }
    }, [uploads.length, onUploadsChange]);

    const fileInputRef = useRef(null);
    const dropZoneRef = useRef(null);

    const totalFiles = recentFiles.length;
    const totalSize = recentFiles.reduce((acc, f) => acc + (f.size || 0), 0);
    const totalSaved = recentFiles.reduce((acc, f) => acc + ((f.originalSize || f.size) - (f.size || 0)), 0);

    const syncHistory = async (forceRefresh = false) => {
        if (!forceRefresh && isCacheFresh() && recentFiles.length > 0) return;
        setIsSyncing(true);
        try {
            const result = await filesApi.getHistory({
                limit: 50,
                bucketId: bucket?.id
            });
            if (result.success && result.files) {
                setRecentFiles(result.files);
                setLocalCache(result.files);
            }
        } catch (e) {
            console.warn('[Dashboard] Sync unavailable');
        } finally {
            setIsSyncing(false);
        }
    };

    const uploadFile = useCallback(async (file, options = {}) => {
        if (!bucket?.id) {
            console.log(`[Dashboard] No bucket connected, storing ${file.name} as pending`);
            if (onPendingUpload) {
                onPendingUpload([file]);
            } else {
                toast.error('Connect a bucket to upload files');
            }
            return;
        }

        const uploadId = Date.now() + '-' + file.name;
        setUploads(prev => [...prev, { id: uploadId, name: file.name, progress: 0, status: 'uploading' }]);

        try {
            const result = await filesApi.upload(file, {
                bucketId: bucket?.id,
                skipCompression: options.skipCompression,
                onProgress: (progress) => {
                    const percent = typeof progress === 'object' ? Math.round(progress.percentage || 0) : progress;
                    setUploads(prev => prev.map(u => u.id === uploadId ? { ...u, progress: percent } : u));
                }
            });

            if (result.success) {
                const newFile = { ...result.file, uploadedAt: new Date().toISOString() };
                setRecentFiles(prev => {
                    const updated = [newFile, ...prev.filter(f => f.key !== newFile.key)].slice(0, 50);
                    setLocalCache(updated);
                    return updated;
                });
                toast.success(`${file.name} uploaded`);
                setTimeout(() => setUploads(prev => prev.filter(u => u.id !== uploadId)), 2000);
            } else {
                // Check for compression failure
                if (result.error && (result.error.includes('COMPRESSION_FAILED') || result.error.includes('backend connection'))) {
                    // Remove the failed upload from list immediately to avoid confusion during prompt
                    setUploads(prev => prev.filter(u => u.id !== uploadId));

                    const shouldUploadOriginal = window.confirm(
                        `Image compression failed for ${file.name}. Do you want to upload the original file (${formatSize(file.size)}) instead?`
                    );

                    if (shouldUploadOriginal) {
                        return uploadFile(file, { skipCompression: true });
                    }
                }

                setUploads(prev => prev.map(u => u.id === uploadId ? { ...u, status: 'error' } : u));
                toast.error(`Error: ${file.name}`);
            }
        } catch (e) {
            setUploads(prev => prev.map(u => u.id === uploadId ? { ...u, status: 'error' } : u));
        }
    }, [bucket]);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer?.files || []);
        files.forEach(file => uploadFile(file));
    }, [uploadFile]);


    const copyUrl = async (url, key) => {
        try {
            setCopiedUrl(key); // Start "Copying" state (visualized as checked immediately for better ux, or we could add a spinner)
            await navigator.clipboard.writeText(url);
            // toast.success('Link copied to clipboard'); // Removed sonner
            setTimeout(() => setCopiedUrl(null), 2000);
        } catch {
            toast.error('Failed to copy');
            setCopiedUrl(null);
        }
    };

    const handleDelete = async (file) => {
        if (deleting) return;
        setDeleting(file.key);
        try {
            const result = await filesApi.delete([file.key], bucket?.id);
            if (result.success) {
                setRecentFiles(prev => {
                    const updated = prev.filter(f => f.key !== file.key);
                    setLocalCache(updated);
                    return updated;
                });
                toast.success('File deleted');
            }
        } finally { setDeleting(null); }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background w-full">
            <main className="flex min-h-screen flex-col w-full max-w-[1400px] 2xl:max-w-[60vw] mx-auto">
                <div className="flex-1 w-full flex flex-col">
                    {/* Header */}
                    <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-transparent transition-all duration-200">
                        <Header
                            variant="dashboard"
                            bucketName={bucket?.bucket_name || bucket?.bucketName}
                            onLogout={onLogout}
                            onAddBucket={onAddBucket}
                            onRemoveBucket={onRemoveBucket}
                            className="md:px-16 px-6 py-6 md:py-8"
                        />
                    </div>

                    <div className="md:px-16 px-6 flex-1 flex flex-col gap-8 pb-16">
                        {/* Stats Section */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="p-6 flex flex-row items-center gap-4 bg-secondary/20">
                                <Icon icon="solar:ssd-linear" className="w-6 h-6 text-brand" />
                                <div>
                                    <div className="text-2xl font-display font-bold">{totalFiles}</div>
                                    <div className="text-label">Files Stored</div>
                                </div>
                            </Card>
                            <Card className="p-6 flex flex-row items-center gap-4 bg-secondary/20">
                                <Icon icon="solar:graph-new-up-linear" className="w-6 h-6 text-brand" />
                                <div>
                                    <div className="text-2xl font-display font-bold">{formatSize(totalSize)}</div>
                                    <div className="text-label">Total Storage</div>
                                </div>
                            </Card>
                            <Card className="p-6 flex flex-row items-center gap-4 bg-secondary/20">
                                <Icon icon="solar:shield-linear" className="w-6 h-6 text-brand" />
                                <div>
                                    <div className="text-2xl font-display font-bold">{formatSize(totalSaved)}</div>
                                    <div className="text-label">Space Saved</div>
                                </div>
                            </Card>
                        </div>

                        {/* Upload Zone */}
                        <div
                            ref={dropZoneRef}
                            onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`min-h-[200px] flex flex-col items-center justify-center gap-4 border-2 border-dotted transition-all cursor-pointer rounded-2xl p-16 bg-background ${isDragging ? 'bg-brand/5 border-brand ring-4 ring-brand/10' : 'bg-secondary/10 border-border hover:bg-secondary/20 hover:border-brand/50'}`}
                        >
                            <input ref={fileInputRef} type="file" multiple onChange={(e) => { Array.from(e.target.files).forEach(f => uploadFile(f)); e.target.value = ''; }} className="hidden" />
                            <div className="w-16 h-16 rounded-2xl bg-brand/10 flex items-center justify-center">
                                <Icon icon="solar:cloud-upload-linear" className={`w-8 h-8 transition-colors ${isDragging ? 'text-brand' : 'text-muted-foreground'}`} />
                            </div>
                            <div className="text-center">
                                <h3 className="text-lg font-medium">{isDragging ? 'Drop to Upload' : 'Secure Upload Interface'}</h3>
                                <p className="text-sm text-muted-foreground">Drag & drop or click to browse system files</p>
                            </div>
                        </div>

                        {/* Active Uploads */}
                        {uploads.length > 0 && (
                            <div className="flex flex-col gap-4">
                                <h2 className="text-label">Uploading</h2>
                                <div className="divide-y divide-dotted divide-border/50">
                                    {uploads.map(upload => (
                                        <UploadItem key={upload.id} upload={upload} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* File Inventory */}
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between border-b border-dotted border-border/50 pb-2">
                                <h2 className="text-label">Recent Assets</h2>
                                <Button
                                    onClick={() => syncHistory(true)}
                                    variant={isSyncing ? "secondary" : "ghost"}
                                    size="sm"
                                    disabled={isSyncing}
                                    className="transition-all"
                                >
                                    {isSyncing ? (
                                        <>
                                            <Icon icon="solar:refresh-circle-linear" className="w-4 h-4 animate-spin" />
                                            Syncing...
                                        </>
                                    ) : (
                                        <>
                                            <Icon icon="solar:refresh-linear" className="w-4 h-4" />
                                            Refresh
                                        </>
                                    )}
                                </Button>
                            </div>

                            {recentFiles.length === 0 ? (
                                <div className="py-20 text-center flex flex-col items-center justify-center gap-4">
                                    <img src="/logos/orbit-black.svg" alt="Empty" className="h-8 object-contain opacity-50 block dark:hidden" />
                                    <img src="/logos/orbit-white.svg" alt="Empty" className="h-8 object-contain opacity-50 hidden dark:block" />
                                    <div className="flex flex-col">
                                        <h3 className="font-semibold text-lg">No assets found</h3>
                                        <p className="text-muted-foreground">Upload your first file to see it here</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="divide-y divide-dotted divide-border/50">
                                    {recentFiles.map((file, index) => (
                                        <FileItem key={file.key || index} file={file} copiedUrl={copiedUrl} deleting={deleting} onCopy={copyUrl} onDelete={handleDelete} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <Footer className="md:p-16 p-6 pt-8 mt-auto" />
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
