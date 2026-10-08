# Celsius Network — Agent Guidelines & Invariant Rules

## ⚠️ Core Financial & Paper Trading Invariants

The following rules are mandatory across all paper-trading and financial logic in the Celsius Network application:

1. **Server-Side Computation Only**
   - All paper-trading balances, orders, positions, fees, and realized P&L must be computed strictly in server-side API routes (e.g. `/api/trade/*`).
   - The client never executes, decides, or alters financial math directly; client is a presentation layer only.

2. **Integer Math (Cents/Wei-Style) — Never Floats**
   - Money and quantities must be stored and computed as integer base units (wei/satoshi style), never JavaScript floating-point numbers.
   - Standard scale: 8 decimals (`SCALE = 100_000_000n` / $10^8$ base units):
     - `1.0 USDT` = `100,000,000` base units (`units`).
     - Default account balance: `10,000 USDT` = `1,000,000,000,000` base units (`10_000 * 10^8`).
     - Crypto quantity: stored in 8-decimal base units (`1 BTC` = `100,000,000` base units).
     - Execution price: converted to 8-decimal integer units during server execution (`price * 10^8`).
   - Multiplication and division:
     - Cost in USDT units = `(quantity_units * price_units) / 100_000_000n`.
     - Fee in USDT units = `(cost_units * 10n) / 10_000n` (0.10% flat fee, integer arithmetic).
   - Floats are prohibited in database storage and server calculation. Floating points are only produced at display / render time via formatting utilities (`formatUnits` / `formatPrice`).

3. **Append-Only Immutable Ledger (`paper_transactions`)**
   - Every order execution, fill, fee deduction, P&L credit/debit, and account reset MUST append an immutable record into the `paper_transactions` table.
   - The `paper_transactions` table is append-only: `UPDATE` and `DELETE` queries are strictly forbidden.
   - Current balance must always reconcile with the cumulative sum of transactions from initial funding.

4. **Server-Fetched Live Market Prices**
   - The client NEVER sends prices for market orders.
   - The server independently fetches the live, authoritative price from Binance (`/api/v3/ticker/price` or `/api/v3/ticker/24hr`) at the exact instant of execution.

5. **Row Level Security (RLS) & Isolation**
   - Every paper trading table (`paper_accounts`, `paper_positions`, `paper_orders`, `paper_transactions`) must enforce Supabase RLS.
   - Users can only read and write their own data. Cross-user access is impossible.

6. **Deterministic Account Lifecycle**
   - When a logged-in user first opens the trading interface, an account with `10,000.00000000` USDT (`1,000,000,000,000` base units) is atomically initialized if not already existing.
   - Accounts can be safely reset via a dedicated endpoint logging a `reset` ledger transaction.

---

## 🔒 Phase 5 — Admin Console & Privileged Access Invariants

Admin access provides privileged capabilities over users, feature flags, announcements, and funds. The following rules are strictly enforced:

1. **Server-Side Protection via Middleware — Never Client-Side Only**
   - All `/admin` pages and sub-routes are protected by role check in **SERVER-side middleware** (`src/middleware.ts`).
   - Non-admin users attempting to navigate to `/admin/*` are immediately redirected to `/` with an authorization notice.
   - Never trust a client-side role check alone.

2. **Database Profiles Role Column**
   - The `profiles` table includes a `role` column defaulting to `'user'`.
   - The `'admin'` role must be granted manually via SQL or privileged admin action:
     ```sql
     UPDATE profiles SET role = 'admin' WHERE id = 'YOUR-USER-ID';
     ```

3. **Server-Side Role Verification on Every Admin API Request**
   - All admin API routes (`/api/admin/*`) must independently verify the caller's role on the server before processing any payload.
   - Requests from non-admin users or unauthenticated callers must strictly return HTTP `403 Forbidden`.

4. **Immutable Admin Audit Logging (`admin_audit_log`)**
   - Every admin action (e.g., freezing a user, unfreezing, granting/revoking roles, modifying feature flags, broadcasting messages, creating announcements) MUST write an immutable record into the `admin_audit_log` table:
     - `admin_id`, `admin_email`, `action`, `target`, `details` (JSON), `created_at`.
   - The audit log is read-only for admins and completely inaccessible to normal users.

5. **Trading Block for Frozen Users**
   - Frozen/suspended users (`status = 'frozen'` or `'suspended'`) are strictly blocked from submitting any orders or closing positions in `/api/trade/*`.
   - Server-side validation must check account status before accepting trade actions.

---

## 📈 Phase 7 — Retention, Virality & Growth Invariants

1. **Leaderboard Fairness & Server-Side Aggregation**
   - Public leaderboard (`/leaderboard` and `/api/leaderboard`) rankings are computed strictly server-side.
   - Ranking is based on realized P&L % (percentage, not absolute USDT) so capital size does not bias rankings.
   - Frozen/suspended accounts (`isFrozen = true` or `status = 'suspended'`) are strictly excluded.
   - Return top 50 traders with logged-in user's rank pinned at the bottom if outside top 50.

