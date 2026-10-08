/**
 * Verification Test Suite: Phase A — Verifiable Honesty ("The Honest Terminal")
 *
 * Verifies:
 * Prompt A1: SHA-256 Hash-Chained Trade Ledger & Daily Snapshots
 * Prompt A2: The Reality Check Aggregate Truth Statistics Engine
 * Prompt A3: Truthful Bitcoin Buy-and-Hold Benchmarks Comparison
 */

import { transparencyService } from '../src/lib/transparencyService';
import { realityService } from '../src/lib/realityService';
import { benchmarkService } from '../src/lib/benchmarkService';

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${msg}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${msg}`);
    failed++;
  }
}

async function runPhaseASuite() {
  console.log('\n======================================================');
  console.log('⚖️ RUNNING PHASE A (VERIFIABLE HONESTY) VERIFICATION');
  console.log('======================================================\n');

  // -------------------------------------------------------------------
  // PROMPT A1: HASH-CHAINED TRADE LEDGER & SNAPSHOTS
  // -------------------------------------------------------------------
  console.log('--- [PROMPT A1] Tamper-Evident SHA-256 Hash-Chained Trade Ledger ---');

  // 1. Single Trade Hashing
  const sampleTrade = {
    id: 'trade_sample_001',
    userId: 'usr_celsius_demo',
    symbol: 'BTCUSDT',
    side: 'long',
    entryPrice: 62450.0,
    exitPrice: 65120.0,
    quantity: 0.5,
    realizedPnl: 1335.0,
    closedAt: new Date().toISOString(),
  };
  const prevHash = '0000000000000000000celsius_genesis_hash';
  const tradeHash = transparencyService.computeTradeHash(sampleTrade, prevHash);

  assert(typeof tradeHash === 'string' && tradeHash.length === 64, `Trade hash is 64-character SHA-256 hex: ${tradeHash.slice(0, 16)}...`);

  // Mutation test: if a single dollar changes, the fingerprint must alter!
  const mutatedTrade = { ...sampleTrade, realizedPnl: 1336.0 };
  const mutatedHash = transparencyService.computeTradeHash(mutatedTrade, prevHash);
  assert(tradeHash !== mutatedHash, 'Cryptographic sensitivity: Mutating $1 in P&L completely alters the ledger hash');

  // 2. Daily Snapshot Generation
  const newSnapshot = transparencyService.generateDailySnapshot();
  assert(!!newSnapshot.root_hash, `Daily snapshot has root_hash: ${newSnapshot.root_hash.slice(0, 16)}...`);
  assert(newSnapshot.trade_count > 0, `Snapshot records trade count: ${newSnapshot.trade_count}`);
  assert(newSnapshot.user_count > 0, `Snapshot records user count: ${newSnapshot.user_count}`);
  assert(newSnapshot.total_volume_usdt > 0, `Snapshot records volume: $${newSnapshot.total_volume_usdt}`);

  // 3. Cryptographic Chain Integrity Verification
  const audit = transparencyService.verifyLedgerIntegrity();
  assert(audit.isValid === true, 'Ledger chain integrity verification passed with zero tampering');
  assert(audit.brokenLinksCount === 0, `Broken links count is 0: brokenLinksCount=${audit.brokenLinksCount}`);
  assert(audit.totalSnapshots >= 7, `Historical daily snapshots chained: ${audit.totalSnapshots}`);

  // -------------------------------------------------------------------
  // PROMPT A2: THE REALITY CHECK AGGREGATE TRUTH STATS
  // -------------------------------------------------------------------
  console.log('\n--- [PROMPT A2] The Reality Check Aggregate Truth Statistics ---');
  const stats30 = realityService.getRealityStats(30);

  // 1. Brutal truth ratios
  assert(stats30.profitableTradersPct < 30, `Profitable traders percentage is realistic and unvarnished: ${stats30.profitableTradersPct}%`);
  assert(stats30.unprofitableTradersPct > 70, `Unprofitable traders percentage reflects retail reality: ${stats30.unprofitableTradersPct}%`);
  assert(stats30.medianPnlUsdt < 0, `Median P&L is negative (-$342.50): $${stats30.medianPnlUsdt}`);

  // 2. Buy-and-Hold outperformance
  assert(stats30.buyAndHoldOutperformedPct > 80, `Buy-and-hold beat retail trading for >80% of accounts: ${stats30.buyAndHoldOutperformedPct}%`);

  // 3. Behavioral pitfalls identified
  assert(stats30.mostCommonLosingBehavior.frequencyPct > 60, `Revenge trading accounts for severe losses: ${stats30.mostCommonLosingBehavior.frequencyPct}%`);
  assert(stats30.mostCommonLosingBehavior.name.includes('Revenge'), `Primary behavioral pitfall identified: ${stats30.mostCommonLosingBehavior.name}`);

  // 4. P&L Distribution Curve
  assert(stats30.pnlDistribution.length === 6, `P&L distribution buckets exist: ${stats30.pnlDistribution.length} buckets`);
  const totalPct = stats30.pnlDistribution.reduce((acc, b) => acc + b.pct, 0);
  assert(Math.round(totalPct) === 100, `P&L distribution sums to 100%: ${Math.round(totalPct)}%`);

  // -------------------------------------------------------------------
  // PROMPT A3: TRUTHFUL BUY-AND-HOLD BENCHMARKS
  // -------------------------------------------------------------------
  console.log('\n--- [PROMPT A3] Truthful Bitcoin Buy-and-Hold Benchmarks ---');

  // Case 1: Outperforming Trader
  const winCase = benchmarkService.compareAgainstBtcBuyAndHold(10000, 31645, 30);
  assert(winCase.userBeatBtc === true, 'Correctly flags when user beats BTC');
  assert(winCase.honestVerdict.includes('outperformed'), `Verdict acknowledges outperformance: ${winCase.honestVerdict}`);

  // Case 2: Underperforming Trader (The Honest Brand Test)
  const lossCase = benchmarkService.compareAgainstBtcBuyAndHold(10000, -500, 30);
  assert(lossCase.userBeatBtc === false, 'Correctly flags when BTC buy-and-hold beats user');
  assert(
    lossCase.honestVerdict.includes('Same capital in BTC buy-and-hold') ||
    lossCase.honestVerdict.includes('Same money in BTC buy-and-hold'),
    'Verdict explicitly displays buy-and-hold comparison'
  );
  assert(lossCase.honestVerdict.includes('stress'), 'Verdict emphasizes passive holding advantages honestly');

  // -------------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------------
  console.log('\n======================================================');
  console.log(`🏁 TEST COMPLETE: ${passed} PASSED | ${failed} FAILED`);
  console.log('======================================================\n');

  if (failed > 0) process.exit(1);
}

runPhaseASuite().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
