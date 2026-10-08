-- ==============================================================================
-- Migration: 20261006000000_paper_trading_schema.sql
-- Description: Paper Trading Foundation (Accounts, Positions, Orders, Ledger)
-- Rules:
--   1. All monetary quantities stored as BIGINT in 8-decimal base units (10^8)
--   2. Default paper account initial balance = 10,000 USDT (1,000,000,000,000 units)
--   3. paper_transactions is strictly APPEND-ONLY (immutable ledger)
--   4. RLS enabled on all tables - user's own rows only
-- ==============================================================================

-- 1. Create paper_accounts
CREATE TABLE IF NOT EXISTS public.paper_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'USDT',
    balance_units BIGINT NOT NULL DEFAULT 1000000000000,       -- 10,000 USDT (8 decimals)
    initial_balance_units BIGINT NOT NULL DEFAULT 1000000000000,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_user_currency UNIQUE (user_id, currency)
);

-- 2. Create paper_positions
CREATE TABLE IF NOT EXISTS public.paper_positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    account_id UUID NOT NULL REFERENCES public.paper_accounts(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL,
    side VARCHAR(10) NOT NULL CHECK (side IN ('long', 'short')),
    quantity_units BIGINT NOT NULL CHECK (quantity_units > 0),
    entry_price_units BIGINT NOT NULL CHECK (entry_price_units > 0),
    margin_units BIGINT NOT NULL CHECK (margin_units >= 0),
    realized_pnl_units BIGINT NOT NULL DEFAULT 0,
    take_profit_units BIGINT,
    stop_loss_units BIGINT,
    opened_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_user_symbol UNIQUE (user_id, symbol)
);

-- 3. Create paper_orders
CREATE TABLE IF NOT EXISTS public.paper_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    account_id UUID NOT NULL REFERENCES public.paper_accounts(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL,
    side VARCHAR(10) NOT NULL CHECK (side IN ('buy', 'sell')),
    type VARCHAR(10) NOT NULL CHECK (type IN ('market', 'limit')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('open', 'filled', 'cancelled', 'rejected')),
    price_units BIGINT NOT NULL CHECK (price_units > 0),
    amount_units BIGINT NOT NULL CHECK (amount_units > 0),
    filled_amount_units BIGINT NOT NULL DEFAULT 0,
    total_cost_units BIGINT NOT NULL DEFAULT 0,
    fee_units BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    filled_at TIMESTAMPTZ
);

-- 4. Create paper_transactions (Append-Only Ledger)
CREATE TABLE IF NOT EXISTS public.paper_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    account_id UUID NOT NULL REFERENCES public.paper_accounts(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.paper_orders(id) ON DELETE SET NULL,
    type VARCHAR(30) NOT NULL CHECK (type IN ('initial_funding', 'order_fill', 'fee', 'realized_pnl', 'reset', 'margin_lock', 'margin_release')),
    amount_units BIGINT NOT NULL,                              -- Signed delta
    balance_after_units BIGINT NOT NULL,                       -- Resulting balance
    symbol VARCHAR(20),
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Enforce Append-Only on paper_transactions via Trigger
CREATE OR REPLACE FUNCTION public.fn_prevent_ledger_tampering()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'paper_transactions is an immutable append-only ledger. Updates and deletions are forbidden.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_ledger_update ON public.paper_transactions;
CREATE TRIGGER trg_prevent_ledger_update
    BEFORE UPDATE OR DELETE ON public.paper_transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_prevent_ledger_tampering();

-- 6. Indexes for High-Frequency Queries
CREATE INDEX IF NOT EXISTS idx_paper_accounts_user ON public.paper_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_paper_positions_user_symbol ON public.paper_positions(user_id, symbol);
CREATE INDEX IF NOT EXISTS idx_paper_orders_user_status ON public.paper_orders(user_id, status);
CREATE INDEX IF NOT EXISTS idx_paper_transactions_user ON public.paper_transactions(user_id, created_at DESC);

-- 7. Enable Row Level Security (RLS)
ALTER TABLE public.paper_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paper_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paper_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paper_transactions ENABLE ROW LEVEL SECURITY;

-- 8. RLS Policies (User Own Rows Only)
-- paper_accounts policies
CREATE POLICY "Users can view own paper accounts"
    ON public.paper_accounts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own paper accounts"
    ON public.paper_accounts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own paper accounts"
    ON public.paper_accounts FOR UPDATE
    USING (auth.uid() = user_id);

-- paper_positions policies
CREATE POLICY "Users can view own paper positions"
    ON public.paper_positions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own paper positions"
    ON public.paper_positions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own paper positions"
    ON public.paper_positions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own paper positions"
    ON public.paper_positions FOR DELETE
    USING (auth.uid() = user_id);

-- paper_orders policies
CREATE POLICY "Users can view own paper orders"
    ON public.paper_orders FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own paper orders"
    ON public.paper_orders FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own paper orders"
    ON public.paper_orders FOR UPDATE
    USING (auth.uid() = user_id);

-- paper_transactions policies (SELECT and INSERT only)
CREATE POLICY "Users can view own transactions"
    ON public.paper_transactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
    ON public.paper_transactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);
