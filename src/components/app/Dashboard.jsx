/**
 * Dashboard
 * ncdai design system with terracotta palette
 * main upload and file management interface with grid lines
 */

import { useState, useCallback, useRef, useEffect, memo } from 'react';
import {
    Cloud, Upload, Trash2, LogOut, Settings, FileIcon, Image, FileCode, FileText,
    Loader2, RefreshCw, ExternalLink, HardDrive, TrendingUp, Clock, Shield
} from 'lucide-react';
import { files as filesApi } from '../../services/api/files';
import { toast } from 'sonner';
import { DiagonalSeparator as Separator } from '../ui/DiagonalSeparator';

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

const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
};

const CACHE_KEY = 'cloudcore_files_cache';
const CACHE_TIMESTAMP_KEY = 'cloudcore_files_cache_ts';
const CACHE_TTL_MS = 30000; // 30 seconds

const getLocalCache = () => {
    try {
        return JSON.parse(localStorage.getItem(CACHE_KEY) || '[]');
    } catch { return []; }
};
const setLocalCache = (files) => {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(files.slice(0, 50)));
        localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
    } catch { }
};
const isCacheFresh = () => {
    try {
        const ts = parseInt(localStorage.getItem(CACHE_TIMESTAMP_KEY) || '0', 10);
        return Date.now() - ts < CACHE_TTL_MS;
    } catch { return false; }
};

const FileItem = memo(({ file, copiedUrl, deleting, onCopy, onDelete }) => {
    const Icon = getFileIcon(file.type, file.name);
    return (
        <div className="file-item group">
            <div className="w-11 h-11 bg-secondary rounded-lg flex items-center justify-center transition-colors group-hover:bg-brand/10">
                <Icon className="w-5 h-5 text-muted-foreground group-hover:text-brand transition-colors" />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                    <span className="text-sm truncate font-medium">{file.name}</span>
                    {file.compressed && (
                        <span className="badge badge-brand">Compressed</span>
                    )}
                </div>
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                        <HardDrive className="w-3 h-3" />
                        {formatSize(file.size)}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                    <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(file.uploadedAt)}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={() => onCopy(file.url, file.key)}
                    className={`btn h-8 px-4 text-xs rounded-lg font-medium ${copiedUrl === file.key ? 'btn-brand' : 'btn-secondary'}`}
                >
                    {copiedUrl === file.key ? 'Copied!' : 'Copy Link'}
                </button>
                <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors rounded-lg"
                    title="Open File"
                    aria-label={`Open ${file.name}`}
                >
                    <ExternalLink className="w-4 h-4" />
                </a>
                <button
                    onClick={() => onDelete(file)}
                    disabled={deleting === file.key}
                    className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors rounded-lg"
                    title="Delete File"
                    aria-label={`Delete ${file.name}`}
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
});

