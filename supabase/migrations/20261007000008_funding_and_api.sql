-- supabase/migrations/20261007000008_funding_and_api.sql
-- ==============================================================================
-- PHASE 9: TRANSPARENT FUNDING & THE SENTIMENT API
-- ==============================================================================
-- "Build /funding — radical financial transparency: show current monthly server costs,
-- current donations received, and current runway in plain numbers. Add a 'support the truth'
-- contribution option (Stripe, one-time or monthly, suggested $3–5).
-- Hard rules: no ads, no affiliate exchange links, no sponsored content — ever.
-- Build a public API for sentiment data: free tier (24h delayed + attribution),
-- paid tier (Stripe $49/mo, real-time feeds, full history, webhooks). Rate-limited,
-- API-key managed in dashboard."
-- ==============================================================================

-- 1. Funding Ledger Table (Radical Financial Transparency)
CREATE TABLE IF NOT EXISTS public.funding_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('cost', 'donation', 'reserve')),
    category TEXT NOT NULL CHECK (category IN (
        'infrastructure',
        'database',
        'market_data_feeds',
        'security_and_dns',
        'community_donation',
        'api_subscription',
        'initial_reserve'
    )),
    amount_cents BIGINT NOT NULL CHECK (amount_cents > 0), -- Integer cents invariant
    description TEXT NOT NULL,
    donor_name TEXT,
    is_anonymous BOOLEAN DEFAULT false,
    period_month TEXT NOT NULL, -- Format: YYYY-MM
    stripe_payment_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for monthly cost and donation aggregation
CREATE INDEX IF NOT EXISTS idx_funding_period_month ON public.funding_ledger (period_month);
CREATE INDEX IF NOT EXISTS idx_funding_type ON public.funding_ledger (type);

-- 2. Developer API Keys Table
CREATE TABLE IF NOT EXISTS public.api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    key_hash TEXT NOT NULL UNIQUE,
    key_prefix TEXT NOT NULL, -- e.g., 'cel_live_...'
    tier TEXT NOT NULL CHECK (tier IN ('free', 'pro')) DEFAULT 'free',
    name TEXT NOT NULL DEFAULT 'Default API Key',
    monthly_limit INTEGER NOT NULL DEFAULT 1000,
    current_month_requests INTEGER NOT NULL DEFAULT 0,
    last_used_at TIMESTAMPTZ,
    is_revoked BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_api_keys_user ON public.api_keys (user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON public.api_keys (key_hash);

-- 3. API Request Logs (Audit & Rate Limiting)
CREATE TABLE IF NOT EXISTS public.api_request_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key_id UUID REFERENCES public.api_keys(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    tier TEXT NOT NULL,
    status_code INTEGER NOT NULL,
    ip_hash TEXT NOT NULL,
    latency_ms INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_api_logs_key_time ON public.api_request_logs (key_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.funding_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_request_logs ENABLE ROW LEVEL SECURITY;

-- Funding ledger is publicly readable (Radical Financial Transparency)
CREATE POLICY "Public read access to funding ledger"
    ON public.funding_ledger FOR SELECT
    USING (true);

-- API keys can only be read and managed by their owner
CREATE POLICY "Users can manage own api keys"
    ON public.api_keys FOR ALL
    USING (auth.uid()::text = user_id);

-- Request logs can only be read by key owners
CREATE POLICY "Users can read own api logs"
    ON public.api_request_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.api_keys
            WHERE public.api_keys.id = public.api_request_logs.key_id
            AND public.api_keys.user_id = auth.uid()::text
        )
    );
