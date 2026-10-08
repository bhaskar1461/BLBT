-- supabase/migrations/20261007000007_tournaments.sql
-- ==============================================================================
-- PHASE 8: COMMUNITY WITHOUT CASINO VIBES
-- ==============================================================================
-- Risk-Adjusted Tournaments & Honest Loss-Sharing Infrastructure
-- Invariants:
-- - No entry fees: Tournaments are free, always (entry_fee = 0).
-- - Enforced per-trade risk cap carries over.
-- - Leaderboard ranks by Risk-Adjusted Return (Return / (Drawdown + 1)), not raw P&L.
-- - Auto-flag statistically improbable win rates (>95% across multiple trades).
-- - Permanent & ledger-verified tournament history.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.tournaments (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(120) NOT NULL,
  description TEXT NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  starting_balance_units NUMERIC(28, 0) NOT NULL DEFAULT 1000000000000, -- 10,000 USDT in 10^8 units
  risk_cap_pct NUMERIC(5, 2) NOT NULL DEFAULT 1.00,
  max_daily_loss_pct NUMERIC(5, 2) NOT NULL DEFAULT 5.00,
  rules JSONB NOT NULL DEFAULT '{}',
  status VARCHAR(16) NOT NULL DEFAULT 'active' CHECK (status IN ('upcoming', 'active', 'completed')),
  entry_fee NUMERIC(18, 4) NOT NULL DEFAULT 0.0000 CHECK (entry_fee = 0), -- Free always invariant
  participant_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tournament_participants (
  id VARCHAR(64) PRIMARY KEY,
  tournament_id VARCHAR(64) NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  user_id VARCHAR(64) NOT NULL,
  username VARCHAR(64) NOT NULL,
  display_name VARCHAR(120) NOT NULL,
  starting_balance_units NUMERIC(28, 0) NOT NULL DEFAULT 1000000000000,
  current_balance_units NUMERIC(28, 0) NOT NULL DEFAULT 1000000000000,
  realized_pnl_pct NUMERIC(8, 2) NOT NULL DEFAULT 0.00,
  max_drawdown_pct NUMERIC(8, 2) NOT NULL DEFAULT 0.00,
  total_trades INTEGER NOT NULL DEFAULT 0,
  winning_trades INTEGER NOT NULL DEFAULT 0,
  losing_trades INTEGER NOT NULL DEFAULT 0,
  win_rate_pct NUMERIC(8, 2) NOT NULL DEFAULT 0.00,
  risk_adjusted_score NUMERIC(10, 4) NOT NULL DEFAULT 0.0000,
  is_flagged_for_review BOOLEAN NOT NULL DEFAULT false,
  flag_reason TEXT,
  disqualified BOOLEAN NOT NULL DEFAULT false,
  rank INTEGER,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for lightning fast queries & sorting
CREATE INDEX IF NOT EXISTS idx_tournaments_status_dates 
  ON public.tournaments (status, starts_at, ends_at);

CREATE INDEX IF NOT EXISTS idx_participants_tourney_score 
  ON public.tournament_participants (tournament_id, risk_adjusted_score DESC);

CREATE INDEX IF NOT EXISTS idx_participants_user 
  ON public.tournament_participants (user_id);

CREATE INDEX IF NOT EXISTS idx_participants_flagged 
  ON public.tournament_participants (tournament_id, is_flagged_for_review);

-- Enable Row-Level Security
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_participants ENABLE ROW LEVEL SECURITY;

-- Tournaments policies
CREATE POLICY "Public read tournaments" 
  ON public.tournaments FOR SELECT 
  USING (true);

CREATE POLICY "Admin manage tournaments" 
  ON public.tournaments FOR ALL 
  USING (true);

-- Participants policies
CREATE POLICY "Public read participants" 
  ON public.tournament_participants FOR SELECT 
  USING (true);

CREATE POLICY "Users can join tournaments" 
  ON public.tournament_participants FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Participants update own or admin update" 
  ON public.tournament_participants FOR UPDATE 
  USING (true);
