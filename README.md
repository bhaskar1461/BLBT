# Celsius Network — The Honest Terminal 🏛️

> **"The only trading platform that profits from you not losing money."**  
> Free forever. Faster than everything. We show you what the herd is doing — and what happens to herds.

---

## 🧭 Executive Overview

**Celsius Network** is a high-frequency, institutional-grade crypto paper trading and market intelligence terminal built on Next.js 14, React 18, and Supabase PostgreSQL. Unlike casino brokers and retail platforms that profit from customer liquidation and churning fees, Celsius Network is engineered around **radical transparency, cryptographic verification, and disciplined loss protection**.

---

## 🏛️ Core Financial & Technical Invariants

All paper-trading and financial logic in Celsius Network strictly adheres to the invariants defined in [`AGENTS.md`](file:///c:/Users/bhask/Desktop/Celsius%20Network/AGENTS.md):

1. **Server-Side Computation Only**
   - All balances, orders, positions, fee deductions, and realized P&L are computed strictly in server-side API routes (`/api/trade/*`).
   - The browser client serves solely as a presentation layer.

2. **Integer Math (Cents/Wei-Style) — Zero Floating Point Drift**
   - Currency and asset quantities are scaled by $10^8$ base units (`SCALE = 100_000_000n`):
     - `1.0 USDT` = `100,000,000` base units (`units`).
     - Default account balance: `10,000 USDT` = `1,000,000,000,000` base units.
     - Order fee: Exact integer deduction `(cost_units * 10n) / 10_000n` (flat 0.10%).
   - Floating-point representations are strictly restricted to UI render-time formatting utilities.

3. **Append-Only Immutable Ledger (`paper_transactions`)**
   - Every balance modification, execution fill, fee charge, and account reset appends an immutable transaction record into PostgreSQL.
   - `UPDATE` and `DELETE` queries are prohibited.

4. **Cryptographic Tamper-Evidence (`ledger_snapshots`)**
   - Paper trades are hash-chained (`ledger_hash`) using SHA-256.
   - Daily cron jobs seal the global activity into immutable daily root hashes displayed publicly at [`/transparency`](file:///c:/Users/bhask/Desktop/Celsius%20Network/src/app/transparency/page.tsx).

5. **Mandatory Buy-and-Hold Benchmark Everywhere**
   - Every performance display presents an unvarnished comparison:
     *"Same capital in BTC buy-and-hold over the same period: +X%. You: +Y%."*
   - Never hidden or de-emphasized when holding beats active trading.

6. **Loss Protection & Discipline**
   - Enforced 5% daily drawdown circuit breaker (cannot be raised on losing days).
   - Revenge-trade detector with automatic 5-minute cooldown break prompt.
   - 1.0% professional per-trade risk cap.

7. **Structural Privacy Barrier (Non-Promissory)**
   - Sentiment analytics operate strictly on a 25-user minimum active cohort threshold. Zero user IDs or wallet balances leave the aggregation boundary.

8. **Permanent Zero Ads & Affiliates Rule**
   - Zero exchange kickbacks, zero affiliate links, zero paid token listings.
   - Operational costs and treasury reserves published live at [`/funding`](file:///c:/Users/bhask/Desktop/Celsius%20Network/src/app/funding/page.tsx).

---

## 🏗️ 10-Phase Architecture & Public Surfaces

| Phase | Milestone | Public Route / API | Description |
|---|---|---|---|
| **Phase 1** | The Verifiable Ledger | [`/transparency`](file:///c:/Users/bhask/Desktop/Celsius%20Network/src/app/transparency/page.tsx) | Daily cryptographic SHA-256 ledger snapshots and integrity proofs. |
| **Phase 2** | The Reality Page | [`/reality`](file:///c:/Users/bhask/Desktop/Celsius%20Network/src/app/reality/page.tsx) | Server-rendered aggregate statistics on retail trading outcomes. |
| **Phase 3** | Truth in Every Screen | Terminal & Modals | Buy-and-hold benchmark, 60s honest onboarding, revenge trade detector. |
| **Phase 4** | The Sentiment Index | [`/sentiment`](file:///c:/Users/bhask/Desktop/Celsius%20Network/src/app/sentiment/page.tsx) | Retail positioning vs price moves, 24h delayed public feed. |
| **Phase 5** | Verified Public Records | [`/u/[username]`](file:///c:/Users/bhask/Desktop/Celsius%20Network/src/app/u/[username]/page.tsx) | Cryptographically stamped unforgeable resumes with equal billing for losses. |
| **Phase 6** | The Scoreboard | [`/scoreboard`](file:///c:/Users/bhask/Desktop/Celsius%20Network/src/app/scoreboard/page.tsx) | Neutral, automated scoring of public influencer calls against real Binance spot prices. |
| **Phase 7** | The Backtester | [`/backtest`](file:///c:/Users/bhask/Desktop/Celsius%20Network/src/app/backtest/page.tsx) | Historical strategy simulation with mandatory fee drag and BTC comparison. |
| **Phase 8** | Community Tournaments | [`/tournaments`](file:///c:/Users/bhask/Desktop/Celsius%20Network/src/app/tournaments/page.tsx) | Zero-fee competitions ranked strictly by risk-adjusted return ($Score = \frac{Net\%}{Drawdown\% + 1}$). |
| **Phase 9** | Transparent Funding & API | [`/funding`](file:///c:/Users/bhask/Desktop/Celsius%20Network/src/app/funding/page.tsx), [`/developers`](file:///c:/Users/bhask/Desktop/Celsius%20Network/src/app/developers/page.tsx) | Real-time treasury ledger and developer Sentiment API keys. |
| **Phase 10** | Launch The Story | [`/about`](file:///c:/Users/bhask/Desktop/Celsius%20Network/src/app/about/page.tsx), [`/changelog`](file:///c:/Users/bhask/Desktop/Celsius%20Network/src/app/changelog/page.tsx), [`/terms`](file:///c:/Users/bhask/Desktop/Celsius%20Network/src/app/terms/page.tsx) | Founding manifesto, right-of-reply guarantees, and full transparent history. |

---

## ⚡ Performance Budget

- **Sub-1s Page Load Time**: Server-rendered layouts optimized for instant delivery.
- **<150KB First Load JS**: System fonts only, dynamic imports for heavy chart widgets, lightweight zero-dependency SVG graphics.
- **Shared First Load JS**: ~87.4 kB (41% below the 150KB budget ceiling).

---

## 🛠️ Getting Started

### 1. Installation
```bash
npm install
```

### 2. Development Server
```bash
npm run dev
```

### 3. Production Build
```bash
npm run build
npm start
```

### 4. Running Verification Test Suites
Celsius Network includes 15 automated test suites covering all phases, security policies, and invariants:
```bash
# Run individual verification suites:
npx tsx scripts/verify_phase1_honest_terminal.ts
npx tsx scripts/verify_phase2_reality_page.ts
npx tsx scripts/verify_phase3_truth_screens.ts
npx tsx scripts/verify_phase4_sentiment_index.ts
npx tsx scripts/verify_phase5_security.ts
npx tsx scripts/verify_phase5_verified_records.ts
npx tsx scripts/verify_phase6_scoreboard.ts
npx tsx scripts/verify_phase7_backtester.ts
npx tsx scripts/verify_phase8_tournaments.ts
npx tsx scripts/verify_phase9_funding_and_api.ts
npx tsx scripts/verify_phase10_launch.ts
npx tsx scripts/verify_api_routes.ts
npx tsx scripts/verify_bugfix_regression.ts
npx tsx scripts/verify_phase_a.ts
```

---

## 📄 License & Mission
Built with transparency and integrity. Free for all traders.
