/**
 * Dashboard
 * ncdai design system with Black/White/Orange palette
 * main upload and file management interface with grid lines
 */

import { useState, useCallback, useRef, useEffect, memo } from 'react';
import {
    Cloud, Upload, Trash2, LogOut, Settings, FileIcon, Image, FileCode, FileText,
    Loader2, RefreshCw, ExternalLink, HardDrive, TrendingUp, Clock, Shield,
    Sun, Moon, Twitter, Github, Linkedin
} from 'lucide-react';
import { files as filesApi } from '../../services/api/files';
import { toast } from 'sonner';
import { DiagonalSeparator as Separator } from '../ui/DiagonalSeparator';
import { Button } from '../ui/button';

// ... (getFileIcon, formatSize, formatDate, constants, getLocalCache, setLocalCache, isCacheFresh stay the same) ...

const FileItem = memo(({ file, copiedUrl, deleting, onCopy, onDelete }) => {
    const Icon = getFileIcon(file.type, file.name);
    return (
        <div className="file-item group">
            <div className="w-11 h-11 bg-secondary rounded-lg flex items-center justify-center transition-colors group-hover:bg-brand/10">
                <Icon className="w-5 h-5 text-muted-foreground group-hover:text-brand transition-colors" />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                    <span className="text-sm truncate font-medium max-w-[150px] sm:max-w-none">{file.name}</span>
                    {file.compressed && (
                        <span className="badge badge-brand">Compressed</span>
                    )}
                </div>
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                        <HardDrive className="w-3 h-3" />
                        {formatSize(file.size)}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                    <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(file.uploadedAt)}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                    onClick={() => onCopy(file.url, file.key)}
                    variant={copiedUrl === file.key ? "default" : "secondary"}
                    size="sm"
                >
                    {copiedUrl === file.key ? 'Copied!' : 'Copy Link'}
                </Button>
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
                        <ExternalLink className="w-4 h-4" />
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
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Trash2 className="w-4 h-4" />
                    )}
                </Button>
            </div>
        </div>
    );
});