2. **Public Shareable Trade Cards & OpenGraph**
   - Shareable trade cards are dynamically rendered as 1200x630 PNG images via Next.js `ImageResponse` (`/api/og/trade/[tradeId]` and `/api/og/stats/[userId]`).
   - Public preview pages (`/share/[tradeId]`) do not require authentication for external viewers (Discord/Twitter crawlers), but order/position creation is restricted to the authenticated trader.

3. **Advanced Order Execution Engine (Limit, SL/TP)**
   - Limit orders and Position Take-Profit (TP) / Stop-Loss (SL) brackets are evaluated server-side against live Binance prices.
   - All executions maintain the integer math invariant ($10^8$ base units), flat 0.1% fee deduction, and immutable append-only ledger entries in `paper_transactions`.
   - Frozen users cannot submit limit orders or trigger brackets.

4. **Privacy-Friendly Analytics & Feedback Loop**
   - In-app feedback submissions are securely stored in the database and visible only to verified administrators in `/admin`.
   - Client and server analytics respect user privacy with zero third-party cookie tracking.

---

## ⚖️ "The Honest Terminal" Invariants & Truth Rules

Positioning: *"The only trading platform that profits from you not losing money."*

1. **Context Invariant**: Never show a result without its full context (maximum drawdown, sample size of trades, and buy-and-hold benchmark comparison over the identical time window).
2. **Data-Bound Marketing**: Never let marketing or copy outrun the data. Every claim, percentage, and metric displayed across the application must be computed dynamically from the database / server ledger — never hardcoded or hand-written.
3. **Equal Billing for Losses**: Losses get equal billing to wins, everywhere (trade cards, journal, public profiles, and landing showcase). Sharing a loss is treated with dignity as a badge of transparency and discipline.
4. **Tamper-Evident Ledger Integrity**: Trade records are hash-chained (`ledger_hash`). Daily root hashes are sealed cryptographically and published publicly on `/transparency`.
5. **No Hope Peddling**: If a feature would make a retail casino broker or trading influencer money by inducing reckless turnover, it is strictly forbidden. If a feature gets us banned from a signal-seller's Discord for fact-checking their calls with verifiable market data, it is on-brand.

---

## 📌 The Permanent Rules (Verbatim)

- No result shown without context: drawdown, sample size, buy-and-hold.
- Every public number is computed from the database — never hand-written.
- Losses get equal billing to wins, everywhere.
- Aggregate-only data, 25-user minimum cohort, no per-user export — structural, not promissory.
- No ads, no affiliate links, no signals, no "premium predictions" — ever, at any revenue level.
- Performance budget is permanent: sub-1s pages, <150KB JS. Any feature that breaks it must justify itself or be cut. This is a core selling point, not an optimization.
- If a feature would make a signal-seller money, it's off-brand. If it would get us banned from a signal Discord, it's on-brand.
- For repository topology, module dependencies, and symbol references, check `graft/index.md` before sweeping files.

---

## 📊 Phase 2 — The Reality Page Invariants

1. **Computed at Render Time — Never Hand-Written**:
   - Every number on /reality must be computed from the database at render time — no hand-written stats, ever.
2. **Brutally Plain, Non-Preachy Copy**:
   - On the user's side against the industry — never preachy. Tone: *"Everyone shows you their wins. We show you everything."*
3. **Public & Server-Rendered**:
   - No login required. 100% server-rendered for sub-second delivery and open shareability via OpenGraph meta tags.

---

## 🎯 Phase 3 — Truth in Every Screen Invariants

1. **Buy-and-Hold Benchmark Everywhere**:
   - Wherever P&L or strategy performance is shown (Dashboard, Trade History, Positions Dock, Profile Modal, Performance Summary), display:
     *"Same capital in BTC buy-and-hold over the same period: +X%. You: +Y%."*
   - Computed server-side from real Binance historical data (via `benchmarkService.ts`).
   - Invariant: Never hide or de-emphasize when BTC buy-and-hold beats the active trader.
   - Context invariant: *"No result is ever shown without context: drawdown, sample size, and buy-and-hold comparison."*

2. **Honest Onboarding Flow**:
   - Post-signup flow shows reality check statistics from `/reality` (*"78.2% of paper traders lost money last month"*).
   - 3-step setup in <60 seconds: instrument selection, risk-per-trade cap (default 1%), and $10,000 USDT provisioning.
   - User feels protected, disciplined, and sober — not casino-excited.

