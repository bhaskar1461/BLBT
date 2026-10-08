-- ==============================================================================
-- Migration: 20261006000002_retention_virality_schema.sql
-- Description: Phase 7 Schema for Leaderboard, Closed Trades, Streaks, Feedback
-- ==============================================================================

-- 1. Table: paper_closed_trades (Historical closed positions for P&L tracking & share cards)
CREATE TABLE IF NOT EXISTS public.paper_closed_trades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    side VARCHAR(10) NOT NULL CHECK (side IN ('long', 'short')),
    quantity_units BIGINT NOT NULL CHECK (quantity_units > 0),
    entry_price_units BIGINT NOT NULL CHECK (entry_price_units > 0),
    exit_price_units BIGINT NOT NULL CHECK (exit_price_units > 0),
    margin_units BIGINT NOT NULL,
    realized_pnl_units BIGINT NOT NULL, -- signed delta
    realized_pnl_pct NUMERIC(12, 4) NOT NULL, -- percentage e.g. 15.4200
    fee_units BIGINT NOT NULL DEFAULT 0,
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    opened_at TIMESTAMPTZ NOT NULL,
    closed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Table: user_streaks (Daily visit streak tracking)
CREATE TABLE IF NOT EXISTS public.user_streaks (
    user_id UUID PRIMARY KEY,
    current_streak INTEGER NOT NULL DEFAULT 1,
    longest_streak INTEGER NOT NULL DEFAULT 1,
    last_visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Table: user_feedback (In-app feedback submitted to administrators)
CREATE TABLE IF NOT EXISTS public.user_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(100) NOT NULL,
    user_email VARCHAR(255),
    category VARCHAR(50) NOT NULL CHECK (category IN ('bug', 'feature', 'praise', 'general')),
    message TEXT NOT NULL,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    status VARCHAR(30) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'resolved')),
    admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Table: leaderboard_cache (Aggregated rankings snapshot for high performance)
CREATE TABLE IF NOT EXISTS public.leaderboard_cache (
    timeframe VARCHAR(10) PRIMARY KEY CHECK (timeframe IN ('24h', '7d', '30d', 'all')),
    rankings JSONB NOT NULL DEFAULT '[]'::jsonb,
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_closed_trades_user_closed ON public.paper_closed_trades(user_id, closed_at DESC);
CREATE INDEX IF NOT EXISTS idx_closed_trades_symbol ON public.paper_closed_trades(symbol);
CREATE INDEX IF NOT EXISTS idx_user_feedback_status ON public.user_feedback(status, created_at DESC);

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.paper_closed_trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_cache ENABLE ROW LEVEL SECURITY;

-- 7. Policies
-- paper_closed_trades: Public read for shareable trades, authenticated users can insert own
CREATE POLICY "Public can view closed trades for share verification"
    ON public.paper_closed_trades FOR SELECT
    USING (true);

CREATE POLICY "Users can insert own closed trades"
    ON public.paper_closed_trades FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- user_streaks: Users can view and update own streak
CREATE POLICY "Users can view own streaks"
    ON public.user_streaks FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own streaks"
    ON public.user_streaks FOR UPDATE
    USING (auth.uid() = user_id);

-- user_feedback: Any authenticated user can insert feedback
CREATE POLICY "Users can insert feedback"
    ON public.user_feedback FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Admins can view and manage all feedback"
    ON public.user_feedback FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- leaderboard_cache: Public read-only
CREATE POLICY "Public can view leaderboard cache"
    ON public.leaderboard_cache FOR SELECT
    USING (true);
