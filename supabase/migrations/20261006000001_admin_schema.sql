-- ==============================================================================
-- Migration: 20261006000001_admin_schema.sql
-- Description: Phase 5 Admin Schema (Profiles, Role, Audit Log, Feature Flags, Announcements)
-- Rules:
--   1. Role column on profiles table, default 'user'
--   2. admin_audit_log is append-only
--   3. Strict RLS isolating admin tables
-- ==============================================================================

-- 1. Create or extend profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(100),
    role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'frozen')),
    last_active TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Helper query to promote an admin:
-- UPDATE public.profiles SET role = 'admin' WHERE id = 'YOUR-USER-ID';

-- 2. Create admin_audit_log (Append-only)
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL,
    admin_email VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    target VARCHAR(255),
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    ip_address VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enforce append-only on admin_audit_log
CREATE OR REPLACE FUNCTION public.fn_prevent_audit_log_tampering()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'admin_audit_log is an immutable append-only table. Updates and deletions are forbidden.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_audit_log_update ON public.admin_audit_log;
CREATE TRIGGER trg_prevent_audit_log_update
    BEFORE UPDATE OR DELETE ON public.admin_audit_log
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_prevent_audit_log_tampering();

-- 3. Create feature_flags table
CREATE TABLE IF NOT EXISTS public.feature_flags (
    key VARCHAR(50) PRIMARY KEY,
    description TEXT NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT true,
    updated_by VARCHAR(255),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Seed standard feature flags
INSERT INTO public.feature_flags (key, description, enabled)
VALUES
    ('paper_trading', 'Virtual USDT paper trading simulation and order execution engine', true),
    ('indicators', 'Technical indicators (EMA, SMA, RSI, MACD) chart overlays', true),
    ('alerts', 'Real-time price alert trigger notifications and sound pings', true)
ON CONFLICT (key) DO NOTHING;

-- 4. Create announcements table
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'warning', 'critical')),
    dismissible BOOLEAN NOT NULL DEFAULT true,
    expires_at TIMESTAMPTZ,
    active BOOLEAN NOT NULL DEFAULT true,
    created_by VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Create admin_messages (Broadcast messages to specific users)
CREATE TABLE IF NOT EXISTS public.admin_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    admin_id UUID NOT NULL,
    title VARCHAR(150) NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.admin_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_admin_id ON public.admin_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_messages_user_read ON public.admin_messages(user_id, is_read);

-- 7. Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_messages ENABLE ROW LEVEL SECURITY;

-- 8. Policies
-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.fn_is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles policies
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id OR public.fn_is_admin());

CREATE POLICY "Users can update own display profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id OR public.fn_is_admin());

-- Audit log policies (Admin only view, Insert allowed via authenticated admin)
CREATE POLICY "Admins can view audit logs"
    ON public.admin_audit_log FOR SELECT
    USING (public.fn_is_admin());

CREATE POLICY "Admins can insert audit logs"
    ON public.admin_audit_log FOR INSERT
    WITH CHECK (public.fn_is_admin());

-- Feature flags policies (Users can read flags, admins can edit)
CREATE POLICY "Anyone authenticated can view feature flags"
    ON public.feature_flags FOR SELECT
    USING (true);

CREATE POLICY "Admins can update feature flags"
    ON public.feature_flags FOR UPDATE
    USING (public.fn_is_admin());

-- Announcements policies (All users can view active, admins can modify)
CREATE POLICY "Anyone can view active announcements"
    ON public.announcements FOR SELECT
    USING (active = true OR public.fn_is_admin());

CREATE POLICY "Admins can manage announcements"
    ON public.announcements FOR ALL
    USING (public.fn_is_admin());

-- Admin messages policies (Target user can read, admin can send)
CREATE POLICY "Users can read own messages"
    ON public.admin_messages FOR SELECT
    USING (auth.uid() = user_id OR public.fn_is_admin());

CREATE POLICY "Users can update read status on own messages"
    ON public.admin_messages FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can insert messages"
    ON public.admin_messages FOR INSERT
    WITH CHECK (public.fn_is_admin());
