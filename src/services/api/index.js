/**
 * Unified API Client
 * 
 * Single entry point for all backend API calls.
 * 
 * Usage:
 *   import { api } from '@/services/api';
 *   
 *   // Buckets
 *   const buckets = await api.buckets.list();
 *   await api.buckets.create({ ... });
 *   
 *   // Files (via backend)
 *   await api.files.upload(file, { onProgress });
 *   
 *   // Links
 *   await api.links.shorten({ url: '...' });
 */

import { buckets } from './buckets.js';
import { files } from './files.js';
import { links } from './links.js';

export const api = {
    buckets,
    files,
    links
};

// Also export individual modules for tree-shaking
export { buckets, files, links };

// Export client utilities for advanced use
export { apiRequest, apiUpload, API_BASE } from './client.js';
