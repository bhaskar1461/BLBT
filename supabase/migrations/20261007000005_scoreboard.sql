-- supabase/migrations/20261007000005_scoreboard.sql
-- ==============================================================================
-- PHASE 6: THE SCOREBOARD (THE CONTROVERSY ENGINE)
-- ==============================================================================
-- Public Trading Call Scoring & Accountability Ledger
-- Every call by public figures/influencers is scored against authoritative Binance prices.
-- Result: 'correct' | 'wrong' | 'undefined'
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.public_trading_calls (
  id TEXT PRIMARY KEY,
  caller_name VARCHAR(120) NOT NULL,
  caller_handle VARCHAR(120),
  platform VARCHAR(32) NOT NULL CHECK (platform IN ('youtube', 'twitter', 'telegram', 'tiktok', 'tv', 'discord', 'other')),
  symbol VARCHAR(32) NOT NULL,
  direction VARCHAR(16) NOT NULL CHECK (direction IN ('bullish', 'bearish')),
  entry_price NUMERIC(18, 4) NOT NULL CHECK (entry_price > 0),
  called_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  timeframe_days INTEGER NOT NULL CHECK (timeframe_days > 0),
  expires_at TIMESTAMPTZ NOT NULL,
  proof_url TEXT,
  notes TEXT,
  status VARCHAR(16) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'scored', 'undefined')),
  exit_price NUMERIC(18, 4),
  result VARCHAR(16) CHECK (result IN ('correct', 'wrong', 'undefined')),
  price_change_pct NUMERIC(8, 2),
  scored_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for lightning fast lookups & cron evaluation
CREATE INDEX IF NOT EXISTS idx_calls_caller_name 
  ON public.public_trading_calls (caller_name);

CREATE INDEX IF NOT EXISTS idx_calls_platform 
  ON public.public_trading_calls (platform);

CREATE INDEX IF NOT EXISTS idx_calls_status_expires 
  ON public.public_trading_calls (status, expires_at);

CREATE INDEX IF NOT EXISTS idx_calls_symbol 
  ON public.public_trading_calls (symbol);

-- Enable Row-Level Security
ALTER TABLE public.public_trading_calls ENABLE ROW LEVEL SECURITY;

-- 1. Read Policy: Everyone can inspect all scored and pending calls
CREATE POLICY "Public read access for trading calls"
  ON public.public_trading_calls
  FOR SELECT
  USING (true);

-- 2. Insert Policy: Anyone can submit a call for public scoring
CREATE POLICY "Public insert access for submitting calls"
  ON public.public_trading_calls
  FOR INSERT
  WITH CHECK (
    caller_name IS NOT NULL AND
    symbol IS NOT NULL AND
    entry_price > 0 AND
    timeframe_days > 0
  );

-- 3. Update Policy: Only privileged server routes / admins can score calls
CREATE POLICY "Only admin or service role can score calls"
  ON public.public_trading_calls
  FOR UPDATE
  USING (
    auth.role() = 'service_role' OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
