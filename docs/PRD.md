# Product Requirement Document (PRD) — Celsius Network Trading Terminal

## 1. Product Overview
Celsius Network is a web-based crypto trading and charting terminal built for retail and pro traders. It combines real-time market data streaming from Binance, TradingView-style candlestick and technical indicator visualization, real-time price alerts, and an institutional-grade **Paper Trading Engine**.

## 2. Technical Stack
- **Framework:** Next.js 14 App Router, React 18, TypeScript
- **Styling:** Tailwind CSS + CSS variables for high-contrast dark theme
- **Charting:** TradingView Lightweight Charts v5
- **Market Data:** Binance WebSocket (`wss://stream.binance.com:9443/ws/`) and REST APIs with server-side proxy fallbacks
- **Backend & Database:** Supabase PostgreSQL with Row Level Security (RLS)
- **State Management:** Zustand (Stores for Chart, Watchlist, Trading)

## 3. Phase 4 — Paper Trading System Specification

### 3.1 Core Principles
- **Server-Side Financial Integrity:** All calculations (balances, positions, orders, fee deductions, realized P&L) occur in server-side API routes.
- **Integer Base-Unit Storage:** Zero floating-point representation in financial records. All currency and asset quantities are scaled by $10^8$ (`1 USDT = 100,000,000 units`, `1 BTC = 100,000,000 satoshis`).
- **Append-Only Ledger:** Every balance delta is recorded in an immutable `paper_transactions` table.
- **Authoritative Price Feed:** Market orders fetch execution price live from Binance on the server.
- **Strict Tenant Isolation:** Enforced via PostgreSQL Row Level Security (RLS).

### 3.2 Database Schema
1. **`paper_accounts`**
   - `id`: UUID (Primary Key)
   - `user_id`: UUID or string (Owner identity)
   - `currency`: 'USDT'
   - `balance_units`: BIGINT (Current available balance in $10^8$ base units, defaults to `1_000_000_000_000` = 10,000 USDT)
   - `initial_balance_units`: BIGINT (`1_000_000_000_000` = 10,000 USDT)
   - `created_at`: TIMESTAMPTZ
   - `updated_at`: TIMESTAMPTZ

2. **`paper_positions`**
   - `id`: UUID (Primary Key)
   - `user_id`: UUID or string
   - `account_id`: UUID (Foreign Key to `paper_accounts`)
   - `symbol`: string (e.g., 'BTCUSDT')
   - `side`: 'long' | 'short'
   - `quantity_units`: BIGINT (Size in $10^8$ units)
   - `entry_price_units`: BIGINT (Average entry price in $10^8$ units)
   - `margin_units`: BIGINT (USDT allocated in $10^8$ units)
   - `realized_pnl_units`: BIGINT (Cumulative realized P&L)
   - `opened_at`: TIMESTAMPTZ
   - `updated_at`: TIMESTAMPTZ

3. **`paper_orders`**
   - `id`: UUID (Primary Key)
   - `user_id`: UUID or string
   - `account_id`: UUID
   - `symbol`: string
   - `side`: 'buy' | 'sell'
   - `type`: 'market' | 'limit'
   - `status`: 'open' | 'filled' | 'cancelled' | 'rejected'
   - `price_units`: BIGINT (Executed or target price in $10^8$ units)
   - `amount_units`: BIGINT (Order quantity in $10^8$ units)
   - `filled_amount_units`: BIGINT
   - `total_cost_units`: BIGINT (Quote cost in $10^8$ units)
   - `fee_units`: BIGINT (0.1% flat fee in $10^8$ units)
   - `created_at`: TIMESTAMPTZ
   - `filled_at`: TIMESTAMPTZ

4. **`paper_transactions`** (Append-Only Ledger)
   - `id`: UUID (Primary Key)
   - `user_id`: UUID or string
   - `account_id`: UUID
   - `order_id`: UUID (Nullable)
   - `type`: 'initial_funding' | 'order_fill' | 'fee' | 'realized_pnl' | 'reset'
   - `amount_units`: BIGINT (Delta to account balance, positive or negative)
   - `balance_after_units`: BIGINT (Resulting balance in $10^8$ units)
   - `symbol`: string (Nullable)
   - `details`: JSONB
   - `created_at`: TIMESTAMPTZ