3. **Loss-Protection Features**:
   - Hard daily loss limit on paper accounts (default: 5% max daily drawdown). When hit, trading locks with a calm *"You're done for today"* screen.
   - Invariant: User can NEVER increase or remove this limit while on a losing day.
   - Revenge-trade detector: When 3+ rapid trades are detected within 15 minutes of a loss, display calm warning and prompt a 5-minute break.
   - Post-session review card: Summarizes session trades, fees paid (*"what the casino made"*), and comparison with doing nothing.
   - Feature gated behind admin flag `loss_limits` in `adminService.ts`.

---

## 📊 Phase 4 — The Sentiment Index Invariants

1. **Structural Privacy Barrier (Non-Promissory)**:
   - Aggregate-only data: Minimum cohort size of 25 active traders before any statistic or ratio is calculated or displayed.
   - Zero user IDs ever leave the aggregation boundary; no per-user sentiment tracking or export can exist.
   - RLS strictly blocks any queries where cohort count < 25.

2. **Public Contrarian Grounding**:
   - Free `/sentiment` page shows per-asset positioning overlaid against actual price with the crowd accuracy metric.
   - Copy tone: *"See what the herd is doing. Then consider not being the herd."*
   - Free public data is delayed by 24 hours; real-time feed lives inside the terminal.

3. **Lean In-Terminal Strip**:
   - Inside the terminal, next to each chart, display a single-line context strip:
     *"Retail paper traders here: X% long · crowd has been wrong Y of last Z significant moves on this asset."*
   - Performance budget is respected: single compact line, 0 layout shift.

---

## 🛡️ Phase 5 — Verified Public Records (The Trust Moat) Invariants

1. **All-or-Nothing Track Record Invariant**:
   - User toggle: *"Make my track record public"*.
   - When public, the view (`/u/[username]`) displays the **COMPLETE** trade history — every win and loss, server-computed.
   - Selective display or hiding losing months/trades is strictly forbidden. A public profile is a resume, not a highlight reel.

2. **Ledger Snapshot Hash Stamped**:
   - Every public track record is stamped with the latest daily cryptographic ledger root hash (`ledger_snapshots.root_hash`).
   - Proves records cannot be edited retroactively.

3. **Verified Record Badge & /transparency Integration**:
   - Public profile features the **"Verified Record"** badge with a direct link to `/transparency` explaining why screenshots can be faked but Celsius cryptographic records cannot.

4. **Equal Billing for Losses & Full Context**:
   - Every public record displays maximum drawdown, total sample size of trades, and BTC Buy-and-Hold comparison over the identical time window.
   - Losses receive identical prominence and typography as wins.

---

## ⚖️ Phase 6 — The Scoreboard (The Controversy Engine) Invariants

1. **Authoritative Real-Price Scoring**:
   - Every public call must be scored strictly against authoritative Binance Spot prices at the exact minute of expiration.
   - Result states are strictly: `correct`, `wrong`, or `undefined` (if insufficient liquidity/data).
   - Price movement percentage must be calculated from call entry price to expiry price.

2. **Neutral, Factual, Undeniable Tone**:
   - Tone invariant: *"Tone: neutral, factual, undeniable. Never mock — let the numbers do the talking."*
   - No editorializing, insults, or ad hominem attacks on public figures. State the call, the stated timeframe, the price at expiry, and the objective math.

3. **Database-Computed Aggregates — Zero Hardcoding**:
   - Every leaderboard percentage and summary fact (e.g. *"82% of YouTube calls this month were wrong"*) must be computed dynamically from the database.

---

## 🔄 Phase 7 — The Backtester (The Retention Engine) Invariants

1. **Mandatory Buy-and-Hold Benchmark — Permanently Visible & Non-Collapsible**:
   - Every backtest result must prominently display the exact buy-and-hold return of the asset over the identical timeframe.
   - Invariant: Never collapsible, never hidden, never de-emphasized when doing nothing beats active trading.

2. **Realistic 0.10% Transaction Fee Drag**:
   - Minimum 0.10% spot execution fee deducted from gross notional capital on EVERY simulated order entry and exit.
   - Total fees paid must be tracked and surfaced as *"What the exchange made from your turnover"*.

3. **Data-Bound Honest Summary Verdict**:
   - Every backtest report ends with an unvarnished, data-bound summary line:
     `"This strategy underperformed holding BTC in X% of tested periods."`
   - Marketing or curve-fitted optimism must never outrun the real underlying market math.

4. **Server-Side Execution & Performance Budget**:
   - Backtest simulations run server-side against authoritative Binance Spot klines.
   - Page load remains sub-1s with system fonts and <150KB JS bundle.

5. **One-Click Paper Trading Forward Execution**:
   - Backtested strategies can be deployed forward into paper trading to test live viability under an enforced risk-per-trade cap (default 1.0%).

---

## 🏆 Phase 8 — Community without Casino Vibes Invariants