export const Dashboard = ({ user, bucket, onLogout, onManageBucket }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [uploads, setUploads] = useState([]);
    const [recentFiles, setRecentFiles] = useState(getLocalCache());
    const [copiedUrl, setCopiedUrl] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [isSyncing, setIsSyncing] = useState(false);

    const fileInputRef = useRef(null);
    const dropZoneRef = useRef(null);

    const totalFiles = recentFiles.length;
    const totalSize = recentFiles.reduce((acc, f) => acc + (f.size || 0), 0);
    const totalSaved = recentFiles.reduce((acc, f) => acc + ((f.originalSize || f.size) - (f.size || 0)), 0);

    const syncHistory = async (forceRefresh = false) => {
        if (!forceRefresh && isCacheFresh() && recentFiles.length > 0) return;
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
                toast.success(`${file.name} uploaded`);
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
        <div className="flex min-h-screen items-center justify-center bg-muted/50 w-full">
            <main className="flex min-h-screen flex-col bg-background border-x max-w-[70rem] w-full">
                <div className="flex-1 w-full flex flex-col">
                    {/* Header */}
                    <header className="flex items-center justify-between w-full md:p-16 p-8 pb-4 md:pb-8">
                        <div className="flex items-center gap-4">
                            <img src="/logos/logo-black.svg" alt="Orbit" className="h-10 block dark:hidden" />
                            <img src="/logos/logo-white.svg" alt="Orbit" className="h-10 hidden dark:block" />
                            <div className="h-8 w-px bg-border/50" />
                            <div className="flex flex-col">
                                <span className="text-xs text-muted-foreground font-medium">
                                    {bucket?.bucket_name || bucket?.bucketName || 'No Bucket Connected'}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <Button
                                onClick={onManageBucket}
                                variant="ghost"
                                size="icon"
                            >
                                <Settings className="w-5 h-5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => document.documentElement.classList.toggle('dark')}
                            >
                                <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                                <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                            </Button>
                            <Button
                                onClick={onLogout}
                                variant="ghost"
                                size="icon"
                                className="hover:text-destructive hover:bg-destructive/10"
                            >
                                <LogOut className="w-5 h-5" />
                            </Button>
                        </div>
                    </header>

                    <div className="md:px-16 px-8 flex-1 flex flex-col gap-8 pb-16">
                        {/* Stats Section */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="card p-6 flex items-center gap-4 bg-secondary/20">
                                <HardDrive className="w-6 h-6 text-brand" />
                                <div>
                                    <div className="text-lg font-display font-bold">{totalFiles}</div>
                                    <div className="text-xs text-muted-foreground uppercase tracking-wider">Files Stored</div>
                                </div>
                            </div>
                            <div className="card p-6 flex items-center gap-4 bg-secondary/20">
                                <TrendingUp className="w-6 h-6 text-brand" />
                                <div>
                                    <div className="text-lg font-display font-bold">{formatSize(totalSize)}</div>
                                    <div className="text-xs text-muted-foreground uppercase tracking-wider">Total Storage</div>
                                </div>
                            </div>
                            <div className="card p-6 flex items-center gap-4 bg-secondary/20">
                                <Shield className="w-6 h-6 text-brand" />
                                <div>
                                    <div className="text-lg font-display font-bold">{formatSize(totalSaved)}</div>
                                    <div className="text-xs text-muted-foreground uppercase tracking-wider">Space Saved</div>
                                </div>
                            </div>
                        </div>

                        {/* Upload Zone */}
                        <div
                            ref={dropZoneRef}
                            onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`upload-zone min-h-[200px] flex flex-col items-center justify-center gap-4 border-2 border-dotted transition-all cursor-pointer rounded-2xl ${isDragging ? 'bg-brand/5 border-brand ring-4 ring-brand/10' : 'bg-secondary/10 border-border hover:bg-secondary/20 hover:border-brand/50'}`}
                        >
                            <input ref={fileInputRef} type="file" multiple onChange={(e) => { Array.from(e.target.files).forEach(f => uploadFile(f)); e.target.value = ''; }} className="hidden" />
                            <div className="w-16 h-16 rounded-2xl bg-brand/10 flex items-center justify-center">
                                <Upload className={`w-8 h-8 transition-colors ${isDragging ? 'text-brand' : 'text-muted-foreground'}`} />
                            </div>
                            <div className="text-center">
                                <h3 className="text-lg font-medium">{isDragging ? 'Drop to Upload' : 'Secure Upload Interface'}</h3>
                                <p className="text-sm text-muted-foreground">Drag & drop or click to browse system files</p>
                            </div>
                        </div>

                        {/* File Inventory */}
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between border-b border-dotted border-border/50 pb-2">
                                <h2 className="text-sm font-display font-bold uppercase tracking-widest text-muted-foreground">Recent Assets</h2>
                                <Button
                                    onClick={() => syncHistory(true)}
                                    variant="ghost"
                                    size="sm"
                                >
                                    <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                                    {isSyncing ? 'Syncing...' : 'Refresh'}
                                </Button>
                            </div>

                            {recentFiles.length === 0 ? (
                                <div className="py-20 text-center">
                                    <div className="w-16 h-16 rounded-2xl bg-secondary/30 flex items-center justify-center mx-auto mb-4 p-4">
                                        <img src="/icon-512.svg" alt="Empty" className="w-full h-full object-contain opacity-50" />
                                    </div>
                                    <h3 className="font-medium">No assets found</h3>
                                    <p className="text-sm text-muted-foreground">Upload your first file to see it here</p>
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
                    <footer className="w-full flex items-center justify-between md:p-16 p-8 pt-8 border-t border-dotted border-border/50 mt-auto">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Built with ❤️ by Orbit Team
                            </p>
                        </div>
                        <ul className="flex items-center gap-6">
                            <li><a href="https://twitter.com/ezdecode" className="text-muted-foreground hover:text-brand transition-all block"><Twitter className="size-5" /></a></li>
                            <li><a href="https://github.com/ezDecode" className="text-muted-foreground hover:text-brand transition-all block"><Github className="size-5" /></a></li>
                        </ul>
                    </footer>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
