/**
 * File Type Detection and Preview Utilities
 */

// File type categories
export const FILE_CATEGORIES = {
    IMAGE: 'image',
    VIDEO: 'video',
    AUDIO: 'audio',
    PDF: 'pdf',
    TEXT: 'text',
    CODE: 'code',
    MARKDOWN: 'markdown',
    OFFICE: 'office',
    ARCHIVE: 'archive',
    MODEL_3D: '3d',
    UNSUPPORTED: 'unsupported'
};

// Extension to category mapping
const EXTENSION_MAP = {
    // Images
    jpg: FILE_CATEGORIES.IMAGE,
    jpeg: FILE_CATEGORIES.IMAGE,
    png: FILE_CATEGORIES.IMAGE,
    gif: FILE_CATEGORIES.IMAGE,
    webp: FILE_CATEGORIES.IMAGE,
    svg: FILE_CATEGORIES.IMAGE,
    bmp: FILE_CATEGORIES.IMAGE,
    ico: FILE_CATEGORIES.IMAGE,
    
    // Videos
    mp4: FILE_CATEGORIES.VIDEO,
    webm: FILE_CATEGORIES.VIDEO,
    mov: FILE_CATEGORIES.VIDEO,
    avi: FILE_CATEGORIES.VIDEO,
    mkv: FILE_CATEGORIES.VIDEO,
    m4v: FILE_CATEGORIES.VIDEO,
    
    // Audio
    mp3: FILE_CATEGORIES.AUDIO,
    wav: FILE_CATEGORIES.AUDIO,
    ogg: FILE_CATEGORIES.AUDIO,
    m4a: FILE_CATEGORIES.AUDIO,
    flac: FILE_CATEGORIES.AUDIO,
    aac: FILE_CATEGORIES.AUDIO,
    
    // PDF
    pdf: FILE_CATEGORIES.PDF,
    
    // Text
    txt: FILE_CATEGORIES.TEXT,
    log: FILE_CATEGORIES.TEXT,
    
    // Code
    js: FILE_CATEGORIES.CODE,
    jsx: FILE_CATEGORIES.CODE,
    ts: FILE_CATEGORIES.CODE,
    tsx: FILE_CATEGORIES.CODE,
    json: FILE_CATEGORIES.CODE,
    html: FILE_CATEGORIES.CODE,
    css: FILE_CATEGORIES.CODE,
    scss: FILE_CATEGORIES.CODE,
    xml: FILE_CATEGORIES.CODE,
    yaml: FILE_CATEGORIES.CODE,
    yml: FILE_CATEGORIES.CODE,
    py: FILE_CATEGORIES.CODE,
    java: FILE_CATEGORIES.CODE,
    cpp: FILE_CATEGORIES.CODE,
    c: FILE_CATEGORIES.CODE,
    go: FILE_CATEGORIES.CODE,
    rs: FILE_CATEGORIES.CODE,
    php: FILE_CATEGORIES.CODE,
    rb: FILE_CATEGORIES.CODE,
    sh: FILE_CATEGORIES.CODE,
    sql: FILE_CATEGORIES.CODE,
    
    // Markdown
    md: FILE_CATEGORIES.MARKDOWN,
    markdown: FILE_CATEGORIES.MARKDOWN,
    
    // Office
    doc: FILE_CATEGORIES.OFFICE,
    docx: FILE_CATEGORIES.OFFICE,
    xls: FILE_CATEGORIES.OFFICE,
    xlsx: FILE_CATEGORIES.OFFICE,
    ppt: FILE_CATEGORIES.OFFICE,
    pptx: FILE_CATEGORIES.OFFICE,
    
    // Archives
    zip: FILE_CATEGORIES.ARCHIVE,
    rar: FILE_CATEGORIES.ARCHIVE,
    '7z': FILE_CATEGORIES.ARCHIVE,
    tar: FILE_CATEGORIES.ARCHIVE,
    gz: FILE_CATEGORIES.ARCHIVE,
    
    // 3D Models
    obj: FILE_CATEGORIES.MODEL_3D,
    stl: FILE_CATEGORIES.MODEL_3D,
    gltf: FILE_CATEGORIES.MODEL_3D,
    glb: FILE_CATEGORIES.MODEL_3D
};

/**
 * Detect file type from filename
 */
export const detectFileType = (fileName) => {
    if (!fileName) return FILE_CATEGORIES.UNSUPPORTED;
    
    const ext = fileName.split('.').pop()?.toLowerCase();
    return EXTENSION_MAP[ext] || FILE_CATEGORIES.UNSUPPORTED;
};

/**
 * Check if file is previewable
 */
export const isPreviewable = (fileName) => {
    const type = detectFileType(fileName);
    return type !== FILE_CATEGORIES.UNSUPPORTED && 
           type !== FILE_CATEGORIES.ARCHIVE;
};

/**
 * Get file extension
 */
export const getFileExtension = (fileName) => {
    if (!fileName) return '';
    return fileName.split('.').pop()?.toLowerCase() || '';
};

/**
 * Get language for syntax highlighting
 */
export const getLanguageFromExtension = (fileName) => {
    const ext = getFileExtension(fileName);
    
    const languageMap = {
        js: 'javascript',
        jsx: 'jsx',
        ts: 'typescript',
        tsx: 'tsx',
        py: 'python',
        java: 'java',
        cpp: 'cpp',
        c: 'c',
        go: 'go',
        rs: 'rust',
        php: 'php',
        rb: 'ruby',
        sh: 'bash',
        sql: 'sql',
        html: 'html',
        css: 'css',
        scss: 'scss',
        json: 'json',
        xml: 'xml',
        yaml: 'yaml',
        yml: 'yaml',
        md: 'markdown',
        txt: 'text'
    };
    
    return languageMap[ext] || 'text';
};

/**
 * Format file size
 */
export const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};