1. **Strictly Zero Entry Fees (`entry_fee = 0`)**:
   - Tournaments are free, always. Zero entry fees, zero pay-to-play barriers, zero deposit requirements.
   - Hard-enforced in PostgreSQL schema via `CHECK (entry_fee = 0)` constraint and validated in server routes.

2. **Risk-Adjusted Ranking Metric — Never Raw P&L**:
   - Tournament leaderboard rankings are computed server-side strictly by Risk-Adjusted Return:
     $$\text{Score} = \frac{\text{Net Return \%}}{\text{Max Drawdown \%} + 1.0} \times \text{Sample Weight}$$
   - Invariant: A disciplined trader with +15% return and 2% drawdown (Score = 5.0) ranks well above a gambler with +35% return and 40% drawdown (Score = 0.85).

3. **Per-Trade Risk Cap Enforced Carryover**:
   - The platform's 1.0% per-trade risk cap carries over into all tournament execution.
   - Traders cannot bypass risk caps by entering competitions.

4. **Permanent & Cryptographically Sealed Records**:
   - All tournament results and executions are append-only and stamped with the daily ledger hash (`ledger_snapshots.root_hash`).
   - Results cannot be altered retroactively.

5. **Statistical Anomaly Detection (Improbable Win Rates)**:
   - Server-side anomaly detector automatically flags any trader exhibiting statistically improbable win rates:
     - $\ge 8$ trades with $\ge 95\%$ win rate
     - $\ge 5$ trades with $100\%$ win rate
   - Flagged participants are visibly marked as `FLAGGED FOR REVIEW` on the public leaderboard.

6. **Equal Dignity for Losses & Share Cards**:
   - Losses receive identical typographic prominence and dignity as wins across all share cards:
     `"Took a -X.XX% loss. Full record verified."` with the badge `"BADGE OF HONESTY • DISCIPLINED LOSS"`.
   - All share cards carry the immutable platform mark: `"Full record, verified."`.

---

## 💰 Phase 9 — Transparent Funding & The Sentiment API Invariants

1. **Radical Financial Transparency (`/funding`)**:
   - Every public cost, monthly operating expense, and community contribution figure must be computed directly from the financial ledger (`funding_ledger`) — never fabricated or hand-written.
   - Operating costs are itemized with full provider transparency (Edge compute, DB, market feeds, DNS/SSL).
   - Monthly runway is computed mathematically:
     $$\text{Runway (Months)} = \frac{\text{Current Reserve Cents} + \text{Monthly Donations Cents}}{\text{Monthly Operating Cost Cents}}$$

2. **Permanent Absolute Zero Ads & Affiliates Invariant**:
   - Invariant: Zero ads, zero exchange affiliate kickbacks, zero sponsored signals or pay-to-play token listings — EVER, at any revenue level.
   - Tone & positioning: *"We show you our money so you know who we work for: you."*

3. **Sentiment API Free Tier Delay & Attribution Invariant**:
   - The public/developer API (`/api/v1/sentiment`) free tier provides 24-hour delayed aggregate sentiment data.
   - Mandatory attribution string must be included on public surfaces:
     `"Data provided by Celsius Network (celsius.network). Free tier with 24-hour delay."`
   - Free tier is rate-limited to 60 req/min and 1,000 req/mo.

4. **Sentiment API Paid Pro Tier ($49/mo)**:
   - Pro tier provides real-time sub-100ms streaming feeds, full historical time series, and liquidity flow indicators with higher rate limits (1,000 req/min, 100,000 req/mo).
   - Commercial rights included with zero attribution requirement.

5. **Structural Privacy Barrier (Phase 4 carryover)**:
   - All sentiment data returned via the API remains strictly aggregate-only. Minimum active cohort size of 25 traders. Zero user IDs or wallet allocations ever leave the aggregation boundary.

---

## 🚀 Phase 10 — Launch the Story Invariants

1. **Brand Positioning & Hero Invariant**:
   - Hero: *"The only trading platform that profits from you not losing money."*
   - Subtitle: *"Free forever. Faster than everything. We show you what the herd is doing — and what happens to herds."*
   - Invariant: Positioning must never sell hope or promise riches. Day-one promise is protection, discipline, and verifiable market truth.

2. **Plain-Language Public Legal & Mission Surfaces**:
   - `/about`: The founding manifesto explaining why casino brokers profit from retail liquidation and why Celsius operates on $150/mo funded by trust.
   - `/terms`: Written in plain, human English with explicit Right of Reply guarantees for scored public figures and structural privacy barriers.
   - `/changelog`: Complete, transparent 10-phase engineering evolution with timestamps and architectural rationales.

3. **Calm, Professional Terminal Aesthetic**:
   - Zero casino vibes: no flashing gamification popups, no FOMO banners, no affiliate referral prompts.
   - Sub-1s page delivery, <150KB JS bundle budget strictly preserved across all production routes.







