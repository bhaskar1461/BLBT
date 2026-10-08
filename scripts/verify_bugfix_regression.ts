/**
 * Regression Test Suite: Bug Fixes & Architectural Guards
 *
 * Verifies fixes for the top 3 user-reported bugs:
 * Guard 1: Limit Order Solvency Protection (Prevents negative balance invariant violations)
 * Guard 2: Social OpenGraph / Discord Card Metadata Resolution (metadataBase + 1200x630 specs)
 * Guard 3: Dynamic Leaderboard Trader Stats & Current User Ranking Sync
 * Guard 4: Telemetry Error Tracking & Severity Ranking
 */

import fs from 'fs';
import path from 'path';
import { serverPaperTrading } from '../src/lib/paperTradingService';
import { generateMetadata as generateTradeMetadata } from '../src/app/share/[tradeId]/page';
import { generateMetadata as generateStatsMetadata } from '../src/app/share/stats/[userId]/page';
import { logger } from '../src/lib/logger';
import { toBaseUnits, fromBaseUnits } from '../src/lib/tradeUnits';

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

async function runRegressionSuite() {
  console.log('\n======================================================');
  console.log('🧪 RUNNING BUGFIX REGRESSION GUARD VERIFICATION SUITE');
  console.log('======================================================\n');

  // -------------------------------------------------------------------
  // GUARD 1: LIMIT ORDER SOLVENCY PROTECTION
  // -------------------------------------------------------------------
  console.log('--- [GUARD 1] Limit Order Solvency & Negative Balance Protection ---');
  const testUserId = `usr_solvency_test_${Date.now()}`;
  const { account, orders, transactions } = await serverPaperTrading.getOrCreateAccount(testUserId);

  // Set account balance to 100 USDT (100 * 10^8 base units)
  account.balance_units = (100n * 100_000_000n).toString();

  // Create an open limit buy order for 1 BTC at $50,000 (requires 50,000 USDT)
  const hugeLimitOrder: any = {
    id: `ord_limit_huge_${Date.now()}`,
    user_id: testUserId,
    account_id: account.id,
    symbol: 'BTCUSDT',
    side: 'buy' as const,
    type: 'limit' as const,
    status: 'open',
    price_units: toBaseUnits(50000).toString(),
    amount_units: toBaseUnits(1).toString(),
    filled_amount_units: '0',
    total_cost_units: toBaseUnits(50000).toString(),
    fee_units: toBaseUnits(50).toString(),
    created_at: new Date().toISOString(),
    filled_at: null,
  };
  orders.push(hugeLimitOrder);

  // Drain user balance down to 10 USDT (simulating user spending on other trades)
  account.balance_units = (10n * 100_000_000n).toString();

  // Trigger checkAndExecuteAdvancedOrders where BTC dumps to $48,000 (below $50,000 limit)
  await serverPaperTrading.checkAndExecuteAdvancedOrders({
    BTCUSDT: 48000,
  });

  // Verification:
  // 1. Balance must NOT be negative! Must remain >= 0
  const finalBalanceUnits = BigInt(account.balance_units);
  assert(finalBalanceUnits >= 0n, `Account balance is strictly non-negative: ${fromBaseUnits(finalBalanceUnits)} USDT`);
  assert(finalBalanceUnits === 10n * 100_000_000n, 'Account balance was protected and untouched');

  // 2. Order status must be 'rejected', NOT 'filled'
  assert(hugeLimitOrder.status === 'rejected', `Order status was safely rejected due to insolvency: status=${hugeLimitOrder.status}`);

  // 3. Immutable audit ledger must record limit_rejected transaction
  const rejectedTx = transactions.find((t) => t.type === 'limit_rejected');
  assert(!!rejectedTx, 'Immutable ledger transaction type="limit_rejected" appended');
  assert(
    (rejectedTx?.details as any)?.reason?.includes('solvency'),
    'Ledger details records balance solvency guard trigger'
  );

  // -------------------------------------------------------------------
  // GUARD 2: OPENGRAPH & DISCORD PREVIEW METADATA RESOLUTION
  // -------------------------------------------------------------------
  console.log('\n--- [GUARD 2] Social OpenGraph & Discord Preview Resolution ---');

  // 1. RootLayout must define metadataBase
  const layoutContent = fs.readFileSync(path.resolve(process.cwd(), 'src/app/layout.tsx'), 'utf-8');
  assert(
    layoutContent.includes('metadataBase: new URL'),
    'Root layout defines metadataBase for canonical OpenGraph resolution'
  );

  // 2. Share trade metadata generation
  const tradeMeta = await generateTradeMetadata({ params: { tradeId: 'trade_sample_123' } });
  assert(!!tradeMeta.openGraph, 'Share trade page defines openGraph metadata');
  assert(!!tradeMeta.twitter, 'Share trade page defines twitter card metadata');
  assert(
    (tradeMeta.twitter as any)?.card === 'summary_large_image',
    'Twitter card is summary_large_image for high-res preview'
  );
  const tradeImages = tradeMeta.openGraph?.images as any[];
  assert(Array.isArray(tradeImages) && tradeImages.length > 0, 'OpenGraph images array is populated');
  assert(tradeImages[0].width === 1200 && tradeImages[0].height === 630, 'OpenGraph image has standard 1200x630 dimensions');

  // 3. Share stats metadata generation
  const statsMeta = await generateStatsMetadata({ params: { userId: 'usr_bhaskar_sharma' } });
  assert(!!statsMeta.openGraph?.images, 'Share stats page provides openGraph images');
  assert((statsMeta.twitter as any)?.card === 'summary_large_image', 'Stats twitter card is summary_large_image');

  // -------------------------------------------------------------------
  // GUARD 3: DYNAMIC LEADERBOARD STATS & CURRENT USER RANKING SYNC
  // -------------------------------------------------------------------
  console.log('\n--- [GUARD 3] Dynamic Leaderboard Stats & Current User Ranking Sync ---');
  const dynamicTraderId = `usr_dynamic_${Date.now()}`;
  const { account: dynAcc, positions: dynPositions } = await serverPaperTrading.getOrCreateAccount(dynamicTraderId);

  // Open and close a highly profitable trade for this user (+3,500 USDT profit)
  const posId = `pos_dyn_${Date.now()}`;
  dynPositions.push({
    id: posId,
    user_id: dynamicTraderId,
    account_id: dynAcc.id,
    symbol: 'ETHUSDT',
    side: 'long',
    quantity_units: toBaseUnits(10).toString(),
    entry_price_units: toBaseUnits(3000).toString(),
    margin_units: toBaseUnits(30000).toString(),
    realized_pnl_units: '0',
    opened_at: new Date(Date.now() - 3600000).toISOString(),
    updated_at: new Date().toISOString(),
  });

  // Close position at $3,350 (+350 * 10 = +$3,500 gross)
  await serverPaperTrading.closePosition(dynamicTraderId, posId, 3350, 'Dynamic Pro Trader');

  // Fetch leaderboard for dynamicTraderId
  const lbResult = serverPaperTrading.getLeaderboard('all', dynamicTraderId);
  assert(lbResult.rankings.length > 0, `Leaderboard rankings returned: ${lbResult.rankings.length} entries`);

  const traderRank = lbResult.currentUserRank;
  assert(!!traderRank, 'Current user rank object is returned in response');
  assert(traderRank?.userId === dynamicTraderId, `Current user rank points to correct userId: ${traderRank?.userId}`);
  assert(
    (traderRank?.realizedPnl || 0) > 0,
    `Dynamic closed trade realized PnL was aggregated: $${traderRank?.realizedPnl}`
  );
  assert(
    (traderRank?.winRatePct || 0) === 100,
    `Win rate properly computed: ${traderRank?.winRatePct}% (1 winning trade out of 1)`
  );
  assert(traderRank?.tradesCount === 1, `Trade count dynamically updated: ${traderRank?.tradesCount}`);

  // -------------------------------------------------------------------
  // GUARD 4: TELEMETRY ERROR TRACKING & SEVERITY RANKING
  // -------------------------------------------------------------------
  console.log('\n--- [GUARD 4] Structured Telemetry Error Tracking ---');
  const captured = logger.captureException(new Error('Simulated network timeout connecting to Binance ticker'), {
    userId: 'usr_test_audit',
    route: '/api/trade/order',
  });
  assert(!!captured.id, `Captured exception has unique event ID: ${captured.id}`);

  // Deduping / occurrence counting verification
  logger.captureException(new Error('Simulated network timeout connecting to Binance ticker'));
  const recent = logger.getRecentErrors();
  assert(recent.length > 0, `Telemetry logger returned ranked errors: ${recent.length}`);
  const match = recent.find((e) => e.fingerprint?.includes('Simulated network timeout'));
  assert((match?.occurrenceCount || 0) >= 2, `Error occurrences incremented: count=${match?.occurrenceCount}`);
  assert(recent[0].level === 'critical', `Highest severity error ranks first: level=${recent[0].level}`);

  // -------------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------------
  console.log('\n======================================================');
  console.log(`🏁 TEST COMPLETE: ${passed} PASSED | ${failed} FAILED`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runRegressionSuite().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
