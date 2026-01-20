-- ============================================================================
-- Migration 001: Buckets & Shortlinks (Simplified)
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. BUCKET CONFIGURATIONS
-- Stores user's encrypted S3 credentials
CREATE TABLE IF NOT EXISTS bucket_configurations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    bucket_name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    region VARCHAR(50) NOT NULL DEFAULT 'us-east-1',
    encrypted_credentials TEXT NOT NULL,
    iv TEXT NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure unique bucket names per user
CREATE UNIQUE INDEX IF NOT EXISTS unique_user_bucket ON bucket_configurations(user_id, bucket_name);

-- 2. SHORTLINKS
-- Stores valid short URLs for files
CREATE TABLE IF NOT EXISTS shortlinks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    code VARCHAR(16) NOT NULL UNIQUE,
    original_url TEXT NOT NULL,
    s3_key TEXT,
    s3_bucket VARCHAR(255),
    s3_region VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. AUTOMATIC TIMESTAMP UPDATE
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_bucket_timestamp
    BEFORE UPDATE ON bucket_configurations
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- 4. ROW LEVEL SECURITY (RLS)
-- Secure data so users only see their own stuff
ALTER TABLE bucket_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE shortlinks ENABLE ROW LEVEL SECURITY;

-- Buckets Policies
CREATE POLICY "Users manage own buckets" ON bucket_configurations
    FOR ALL USING (auth.uid() = user_id);

-- Shortlinks Policies
CREATE POLICY "Users manage own shortlinks" ON shortlinks
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public read shortlinks" ON shortlinks
    FOR SELECT USING (true);