### 3.3 User Experience & UI Structure
- **Trading Dock (Desktop):** A bottom dock panel below the chart inspired by TradingView, with tabs for Positions, Open Orders, Trade History, and Ledger.
- **Mobile Experience:** Seamless tab bar in the bottom navigation for instant switching between Chart, Order Panel, and Trading Dock.
- **Account Auto-Provisioning:** When a user opens the Trading view, the server automatically checks if a paper account exists; if not, an account with 10,000 USDT is provisioned.

---

## 4. Phase 5 — Admin Console & Governance Specification

### 4.1 Security & Access Architecture
- **Server-Side Middleware Gate:** All requests to `/admin` and subpaths are validated by server-side Edge Middleware checking `role = 'admin'`. Non-admins are immediately redirected to `/`.
- **API Guard:** Admin APIs (`/api/admin/*`) require server-side role verification, returning `403 Forbidden` for non-admins.
- **User Roles in `profiles`:** Role column with default `'user'`. Privileged `'admin'` access configured securely.
- **Audit Logging (`admin_audit_log`):** All administrative operations (freeze/unfreeze, role updates, feature flags, announcements, broadcasts) are immutably logged with timestamp, actor, target, and payload.

### 4.2 Admin Shell & Design
- **Distinctive Visual Theme:** Retains terminal dark theme with subtle red-tinted accent (`var(--bear)` / crimson highlights) and glowing **ADMIN** badge in the header.
- **Sidebar Navigation:**
  - **Dashboard:** Platform metrics (total users, daily active users, paper accounts, circulation volume, open positions, 30-day signup trend).
  - **Users:** Searchable/paginated user directory with detail drawer and actions (freeze/unfreeze trading, grant/revoke admin).
  - **Withdrawals:** Reserved section (status: coming soon).
  - **Announcements:** Broadcast system with banner alerts (info, warning, critical).
  - **Feature Flags:** Instant platform switches (`paper_trading`, `indicators`, `alerts`).
  - **Audit Log:** Chronological immutable record of admin actions.

---

## 5. Phase 7 — Retention, Virality & Growth Specification

### 5.1 Public Paper Trading Leaderboard (`/leaderboard`)
- **Metric:** Ranked by total realized P&L % (percentage-based to guarantee fairness between accounts of differing capital).
- **Display Attributes:** Rank, Trader Display Name, Realized P&L %, Win Rate %, Total Closed Trades.
- **Server Calculation (`/api/leaderboard`):** Aggregates performance server-side over paper accounts. Excludes frozen or suspended users.
- **User Pinning:** Top 50 traders listed; logged-in user pinned at the bottom with their exact rank if outside top 50.
- **Timeframes:** 24h, 7d, 30d, All-Time filters with 15-minute background cache revalidation.

### 5.2 Dynamic Shareable Trade Cards (`/share/[tradeId]` & `/api/og/*`)
- **1200x630 OG Card Generation:** Next.js `ImageResponse` server rendering displaying:
  - App Logo & "Celsius Network" branding
  - Trader Display Name
  - Asset pair (e.g. BTC/USDT)
  - Entry & Exit prices
  - Realized P&L in USDT and percentage
  - Trade duration & timestamp
- **Public Share Page:** Optimized with OpenGraph & Twitter Cards tags for link unfurling on Discord, Twitter/X, and Telegram.
- **Trader Actions:** "Copy Link", "Share on X", and "Download Card" triggers from trade history or position close.

### 5.3 Retention Hooks: Streaks & Weekly Recaps
- **Visit Streaks:** Daily visit streak tracker stored server-side and displayed as a flame badge (`🔥 Xd`) in the header.
- **Weekly Performance Recap:** Delivered every Monday on login summarizing total trades, win rate %, and net P&L.

### 5.4 Advanced Orders & Bracket Triggers
- **Limit Orders:** Server-side order book queue for limit orders.
- **Stop-Loss / Take-Profit Brackets:** Position-level target prices evaluated server-side against live Binance prices.
- **Execution Cron (`/api/cron/orders`):** Periodic price crossing engine filling orders with live execution prices.

### 5.5 In-App Feedback & Analytics Loop
- **In-App Feedback Modal:** Accessible from user menu saving bug reports and feature requests to `user_feedback`.
- **Admin Moderation:** Feedback inbox viewable in the Admin Console with status resolution tools.
- **Privacy-Friendly Analytics:** Event pipeline for tracking key platform interactions without intrusive cookies.
