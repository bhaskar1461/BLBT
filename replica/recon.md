# Recon map: Celsius Network — "The Honest Terminal" (Web)

Scope: Full Web Trading Terminal, Accountability Scoreboard, Sentiment Index, Reality Check, Cryptographic Transparency Ledger, Backtester, and Public Profiles
For: Retail crypto traders seeking honest, transparent, non-predatory trading tools
Date: 2026-10-07

## Sources

| # | source | URL | notes |
| --- | --- | --- | --- |
| 1 | PRD | `/docs/PRD.md` | Core paper trading, integer math, and ledger specs |
| 2 | Honest Terminal PRD | `/docs/HONEST_TERMINAL_PRD.md` | "The Honest Terminal" positioning and rules |
| 3 | Invariant Guidelines | `/AGENTS.md` | Financial, security, and truth invariants |
| 4 | Live Web Routes | `http://localhost:3000/` | Local server implementation |

## Core loop

"The only trading platform that profits from you not losing money." Users test trading ideas, execute paper trades against live Binance Spot prices under honest loss-protection guardrails, verify crowd sentiment, and benchmark performance against buy-and-hold reality.

## Screens

| ID | screen | route / how to reach | purpose | key components | states seen |
| --- | --- | --- | --- | --- | --- |
| S01 | Main Terminal | `/` | Live charting, paper order submission, position tracking | LightweightChart, OrderForm, PositionsDock, TerminalSentimentStrip | empty, active position, order submitted, loss locked |
| S02 | The Reality Check | `/reality` (nav link) | Public truth statistics on trader profitability | StatsOverview, PnlDistributionChart, TopAssetsComparison | loaded, 30d/90d filtered |
| S03 | Ledger Transparency | `/transparency` (nav link) | Tamper-evident daily cryptographic SHA-256 proofs | LatestSnapshotCard, HashChainAudit, CopyHashButton | verified, zero broken links |
| S04 | Sentiment Index | `/sentiment` (nav link) | Retail crowd positioning vs price overlay | SentimentChart, AssetPicker, CrowdAccuracyStats | 24h-delayed public, real-time in terminal |
| S05 | Verified Records | `/u/[username]` (profile modal) | Unforgeable, complete trader track record | VerifiedBadge, LedgerRootStamp, TradeHistoryTable, BuyAndHoldMirror | public, private, empty |
| S06 | The Scoreboard | `/scoreboard` (nav link) | Accountability scoring of public influencer calls | ScoreboardViewer, SubmitCallModal, CallerLeaderboard | pending, scored, undefined |
| S07 | The Backtester | `/backtest` (nav link) | Server-side historical strategy simulation | BacktestForm, BacktestEquityChart, BacktestResultsView, AdoptForwardModal | configuring, simulating, results rendered |
| S08 | Leaderboard | `/leaderboard` (nav link) | Risk-adjusted rank of active traders | LeaderboardTable, TraderRankCard | loaded, pinned user rank |
| S09 | Admin Console | `/admin` (nav link / role gate) | Moderation, audit logs, feature flags, freeze | AdminDashboard, AuditLogTable, UserManagement | authorized, 403 redirected |

## Flows