export const Dashboard = ({ user, bucket, onLogout, onManageBucket }) => {
    // ... state ...

    const [isDragging, setIsDragging] = useState(false);
    const [uploads, setUploads] = useState([]);
    const [recentFiles, setRecentFiles] = useState(getLocalCache());
    const [copiedUrl, setCopiedUrl] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [isSyncing, setIsSyncing] = useState(false);

    const fileInputRef = useRef(null);
    const dropZoneRef = useRef(null);

    // Calculate stats
    const totalFiles = recentFiles.length;
    const totalSize = recentFiles.reduce((acc, f) => acc + (f.size || 0), 0);
    const totalSaved = recentFiles.reduce((acc, f) => acc + ((f.originalSize || f.size) - (f.size || 0)), 0);

    const syncHistory = async (forceRefresh = false) => {
        // Skip if cache is fresh and not forcing
        if (!forceRefresh && isCacheFresh() && recentFiles.length > 0) {
            console.log('[Dashboard] Using cached history');
            return;
        }

        setIsSyncing(true);
        try {
            const result = await filesApi.getHistory({ limit: 50 });
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

    useEffect(() => {
        syncHistory();
    }, []);

    const uploadFile = useCallback(async (file) => {
        const uploadId = Date.now() + '-' + file.name;
        setUploads(prev => [...prev, { id: uploadId, name: file.name, progress: 0, status: 'uploading' }]);

        try {
            const result = await filesApi.upload(file, {
                bucketId: bucket?.id,
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

                // Show savings if compressed
                if (result.file.compressed && result.file.originalSize) {
                    const saved = result.file.originalSize - result.file.size;
                    const savedPercent = Math.round((saved / result.file.originalSize) * 100);
                    toast.success(`${file.name} uploaded • ${savedPercent}% smaller`);
                } else {
                    toast.success(`${file.name} uploaded`);
                }

                setTimeout(() => setUploads(prev => prev.filter(u => u.id !== uploadId)), 2000);
            } else {
                setUploads(prev => prev.map(u => u.id === uploadId ? { ...u, status: 'error' } : u));
                toast.error(`Error: ${file.name}`);
            }
        } catch {
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
            await navigator.clipboard.writeText(url);
            setCopiedUrl(key);
            toast.success('Link copied to clipboard');
            setTimeout(() => setCopiedUrl(null), 2000);
        } catch { toast.error('Failed to copy'); }
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
        <div className="max-w-screen overflow-x-hidden px-2">
            <div className="mx-auto border-x border-edge md:max-w-5xl">
                {/* top diagonal separator */}
                <Separator />

                {/* header */}
                <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
                    <div className="screen-line-after px-4 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-brand/10 flex items-center justify-center">
                                <Cloud className="w-5 h-5 text-brand" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-base leading-none font-semibold">CloudCore</span>
                                <span className="text-[11px] text-muted-foreground mt-1 font-medium">
                                    {bucket?.bucket_name || bucket?.bucketName || 'No Bucket Connected'}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <span className="text-xs text-muted-foreground hidden md:block font-medium">
                                {user?.email}
                            </span>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={onManageBucket}
                                    className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors rounded-lg"
                                    title="Bucket Settings"
                                    aria-label="Bucket Settings"
                                >
                                    <Settings className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={onLogout}
                                    className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors rounded-lg"
                                    title="Sign Out"
                                    aria-label="Sign Out"
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* stats bar */}
                <div className="relative">
                    <div className="absolute inset-0 -z-1 grid grid-cols-3 max-sm:hidden">
                        <div className="border-r border-edge"></div>
                        <div className="border-r border-edge"></div>
                        <div></div>
                    </div>

                    <div className="grid grid-cols-3 screen-line-after">
                        <div className="p-4 flex items-center gap-3">
                            <HardDrive className="w-4 h-4 text-brand" />
                            <div>
                                <div className="text-sm font-semibold">{totalFiles}</div>
                                <div className="text-[10px] text-muted-foreground">Files Stored</div>
                            </div>
                        </div>
                        <div className="p-4 flex items-center gap-3">
                            <TrendingUp className="w-4 h-4 text-brand" />
                            <div>
                                <div className="text-sm font-semibold">{formatSize(totalSize)}</div>
                                <div className="text-[10px] text-muted-foreground">Total Storage</div>
                            </div>
                        </div>
                        <div className="p-4 flex items-center gap-3">
                            <Shield className="w-4 h-4 text-brand" />
                            <div>
                                <div className="text-sm font-semibold">{formatSize(totalSaved)}</div>
                                <div className="text-[10px] text-muted-foreground">Space Saved</div>
                            </div>
                        </div>
                    </div>
                </div>

                <main className="min-h-[calc(100vh-350px)]">
                    {/* activity feed (uploads) */}
                    {uploads.length > 0 && (
                        <>
                            <div className="screen-line-after px-4 py-2">
                                <span className="text-xs tracking-widest text-muted-foreground uppercase font-medium">Uploading</span>
                            </div>
                            <div className="p-4 space-y-3">
                                {uploads.map(upload => (
                                    <div key={upload.id} className="card p-4 flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center">
                                            <Loader2 className="w-5 h-5 animate-spin text-brand" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-sm font-medium truncate max-w-[200px]">{upload.name}</span>
                                                <span className="text-xs text-brand font-semibold">{upload.progress}%</span>
                                            </div>
                                            <div className="progress">
                                                <div className="progress-bar" style={{ width: `${upload.progress}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Separator />
                        </>
                    )}

                    {/* upload zone section */}
                    <div className="screen-line-after px-4 py-2">
                        <span className="text-xs tracking-widest text-muted-foreground uppercase font-medium">Upload Files</span>
                    </div>

                    <div className="p-4">
                        <div
                            ref={dropZoneRef}
                            onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    fileInputRef.current?.click();
                                }
                            }}
                            className={`upload-zone ${isDragging ? 'dragging' : ''}`}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                onChange={(e) => {
                                    Array.from(e.target.files).forEach(f => uploadFile(f));
                                    e.target.value = '';
                                }}
                                className="hidden"
                                title="Upload files"
                                aria-label="Upload files"
                            />
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${isDragging ? 'bg-brand/20' : 'bg-secondary'}`}>
                                <Upload className={`w-7 h-7 transition-colors ${isDragging ? 'text-brand' : 'text-muted-foreground'}`} />
                            </div>
                            <div className="text-center">
                                <h3 className="text-base font-semibold mb-1">
                                    {isDragging ? 'Drop Files Here' : 'Drag Files to Upload'}
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    Or click to browse • Images auto-compressed
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* diagonal separator */}
                    <Separator />

                    {/* inventory section */}
                    <div className="screen-line-after px-4 py-2 flex items-center justify-between">
                        <span className="text-xs tracking-widest text-muted-foreground uppercase font-medium">Recent Uploads</span>
                        <button
                            onClick={() => syncHistory(true)}
                            disabled={isSyncing}
                            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-brand transition-colors font-medium"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                            {isSyncing ? 'Syncing...' : 'Refresh'}
                        </button>
                    </div>

                    {recentFiles.length === 0 ? (
                        <div className="py-16 text-center px-4">
                            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
                                <Cloud className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-base font-semibold mb-2">No Files Yet</h3>
                            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                                Upload your first file to get started. All files are securely stored in your connected S3 bucket.
                            </p>
                        </div>
                    ) : (
                        <div className="px-4">
                            {recentFiles.map((file, index) => (
                                <FileItem
                                    key={file.key || index}
                                    file={file}
                                    copiedUrl={copiedUrl}
                                    deleting={deleting}
                                    onCopy={copyUrl}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    )}
                </main>

                {/* diagonal separator */}
                <Separator />

                {/* footer */}
                <footer className="screen-line-before">
                    <div className="px-4 py-6 flex items-center justify-between">
                        <div className="status-indicator">
                            <span className="text-xs font-medium">System Operational</span>
                        </div>
                        <div className="text-xs text-muted-foreground font-medium">
                            © {new Date().getFullYear()} CloudCore Lab
                        </div>
                    </div>
                </footer>

                {/* bottom spacing */}
                <div className="h-4" />
            </div>
        </div>
    );
};

export default Dashboard;
