-- ============================================================================
-- Migration 002: Upload History (Simplified)
-- ============================================================================

-- 1. UPLOAD HISTORY
-- Tracks files uploaded for showing them on other devices
CREATE TABLE IF NOT EXISTS upload_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    bucket_id UUID REFERENCES bucket_configurations(id) ON DELETE SET NULL,
    
    -- File Details
    s3_key TEXT NOT NULL,
    original_name TEXT NOT NULL,
    size BIGINT NOT NULL,
    mime_type VARCHAR(255),
    
    -- Sync Metadata
    short_url TEXT,
    s3_bucket VARCHAR(255),
    s3_region VARCHAR(50),
    compressed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Prevent duplicate entries for same file
    CONSTRAINT unique_user_file UNIQUE(user_id, s3_key)
);

-- Index for faster dashboard loading
CREATE INDEX IF NOT EXISTS idx_history_user_date ON upload_history(user_id, created_at DESC);

-- 2. ROW LEVEL SECURITY (RLS)
ALTER TABLE upload_history ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users manage own history" ON upload_history
    FOR ALL USING (auth.uid() = user_id);

-- Service Role (Backend) Access
CREATE POLICY "Service role full access" ON upload_history
    FOR ALL USING (auth.role() = 'service_role');
