/**
 * Upload History Service (Supabase)
 * 
 * Tracks user uploads for cross-device sync.
 * Each upload is stored with metadata and linked to the user.
 * 
 * Required table:
 * CREATE TABLE upload_history (
 *     id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
 *     user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 *     bucket_id UUID REFERENCES bucket_configurations(id) ON DELETE SET NULL,
 *     s3_key TEXT NOT NULL,
 *     original_name TEXT NOT NULL,
 *     size BIGINT NOT NULL,
 *     original_size BIGINT,
 *     mime_type TEXT,
 *     short_url TEXT,
 *     short_code TEXT,
 *     s3_bucket TEXT,
 *     s3_region TEXT,
 *     compressed BOOLEAN DEFAULT false,
 *     created_at TIMESTAMPTZ DEFAULT NOW(),
 *     UNIQUE(user_id, s3_key)
 * );
 * 
 * CREATE INDEX idx_upload_history_user ON upload_history(user_id);
 * CREATE INDEX idx_upload_history_created ON upload_history(created_at DESC);
 */

const { getAdminClient } = require('../config/supabase');

const TABLE_NAME = 'upload_history';
const MAX_HISTORY_PER_USER = 100;

// Cache to avoid repeated table check failures
let tableExists = null;

/**
 * Check if admin client is available
 */
function getClient() {
    try {
        return getAdminClient();
    } catch (e) {
        console.warn('[UploadHistory] Admin client not available:', e.message);
        return null;
    }
}

/**
 * Record an upload
 */
async function recordUpload(userId, data) {
    try {
        const supabase = getClient();
        if (!supabase) return { success: false, error: 'Database not available' };

        const record = {
            user_id: userId,
            bucket_id: data.bucketId || null,
            s3_key: data.key,
            original_name: data.originalName,
            size: data.size,
            original_size: data.originalSize || data.size, // Track original size for compression stats
            mime_type: data.mimeType || null,
            short_url: data.shortUrl || null,
            s3_bucket: data.s3Bucket || null,
            s3_region: data.s3Region || null,
            compressed: data.compressed || false,
        };

        const { data: upload, error } = await supabase
            .from(TABLE_NAME)
            .upsert(record, { onConflict: 'user_id,s3_key' })
            .select()
            .single();

        if (error) {
            // Check if table doesn't exist
            if (error.code === '42P01' || error.message?.includes('does not exist')) {
                tableExists = false;
                console.warn('[UploadHistory] Table not found - run migration');
                return { success: false, error: 'History table not configured' };
            }
            console.error('[UploadHistory] Record error:', error.message);
            return { success: false, error: error.message };
        }

        // Trim old uploads if over limit (non-blocking)
        trimHistory(userId).catch(() => { });

        return { success: true, upload };
    } catch (error) {
        console.error('[UploadHistory] Record error:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Get user's upload history
 */
async function getHistory(userId, limit = 50, offset = 0) {
    try {
        const supabase = getClient();
        if (!supabase) return { success: false, error: 'Database not available', files: [] };

        const { data: uploads, error, count } = await supabase
            .from(TABLE_NAME)
            .select('*', { count: 'exact' })
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            // Handle missing table gracefully
            if (error.code === '42P01' || error.message?.includes('does not exist')) {
                return { success: true, files: [], total: 0 };
            }
            console.error('[UploadHistory] Get error:', error.message);
            return { success: false, error: error.message, files: [] };
        }

        // Transform to frontend format
        const files = (uploads || []).map(u => ({
            key: u.s3_key,
            name: u.original_name,
            size: u.size,
            originalSize: u.original_size || u.size, // Include original size for savings calculation
            type: u.mime_type,
            url: u.short_url,
            s3Bucket: u.s3_bucket,
            s3Region: u.s3_region,
            compressed: u.compressed,
            uploadedAt: u.created_at,
        }));

        return { success: true, files, total: count };
    } catch (error) {
        console.error('[UploadHistory] Get error:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Delete upload record (when file is deleted)
 */
async function deleteUpload(userId, s3Key) {
    try {
        const supabase = getAdminClient();

        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .eq('user_id', userId)
            .eq('s3_key', s3Key);

        if (error) {
            console.error('[UploadHistory] Delete error:', error.message);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error) {
        console.error('[UploadHistory] Delete error:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Delete multiple upload records
 */
async function deleteUploads(userId, s3Keys) {
    try {
        const supabase = getAdminClient();

        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .eq('user_id', userId)
            .in('s3_key', s3Keys);

        if (error) {
            console.error('[UploadHistory] Delete many error:', error.message);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error) {
        console.error('[UploadHistory] Delete many error:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Trim old uploads to keep under limit
 */
async function trimHistory(userId) {
    try {
        const supabase = getAdminClient();

        // Get count
        const { count } = await supabase
            .from(TABLE_NAME)
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

        if (count <= MAX_HISTORY_PER_USER) return;

        // Get IDs to delete (oldest)
        const { data: oldUploads } = await supabase
            .from(TABLE_NAME)
            .select('id')
            .eq('user_id', userId)
            .order('created_at', { ascending: true })
            .limit(count - MAX_HISTORY_PER_USER);

        if (oldUploads?.length) {
            await supabase
                .from(TABLE_NAME)
                .delete()
                .in('id', oldUploads.map(u => u.id));
        }
    } catch (error) {
        console.error('[UploadHistory] Trim error:', error.message);
    }
}

/**
 * Check if table exists (for graceful degradation)
 */
async function isEnabled() {
    try {
        const supabase = getAdminClient();
        const { error } = await supabase
            .from(TABLE_NAME)
            .select('id')
            .limit(1);

        return !error;
    } catch {
        return false;
    }
}

module.exports = {
    recordUpload,
    getHistory,
    deleteUpload,
    deleteUploads,
    isEnabled,
};
