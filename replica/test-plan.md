# Test plan: Celsius Network — "The Honest Terminal"

Build: current-local  Date: 2026-10-07  Env: local dev/prod, seed data, Binance live API

| case | flow | type | steps | expected | auto | result |
| --- | --- | --- | --- | --- | --- | --- |
| F01-H1 | F01 Order Execution | happy | Open `/`, submit market BUY for 0.05 BTC | Server executes against live Binance Spot, logs 0.10% fee in `paper_transactions`, updates balance & position | auto | PASS |
| F01-E1 | F01 Order Execution | edge: rapid double click | Double click "Buy / Long" button in under 100ms | Idempotency or client disable prevents double order execution | auto | PASS |
| F01-E2 | F01 Order Execution | edge: fractional satoshi precision | Enter high decimal quantity (e.g. 0.00000001 BTC) | Stored and calculated as integer base units without floating point corruption | auto | PASS |
| F01-N1 | F01 Order Execution | negative: insufficient balance | Enter order size exceeding available USDT balance ($15,000 > $10,000) | Order rejected with `INSUFFICIENT_FUNDS` error, no balance mutation | auto | PASS |
| F01-N2 | F01 Order Execution | negative: frozen account | Submit trade from frozen account (`is_frozen = true`) | Order rejected with HTTP 403 / account frozen notice | auto | PASS |
| F02-H1 | F02 Daily Loss Lock | happy | Accumulate >5% daily drawdown on paper account | Trading locks immediately; calm circuit breaker banner appears: "You're done for today" | auto | PASS |
| F02-E1 | F02 Daily Loss Lock | edge: refresh while locked | Refresh browser after daily loss limit triggered | Daily lock persists server-side; order execution remains blocked | auto | PASS |
| F02-N1 | F02 Daily Loss Lock | negative: raise cap on losing day | Attempt to increase daily loss cap while account is locked for the day | Invariant enforced: rejected with `CANNOT_INCREASE_CAP_ON_LOSING_DAY` | auto | PASS |
| F02-H2 | F02 Revenge Trade Detection | happy | Trigger 3 rapid order actions within 15 minutes of a loss | Calm prompt detects revenge pattern and initiates 5-minute cooling break | auto | PASS |
| F03-H1 | F03 Ledger Snapshotting | happy | Execute `/api/cron/ledger-snapshot` at daily rollover | Computes SHA-256 root hash chaining previous day's root hash and stores in `ledger_snapshots` | auto | PASS |
| F03-E1 | F03 Ledger Snapshotting | edge: zero trades day | Execute snapshot when no trades occurred in 24h window | Snapshot successfully seals empty batch with unchanged chain continuity | auto | PASS |
| F03-N1 | F03 Ledger Snapshotting | negative: mutate snapshot | Attempt `UPDATE` or `DELETE` on `ledger_snapshots` | Database trigger or RLS rejects update with immutability error | auto | PASS |
| F04-H1 | F04 Reality Check | happy | Navigate to `/reality` | Page renders dynamically computed profitability %, median P&L, hold times in <1s | auto | PASS |
| F04-E1 | F04 Reality Check | edge: 30d vs 90d switcher | Click between 30-day and 90-day timeframes | Renders distinct statistical curves and metrics computed from database | auto | PASS |
| F04-H2 | F04 Reality Check OG Card | happy | Request `/api/og/reality` with headline parameters | Dynamic 1200x630 PNG generated with truthful, unvarnished retail loss stats | auto | PASS |
| F05-H1 | F05 Sentiment Index | happy | Navigate to `/sentiment` | Public page displays 24h-delayed retail % long vs actual price overlaid on chart | auto | PASS |
| F05-E1 | F05 Sentiment Index | edge: cohort < 25 traders | Query asset with fewer than 25 active retail traders | Structural privacy barrier suppresses stat until 25-user threshold is reached | auto | PASS |
| F05-H2 | F05 Terminal Strip | happy | Open chart on `/` | Compact one-line strip displays retail sentiment and crowd historical error rate | auto | PASS |
| F06-H1 | F06 Verified Records | happy | Open Profile Modal, toggle "Make my track record public" | Profile becomes accessible at `/u/[username]` with "Verified Record" badge | auto | PASS |
| F06-E1 | F06 Verified Records | edge: losing trades included | Inspect public track record for user with losses | Invariant: All losing trades receive equal billing and identical typography to wins | auto | PASS |
| F06-E2 | F06 Verified Records | edge: ledger root hash stamp | Inspect header of `/u/[username]` | Displays today's cryptographic ledger root hash proving zero retroactive edits | auto | PASS |
| F07-H1 | F07 The Scoreboard | happy | Navigate to `/scoreboard` | Displays public figure trading calls scored against Binance prices | auto | PASS |
| F07-H2 | F07 Submit Call | happy | Click "Submit Call", enter figure name, platform, asset, direction, timeframe | Call saved with status `pending` until stated timeframe expires | auto | PASS |
| F07-E1 | F07 Cron Evaluation | happy | Run `/api/cron/scoreboard` when call timeframe has elapsed | Fetches authoritative Binance Spot price at expiry and scores `correct` or `wrong` | auto | PASS |
| F07-N1 | F07 Defamation Guard | negative: ad hominem copy | Submit editorial insults in call notes | Content filtered; scoreboard displays strictly factual direction, price, and result | auto | PASS |
| F08-H1 | F08 The Backtester | happy | Navigate to `/backtest`, select MA Crossover (9/21), run 90-day test | Server simulates against real Binance candles with 0.10% fee drag on every trade | auto | PASS |
| F08-E1 | F08 Permanent Benchmark | edge: check benchmark card | Inspect results view when strategy underperformed holding asset | Mandatory Buy-and-Hold mirror is permanently visible, non-collapsible, and highlights alpha | auto | PASS |
| F08-H2 | F08 Forward Paper Adoption | happy | Click "Run Forward in Paper Trading" | Opens adoption modal with 1.0% risk cap and queues forward execution in paper account | auto | PASS |
| F09-H1 | F09 Admin Console | happy | Admin user navigates to `/admin` | Displays dashboard, user management, audit logs, and latest ledger snapshot | auto | PASS |
| F09-N1 | F09 Admin Security Gate | negative: unauthorized access | Non-admin user attempts to navigate to `/admin` | Server middleware intercepts request and immediately redirects to `/` with 403 notice | auto | PASS |
| F09-H2 | F09 Audit Logging | happy | Admin modifies feature flag or freezes user | Immutable row written to `admin_audit_log` with timestamp, admin_id, and details | auto | PASS |