```
F01 Market & Limit Order Execution
    S01 (Enter Symbol, Size, Order Type) -> Server executes against live Binance Spot -> Appends paper_transactions -> Updates Position
    happy path clicks: 3
    edge: zero balance, price slippage, connection timeout, limit order trigger

F02 Daily Loss Lock & Revenge Trade Protection
    S01 -> User experiences 5% daily drawdown -> Trading locks with calm "You're done for today" screen -> Lock persists across refresh
    happy path clicks: automated
    edge: user attempts to raise cap on losing day (rejected), rapid 3+ trades trigger 5m cooldown

F03 Cryptographic Ledger Snapshotting
    Cron triggers daily 00:00 UTC -> Hashes 24h trades + prev_root_hash -> Appends ledger_snapshots -> S03 updates with latest hash
    happy path clicks: automated cron
    edge: zero trades in 24h, chain verification audit

F04 Reality Check Discovery
    User navigates to S02 -> Server renders dynamically computed profitability & hold times -> User switches 30d/90d -> Generates OG share card
    happy path clicks: 1
    edge: cohort count < 25 (anonymized boundary)

F05 Sentiment Index Analysis
    User opens S04 -> Selects Asset (BTC/ETH/SOL) -> Inspects crowd % long vs actual price -> Views in-terminal strip on S01
    happy path clicks: 2
    edge: delayed feed vs real-time feed

F06 Public Track Record Sharing
    User opens Profile Modal on S01 -> Toggles "Make my track record public" -> Navigates to S05 -> Inspects complete trade history & daily root hash
    happy path clicks: 2
    edge: selective hiding forbidden (all-or-nothing invariant)

F07 Community Call Scoring
    User navigates to S06 -> Clicks "Submit Call" -> Fills influencer name, platform, asset, direction, timeframe -> Cron scores against Binance at expiry
    happy path clicks: 4
    edge: invalid proof url, asset delisted, price unchanged

F08 Honest Backtesting & Forward Paper Adoption
    User navigates to S07 -> Selects strategy preset (MA/RSI/Breakout/DCA) -> Runs server simulation -> Inspects permanent Buy-and-Hold mirror & fees paid -> Clicks "Run Forward in Paper Trading"
    happy path clicks: 3
    edge: insufficient candles, zero trades triggered, excessive drawdown

F09 Admin Audit & Governance
    Admin logs in -> Accesses S09 -> Freezes suspicious user -> Audited in admin_audit_log -> Frozen user blocked from trading on S01
    happy path clicks: 2
    edge: non-admin access (middleware redirects with 403 notice)
```

## Components

| component | variants | states | used on |
| --- | --- | --- | --- |
| Button | default, primary, secondary, danger, ghost | default, hover, active, disabled, loading | S01-S09 |
| BenchmarkComparisonBanner | inline, hero | neutral, win, loss | S01, S05, S07 |
| TerminalSentimentStrip | compact strip | bull-lean, bear-lean, neutral | S01 |
| BacktestEquityChart | responsive SVG | default, hover crosshair, tooltip | S07 |
| ScoreboardViewer | filtered list | all, scored, pending, platform filter | S06 |
| DailyLossLockBanner | circuit breaker | active lock | S01 |
| RevengeTradeWarningBanner | gentle warning | active break, cooldown | S01 |

## Inferred data model

```
PaperAccount          id, user_id, balance_units, currency, is_frozen, daily_loss_cap_pct
                      evidence: paper_trading_schema.sql, S01
                      confidence: high

PaperTransaction      id, account_id, type, amount_units, fee_units, balance_after_units, ledger_hash
                      evidence: paper_trading_schema.sql, honest_terminal_ledger_snapshots.sql
                      confidence: high (immutable append-only)

LedgerSnapshot        id, date, root_hash, prev_root_hash, trade_count, user_count, total_volume_usdt
                      evidence: honest_terminal_ledger_snapshots.sql, S03
                      confidence: high

PublicTradingCall     id, caller_name, platform, symbol, direction, entry_price, timeframe_days, expires_at, result, status
                      evidence: scoreboard.sql, S06
                      confidence: high

BacktestRun           id, strategy_type, symbol, period_days, initial_capital, final_equity, return_pct, max_drawdown_pct, total_fees_paid, honest_summary_line
                      evidence: backtester.sql, S07
                      confidence: high

UserForwardStrategy   id, user_id, strategy_type, symbol, parameters, risk_per_trade_cap_pct, status
                      evidence: backtester.sql, S07
                      confidence: high
```

## Feature matrix

Must: 38, Should: 12, Could: 4, Skip: 0.

## Out of scope
- Real-money brokerage custody, Fiat bank withdrawals, High-frequency arbitrage, Casino margin gamification.

## Size
Screens 9, flows 9, entities 8. Size: L.
