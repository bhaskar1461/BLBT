-- supabase/migrations/20261007000004_sentiment_snapshots.sql
-- ==============================================================================
-- PHASE 4: THE SENTIMENT INDEX (UNFAIR ADVANTAGE ENGINE)
-- ==============================================================================
-- Structural Privacy Invariants:
-- 1. AGGREGATE-ONLY: No user IDs or account foreign keys ever exist in this table.
-- 2. MINIMUM COHORT SIZE: trader_cohort_count must be at least 25 before any metric
--    is exposed publicly.
-- 3. APPEND-ONLY TIME-SERIES: Hourly snapshots captured for contrarian analytics.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.sentiment_snapshots (
  id TEXT PRIMARY KEY,
  symbol VARCHAR(32) NOT NULL,
  long_pct NUMERIC(5, 2) NOT NULL CHECK (long_pct >= 0 AND long_pct <= 100),
  short_pct NUMERIC(5, 2) NOT NULL CHECK (short_pct >= 0 AND short_pct <= 100),
  net_positioning_usdt NUMERIC(18, 2) NOT NULL DEFAULT 0.00,
  flow_trend VARCHAR(16) NOT NULL DEFAULT 'neutral' CHECK (flow_trend IN ('bullish', 'bearish', 'neutral')),
  trader_cohort_count INTEGER NOT NULL CHECK (trader_cohort_count >= 0),
  crowd_accuracy_pct NUMERIC(5, 2) NOT NULL DEFAULT 33.33,
  current_price NUMERIC(18, 4) NOT NULL,
  headline_insight TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for high-frequency time-series lookups by asset
CREATE INDEX IF NOT EXISTS idx_sentiment_snapshots_symbol_created 
  ON public.sentiment_snapshots (symbol, created_at DESC);

-- Enable Row-Level Security
ALTER TABLE public.sentiment_snapshots ENABLE ROW LEVEL SECURITY;

-- Structural Privacy Policy:
-- Public viewers and clients can only read aggregated cohorts of 25+ traders.
CREATE POLICY "Public read for cohorts meeting 25-trader threshold"
  ON public.sentiment_snapshots
  FOR SELECT
  USING (trader_cohort_count >= 25);

-- Service role only for inserting aggregate snapshots
CREATE POLICY "Service role can insert aggregate snapshots"
  ON public.sentiment_snapshots
  FOR INSERT
  WITH CHECK (true);
