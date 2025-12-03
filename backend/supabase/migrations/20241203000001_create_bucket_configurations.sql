CREATE TABLE IF NOT EXISTS public.bucket_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    encrypted_credentials TEXT NOT NULL,
    iv TEXT NOT NULL,
    region VARCHAR(50) NOT NULL,
    bucket_name VARCHAR(63) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, bucket_name),
    UNIQUE (user_id, display_name)
);

CREATE INDEX IF NOT EXISTS idx_bucket_configurations_user_id ON public.bucket_configurations(user_id);

ALTER TABLE public.bucket_configurations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bucket_configurations_policy" ON public.bucket_configurations
    FOR ALL TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.bucket_configurations TO authenticated;
GRANT ALL ON public.bucket_configurations TO service_role;