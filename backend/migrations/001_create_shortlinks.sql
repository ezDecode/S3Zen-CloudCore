-- Shortlinks Table Migration
-- Run this in Supabase SQL Editor to create the shortlinks table

-- Create shortlinks table
CREATE TABLE IF NOT EXISTS public.shortlinks (
    code TEXT PRIMARY KEY,
    url TEXT NOT NULL,
    s3_bucket TEXT,
    s3_key TEXT,
    s3_region TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    is_permanent BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for user lookups
CREATE INDEX IF NOT EXISTS idx_shortlinks_user_id ON public.shortlinks(user_id);

-- Create index for created_at (for recent links)
CREATE INDEX IF NOT EXISTS idx_shortlinks_created_at ON public.shortlinks(created_at DESC);

-- Enable RLS
ALTER TABLE public.shortlinks ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read links (for redirect to work)
CREATE POLICY "Anyone can read shortlinks" ON public.shortlinks
    FOR SELECT USING (true);

-- Policy: Service role can insert
CREATE POLICY "Service role can insert shortlinks" ON public.shortlinks
    FOR INSERT WITH CHECK (true);

-- Policy: Users can delete own links
CREATE POLICY "Users can delete own shortlinks" ON public.shortlinks
    FOR DELETE USING (user_id = auth.uid());

-- Grant access
GRANT SELECT ON public.shortlinks TO anon;
GRANT SELECT, INSERT ON public.shortlinks TO authenticated;
GRANT ALL ON public.shortlinks TO service_role;

-- Comment
COMMENT ON TABLE public.shortlinks IS 'URL shortener with optional S3 link data for permanent access';
