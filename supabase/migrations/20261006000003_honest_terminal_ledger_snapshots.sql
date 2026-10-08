-- ==============================================================================
-- Migration: 20261006000003_honest_terminal_ledger_snapshots.sql
-- Description: Tamper-Evident Trade Ledger & Immutable Daily Snapshots
-- Rules:
--   1. ledger_hash added to paper trade records for SHA-256 cryptographic chaining
--   2. ledger_snapshots is strictly IMMUTABLE (append-only, updates/deletions blocked)
--   3. Public read-only RLS policy for cryptographic audit transparency
-- ==============================================================================

-- 1. Add ledger_hash column to paper_transactions and paper_orders if not present
ALTER TABLE IF EXISTS public.paper_transactions 
ADD COLUMN IF NOT EXISTS ledger_hash VARCHAR(64);

ALTER TABLE IF EXISTS public.paper_orders 
ADD COLUMN IF NOT EXISTS ledger_hash VARCHAR(64);

-- 2. Create paper_trades table for dedicated closed trade records with hash chaining
CREATE TABLE IF NOT EXISTS public.paper_trades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    side VARCHAR(10) NOT NULL CHECK (side IN ('long', 'short')),
    entry_price_units BIGINT NOT NULL CHECK (entry_price_units > 0),
    exit_price_units BIGINT NOT NULL CHECK (exit_price_units > 0),
    quantity_units BIGINT NOT NULL CHECK (quantity_units > 0),
    realized_pnl_units BIGINT NOT NULL,
    fee_units BIGINT NOT NULL DEFAULT 0,
    prev_hash VARCHAR(64) NOT NULL,
    ledger_hash VARCHAR(64) NOT NULL,
    opened_at TIMESTAMPTZ NOT NULL,
    closed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_paper_trades_hash UNIQUE (ledger_hash)
);

-- 3. Create immutable ledger_snapshots table
CREATE TABLE IF NOT EXISTS public.ledger_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL UNIQUE,
    root_hash VARCHAR(64) NOT NULL UNIQUE,
    prev_root_hash VARCHAR(64) NOT NULL,
    user_count INTEGER NOT NULL DEFAULT 0 CHECK (user_count >= 0),
    trade_count INTEGER NOT NULL DEFAULT 0 CHECK (trade_count >= 0),
    total_volume_usdt NUMERIC(18, 4) NOT NULL DEFAULT 0,
    verified BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Trigger preventing UPDATE or DELETE on ledger_snapshots (Structural Immutability)
CREATE OR REPLACE FUNCTION public.fn_prevent_snapshot_tampering()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'ledger_snapshots is an immutable table. Updates and deletions are strictly prohibited by protocol.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_snapshot_tampering ON public.ledger_snapshots;
CREATE TRIGGER trg_prevent_snapshot_tampering
    BEFORE UPDATE OR DELETE ON public.ledger_snapshots
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_prevent_snapshot_tampering();

-- 5. Indexes for fast ledger verification
CREATE INDEX IF NOT EXISTS idx_paper_trades_user_closed ON public.paper_trades(user_id, closed_at DESC);
CREATE INDEX IF NOT EXISTS idx_paper_trades_hash ON public.paper_trades(ledger_hash);
CREATE INDEX IF NOT EXISTS idx_ledger_snapshots_date ON public.ledger_snapshots(date DESC);

-- 6. Row Level Security (RLS)
ALTER TABLE public.paper_trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ledger_snapshots ENABLE ROW LEVEL SECURITY;

-- Users can only read their own trade records
CREATE POLICY "Users can read own paper trades"
    ON public.paper_trades
    FOR SELECT
    USING (auth.uid() = user_id);

-- System service can insert trades
CREATE POLICY "System can insert paper trades"
    ON public.paper_trades
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Anyone can read ledger snapshots for public transparency
CREATE POLICY "Public read for ledger snapshots"
    ON public.ledger_snapshots
    FOR SELECT
    USING (true);
