/**
 * S3 Service (Legacy Compatibility Layer)
 * 
 * ⚠️ DEPRECATED: This file is kept for backward compatibility.
 * 
 * All logic has been refactored into separate modules:
 * - ./s3Client.js     → Client initialization, validation
 * - ./s3List.js       → List operations
 * - ./s3Upload.js     → Upload operations
 * - ./s3Download.js   → Download + presigned URLs
 * - ./s3Manage.js     → Delete, rename, move, folder ops
 * - ./s3Stats.js      → Bucket statistics
 * 
 * New code should import from './index.js' or specific modules.
 * This file re-exports everything for existing imports.
 */

// Re-export all from centralized index
export * from './index.js';
