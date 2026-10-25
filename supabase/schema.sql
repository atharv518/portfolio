-- ============================================================
-- SUPABASE SCHEMA: Contact Messages with Row Level Security (RLS)
-- ============================================================
-- Non-destructive script (contains ZERO DROP statements).
-- Safe to run in new or existing Supabase projects.

-- 1. Create the contacts table if it doesn't already exist
CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    email_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create index for fast sorting by date
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON public.contacts (created_at DESC);

-- 3. Enable Row Level Security (RLS)
-- In PostgreSQL/Supabase, enabling RLS without policies automatically blocks
-- all public access (default-deny). Public users CANNOT read or write any rows.
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- 4. Revoke public/anonymous API access
-- Prevents anonymous visitors from accessing this table via public API keys.
REVOKE ALL ON TABLE public.contacts FROM anon, authenticated;

-- 5. Explicitly grant backend permissions to the service_role
-- Ensures your backend (which uses SUPABASE_SECRET_KEY) has full permission
-- to insert new contact submissions and update the email_sent status.
GRANT ALL ON TABLE public.contacts TO service_role;
