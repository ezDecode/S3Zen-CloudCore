/**
 * Shortlinks Service (Supabase)
 * Manages URL shortening using Supabase Postgres
 * 
 * Required table:
 * CREATE TABLE shortlinks (
 *     code TEXT PRIMARY KEY,
 *     url TEXT NOT NULL,
 *     s3_bucket TEXT,
 *     s3_key TEXT,
 *     s3_region TEXT,
 *     user_id UUID REFERENCES auth.users(id),
 *     is_permanent BOOLEAN DEFAULT false,
 *     created_at TIMESTAMPTZ DEFAULT NOW()
 * );
 * 
 * RLS Policy (optional):
 * CREATE POLICY "Users can view own links" ON shortlinks
 *     FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);
 */

const { getAdminClient } = require('../config/supabase');
const { generateShortCode } = require('../utils/idGen');

const TABLE_NAME = 'shortlinks';

/**
 * Create a short URL
 */
async function createShortlink(data) {
    const { url, s3Bucket, s3Key, s3Region, userId, permanent } = data;

    try {
        const supabase = getAdminClient();

        // Check for existing code (collision detection)
        const checkExists = async (code) => {
            const { data } = await supabase
                .from(TABLE_NAME)
                .select('code')
                .eq('code', code)
                .single();
            return !!data;
        };

        const code = await generateShortCode(checkExists);

        const { error } = await supabase
            .from(TABLE_NAME)
            .insert({
                code,
                original_url: url,
                s3_bucket: s3Bucket || null,
                s3_key: s3Key || null,
                s3_region: s3Region || null,
                user_id: userId || null
            });

        if (error) {
            console.error('[Shortlinks] Insert error:', error);
            return { success: false, error: error.message };
        }

        const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
        return {
            success: true,
            shortUrl: `${baseUrl}/s/${code}`,
            shortCode: code,
            permanent: permanent || !!(s3Bucket && s3Key)
        };
    } catch (error) {
        console.error('[Shortlinks] Create error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get shortlink by code
 */
async function getShortlink(code) {
    try {
        const supabase = getAdminClient();

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .eq('code', code)
            .single();

        if (error || !data) {
            return { success: false, error: 'Short URL not found' };
        }

        // Map original_url to url for compatibility
        data.url = data.original_url;

        return { success: true, link: data };
    } catch (error) {
        console.error('[Shortlinks] Get error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get user's shortlinks
 */
async function getUserShortlinks(userId, limit = 50) {
    try {
        const supabase = getAdminClient();

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true, links: data || [] };
    } catch (error) {
        console.error('[Shortlinks] GetUser error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Delete a shortlink
 */
async function deleteShortlink(code, userId = null) {
    try {
        const supabase = getAdminClient();

        let query = supabase.from(TABLE_NAME).delete().eq('code', code);

        // If userId provided, verify ownership
        if (userId) {
            query = query.eq('user_id', userId);
        }

        const { error } = await query;

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error) {
        console.error('[Shortlinks] Delete error:', error);
        return { success: false, error: error.message };
    }
}

module.exports = {
    createShortlink,
    getShortlink,
    getUserShortlinks,
    deleteShortlink
};
