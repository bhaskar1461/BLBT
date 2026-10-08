-- supabase/migrations/20261007000006_backtester.sql
-- ==============================================================================
-- PHASE 7: THE BACKTESTER (THE RETENTION ENGINE)
-- ==============================================================================
-- Preset Strategy Library (MA Crossover, RSI Thresholds, Breakouts, DCA)
-- Historical simulation against authoritative Binance data with:
-- - Real 0.10% transaction fee deductions
-- - Max drawdown and win rate calculations
-- - Permanently visible Buy-and-Hold benchmark comparison
-- - Plain-language honest summary lines
-- - One-click adoption forward into paper trading
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.backtest_presets (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  strategy_type VARCHAR(32) NOT NULL CHECK (strategy_type IN ('ma_crossover', 'rsi_thresholds', 'breakouts', 'dca')),
  description TEXT NOT NULL,
  parameters JSONB NOT NULL,
  reality_fact TEXT NOT NULL,
  is_system BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.backtest_runs (
  id VARCHAR(64) PRIMARY KEY,
  user_id UUID,
  strategy_type VARCHAR(32) NOT NULL CHECK (strategy_type IN ('ma_crossover', 'rsi_thresholds', 'breakouts', 'dca')),
  symbol VARCHAR(32) NOT NULL,
  timeframe VARCHAR(16) NOT NULL,
  period_days INTEGER NOT NULL CHECK (period_days > 0),
  initial_capital NUMERIC(18, 4) NOT NULL,
  final_equity NUMERIC(18, 4) NOT NULL,
  return_pct NUMERIC(8, 2) NOT NULL,
  max_drawdown_pct NUMERIC(8, 2) NOT NULL,
  win_rate_pct NUMERIC(8, 2) NOT NULL,
  total_trades INTEGER NOT NULL DEFAULT 0,
  total_fees_paid NUMERIC(18, 4) NOT NULL DEFAULT 0,
  benchmark_return_pct NUMERIC(8, 2) NOT NULL,
  alpha_pct NUMERIC(8, 2) NOT NULL,
  honest_summary_line TEXT NOT NULL,
  parameters JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_forward_strategies (
  id VARCHAR(64) PRIMARY KEY,
  user_id UUID,
  strategy_type VARCHAR(32) NOT NULL CHECK (strategy_type IN ('ma_crossover', 'rsi_thresholds', 'breakouts', 'dca')),
  symbol VARCHAR(32) NOT NULL,
  timeframe VARCHAR(16) NOT NULL,
  parameters JSONB NOT NULL,
  risk_per_trade_cap_pct NUMERIC(5, 2) NOT NULL DEFAULT 1.00,
  status VARCHAR(16) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'stopped')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_backtest_runs_strategy 
  ON public.backtest_runs (strategy_type, symbol);

CREATE INDEX IF NOT EXISTS idx_backtest_runs_created 
  ON public.backtest_runs (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_forward_strategies_user 
  ON public.user_forward_strategies (user_id, status);

-- Enable RLS
ALTER TABLE public.backtest_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backtest_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_forward_strategies ENABLE ROW LEVEL SECURITY;

-- Presets: Public read
CREATE POLICY "Public read presets"
  ON public.backtest_presets FOR SELECT
  USING (true);

-- Backtest Runs: Public read for shareability
CREATE POLICY "Public read backtest runs"
  ON public.backtest_runs FOR SELECT
  USING (true);

CREATE POLICY "Insert backtest runs"
  ON public.backtest_runs FOR INSERT
  WITH CHECK (true);

-- Forward Strategies: Owner read/write
CREATE POLICY "Users read own forward strategies"
  ON public.user_forward_strategies FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users insert own forward strategies"
  ON public.user_forward_strategies FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
