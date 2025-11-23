/**
 * Formatter Utilities
 * Helper functions for formatting file sizes, dates, and getting file icons
 */

import {
    File,
    FileText,
    FileImage,
    FileVideo,
    FileAudio,
    FileArchive,
    FileSpreadsheet,
    FileCode,
    Folder
} from 'lucide-react';

/**
 * Format bytes to human-readable size
 */
export const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Format date to readable string
 */
export const formatDate = (date) => {
    if (!date) return '';

    const d = new Date(date);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    // Just now
    if (diffMins < 1) return 'Just now';

    // Minutes ago
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;

    // Hours ago
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;

    // Days ago
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;

    // Full date
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

/**
 * Get file extension from filename
 */
export const getFileExtension = (filename) => {
    if (!filename) return '';
    const parts = filename.split('.');
    return parts.length > 1 ? parts.pop().toLowerCase() : '';
};

/**
 * Get file type from filename
 */
export const getFileType = (filename) => {
    const ext = getFileExtension(filename);

    // Images
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'ico'];
    if (imageExts.includes(ext)) return 'image';

    // Videos
    const videoExts = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'];
    if (videoExts.includes(ext)) return 'video';

    // Audio
    const audioExts = ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac'];
    if (audioExts.includes(ext)) return 'audio';

    // Documents
    const docExts = ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'];
    if (docExts.includes(ext)) return 'document';

    // Spreadsheets
    const spreadsheetExts = ['xls', 'xlsx', 'csv', 'ods'];
    if (spreadsheetExts.includes(ext)) return 'spreadsheet';

    // Archives
    const archiveExts = ['zip', 'rar', '7z', 'tar', 'gz', 'bz2'];
    if (archiveExts.includes(ext)) return 'archive';

    // Code
    const codeExts = ['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'c', 'cpp', 'cs', 'php', 'rb', 'go', 'rs', 'swift', 'html', 'css', 'json', 'xml', 'yaml', 'yml'];
    if (codeExts.includes(ext)) return 'code';

    return 'file';
};

/**
 * Get icon component for file type
 */
export const getFileIcon = (filename, isFolder = false) => {
    if (isFolder) return Folder;

    const type = getFileType(filename);

    switch (type) {
        case 'image':
            return FileImage;
        case 'video':
            return FileVideo;
        case 'audio':
            return FileAudio;
        case 'document':
            return FileText;
        case 'spreadsheet':
            return FileSpreadsheet;
        case 'archive':
            return FileArchive;
        case 'code':
            return FileCode;
        default:
            return File;
    }
};

/**
 * Check if file is previewable (image, video, audio)
 */
export const isPreviewable = (filename) => {
    const type = getFileType(filename);
    return ['image', 'video', 'audio'].includes(type);
};

/**
 * Parse S3 key to get folder path and filename
 */
export const parseS3Key = (key) => {
    if (!key) return { folder: '', filename: '' };

    const parts = key.split('/');
    const filename = parts.pop() || '';
    const folder = parts.join('/');

    return { folder, filename };
};

/**
 * Build S3 key from folder and filename
 */
export const buildS3Key = (folder, filename) => {
    if (!folder) return filename;
    return `${folder}/${filename}`;
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text, maxLength = 50) => {
    if (!text || text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
};
