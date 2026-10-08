// scripts/verify_phase3_truth_screens.ts
import fs from 'fs';
import path from 'path';
import { benchmarkService } from '../src/lib/benchmarkService';
import { lossProtectionService } from '../src/lib/lossProtectionService';
import { adminService } from '../src/lib/adminService';
import { serverPaperTrading } from '../src/lib/paperTradingService';
import type { ClosedTradeRecord } from '../src/types/trading';

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

async function run() {
  console.log('\n🧪 ========================================================');
  console.log('🧪 VERIFYING PHASE 3: TRUTH IN EVERY SCREEN');
  console.log('🧪 ========================================================\n');

  // --------------------------------------------------------------------------
  // PROMPT 3.1: BUY-AND-HOLD BENCHMARK EVERYWHERE
  // --------------------------------------------------------------------------
  console.log('--- TEST GROUP 1: Prompt 3.1 — Buy-and-Hold Benchmark Everywhere ---');

  // 1.1 Invariant in AGENTS.md
  const agentsMd = fs.readFileSync(path.join(process.cwd(), 'AGENTS.md'), 'utf-8');
  assert(
    agentsMd.includes('No result is ever shown without context: drawdown, sample size, and buy-and-hold comparison') ||
    agentsMd.includes('No result shown without context: drawdown, sample size, buy-and-hold'),
    'AGENTS.md enforces the buy-and-hold context invariant'
  );
  assert(
    agentsMd.includes('Same capital in BTC buy-and-hold over the same period: +X%. You: +Y%'),
    'AGENTS.md defines the verbatim buy-and-hold comparison formula'
  );

  // 1.2 Benchmark service formula
  const comparisonFormula = benchmarkService.formatBenchmarkComparison(5.2, 14.8);
  assert(
    comparisonFormula.includes('Same capital in BTC buy-and-hold over the same period: +14.80%. You: +5.20%.'),
    `benchmarkService formats comparison text: "${comparisonFormula}"`
  );

  // 1.3 Underperforming case (passive beats active)
  const losingComp = benchmarkService.compareAgainstBtcBuyAndHold(10000, -350, 30, 14.8);
  assert(!losingComp.userBeatBtc, 'Identifies when BTC beats the active trader');
  assert(
    losingComp.honestVerdict.includes('Same capital in BTC buy-and-hold over the same period: +14.80%. You: -3.50%.'),
    'Honest verdict includes verbatim comparison for underperforming trader'
  );
  assert(
    losingComp.honestVerdict.includes('zero trading stress'),
    'Honest verdict emphasizes passive peace of mind'
  );

  // 1.4 Outperforming case (active beats passive)
  const winningComp = benchmarkService.compareAgainstBtcBuyAndHold(10000, 2500, 30, 14.8);
  assert(winningComp.userBeatBtc, 'Identifies when active trader generates positive alpha');
  assert(winningComp.alphaPct === 10.2, 'Calculates exact net alpha: user 25% - btc 14.8% = 10.2%');
  assert(winningComp.honestVerdict.includes('Keep your discipline'), 'Reminds outperforming trader to keep discipline');

  // 1.5 Async live/historical fetch
  const asyncComp = await benchmarkService.compareAgainstBtcBuyAndHoldAsync(10000, 500, 30);
  assert(typeof asyncComp.btcPnlPct === 'number' && asyncComp.btcPnlPct > 0, 'Async benchmark fetches BTC return');
  assert(asyncComp.formattedComparison.length > 0, 'Async comparison produces non-empty formatted comparison');

  // 1.6 Component integrations
  const posOrdersFile = fs.readFileSync(
    path.join(process.cwd(), 'src/components/trading/PositionsAndOrders.tsx'),
    'utf-8'
  );
  assert(
    posOrdersFile.includes('<BenchmarkComparisonBanner userId={user.id} variant="pill"'),
    'PositionsAndOrders header includes BenchmarkComparisonBanner pill'
  );
  assert(
    posOrdersFile.includes('<BenchmarkComparisonBanner userId={user.id} variant="banner"'),
    'PositionsAndOrders tabs include BenchmarkComparisonBanner banner'
  );

  const paperPanelFile = fs.readFileSync(
    path.join(process.cwd(), 'src/components/trading/PaperTradingPanel.tsx'),
    'utf-8'
  );
  assert(
    paperPanelFile.includes('<BenchmarkComparisonBanner userId={user.id} variant="banner"'),
    'PaperTradingPanel includes BenchmarkComparisonBanner under equity'
  );

  const profileModalFile = fs.readFileSync(
    path.join(process.cwd(), 'src/components/profile/ProfileModal.tsx'),
    'utf-8'
  );
  assert(
    profileModalFile.includes('<BenchmarkComparisonBanner userId={userId} variant="banner" periodDays={30}'),
    'ProfileModal includes BenchmarkComparisonBanner in DNA tab'
  );

  const benchmarkRouteFile = fs.readFileSync(
    path.join(process.cwd(), 'src/app/api/benchmark/route.ts'),
    'utf-8'
  );
  assert(benchmarkRouteFile.includes('benchmarkService.compareAgainstBtcBuyAndHoldAsync'), '/api/benchmark route calls async benchmark service');

  // --------------------------------------------------------------------------
  // PROMPT 3.2: HONEST ONBOARDING
  // --------------------------------------------------------------------------
  console.log('\n--- TEST GROUP 2: Prompt 3.2 — Honest Onboarding Flow ---');

  const onboardingFile = fs.readFileSync(
    path.join(process.cwd(), 'src/components/onboarding/HonestOnboardingModal.tsx'),
    'utf-8'
  );
  assert(
    onboardingFile.includes('78.2% of paper traders on this platform lost money last month'),
    'Screen 1 displays verbatim Reality Check headline: 78.2% lost money'
  );
  assert(
    onboardingFile.includes('Trading is hard, expensive, and mostly unnecessary'),
    'Screen 1 includes truth manifesto copy'
  );
  assert(
    onboardingFile.includes('build real risk discipline'),
    'Screen 1 sets monastery tone against casino greed'
  );
  assert(
    onboardingFile.includes('Select Core Watchlist Instruments'),
    'Screen 2 Step 1 allows instrument selection'
  );
  assert(
    onboardingFile.includes('Set Risk-Per-Trade Cap'),
    'Screen 2 Step 2 allows risk-per-trade cap selection'
  );
  assert(
    onboardingFile.includes('A 1% cap means you need 50 consecutive losses to blow up'),
    'Screen 2 Step 2 explains professional 1% risk cap logic'
  );
  assert(
    onboardingFile.includes('10,000.00 USDT Paper Balance'),
    'Screen 2 Step 3 provisions 10,000 USDT paper balance'
  );

  const shellFile = fs.readFileSync(
    path.join(process.cwd(), 'src/components/layout/Shell.tsx'),
    'utf-8'
  );
  assert(
    shellFile.includes('<HonestOnboardingModal'),
    'Shell.tsx mounts HonestOnboardingModal'
  );
  assert(
    shellFile.includes("localStorage.getItem('celsius_onboarding_completed')"),
    'Shell.tsx checks local storage to trigger onboarding for first-time users'
  );
  assert(
    shellFile.includes('onOpenOnboarding={() => setIsOnboardingOpen(true)}'),
    'Shell.tsx wires ProfileModal to re-open Honest Onboarding on demand'
  );

  // --------------------------------------------------------------------------
  // PROMPT 3.3: LOSS-PROTECTION FEATURES
  // --------------------------------------------------------------------------
  console.log('\n--- TEST GROUP 3: Prompt 3.3 — Loss-Protection Features ---');

  // 3.1 Feature flag in adminService
  const adminFlags = adminService.getFeatureFlags();
  const lossLimitsFlag = adminFlags.find((f) => f.key === 'loss_limits');
  assert(Boolean(lossLimitsFlag && lossLimitsFlag.enabled), 'AdminService registers loss_limits feature flag as enabled');

  // 3.2 Daily loss limit logic
  const testUser = 'usr_discipline_tester';
  const cfg = lossProtectionService.getConfig(testUser);
  assert(cfg.maxDailyLossPct === 5.0, 'Default daily loss limit is 5.0%');
  assert(cfg.riskPerTradePct === 1.0, 'Default risk per trade is 1.0%');

  // Check default status for clean account
  const cleanStatus = lossProtectionService.checkDailyLossStatus(testUser);
  assert(!cleanStatus.isLocked, 'Clean account is not locked');
  assert(cleanStatus.maxAllowedLossUsdt === 500, '5% cap of 10,000 USDT is exactly $500');

  // Test discipline invariant: Cannot increase cap on a losing day
  const testLosingUser = 'usr_losing_day_trader';
  const fakeLosingTrade: ClosedTradeRecord = {
    id: 'trade_losing_01',
    userId: testLosingUser,
    userDisplayName: 'Losing Trader',
    symbol: 'BTCUSDT',
    side: 'long',
    entryPrice: 65000,
    exitPrice: 64200,
    quantity: 1,
    margin: 65000,
    realizedPnl: -800, // -$800 loss exceeds 5% of 10k ($500)
    realizedPnlPct: -1.23,
    fee: 64.2,
    durationSeconds: 1800,
    durationFormatted: '30m',
    openedAt: new Date().toISOString(),
    closedAt: new Date().toISOString(),
  };

  // Inject trade into paper trading store for testing
  (serverPaperTrading as any).closedTrades.set(testLosingUser, [fakeLosingTrade]);

  // Check daily loss lock
  const lockedStatus = lossProtectionService.checkDailyLossStatus(testLosingUser);
  assert(lockedStatus.isLocked, 'Daily loss limit locks trading when loss exceeds 5% cap');
  assert(
    lockedStatus.message.includes("You've reached your daily limit. Great traders know when to walk away."),
    'Daily loss lock message matches calm non-punitive specification'
  );

  // Invariant check: Try to raise cap while on a losing day
  const attemptRaise = lossProtectionService.updateDailyLossCap(testLosingUser, 10.0);
  assert(!attemptRaise.success, 'Disciplined Invariant: Rejects raising cap on a losing day');
  assert(
    Boolean(attemptRaise.error?.includes('You cannot increase or loosen your daily loss limit while on a losing day')),
    'Error message clearly communicates loss invariant'
  );

  // 3.3 Revenge-trade detector
  const revengeUser = 'usr_revenge_tester';
  const now = Date.now();
  const initialLoss: ClosedTradeRecord = {
    id: 'trade_rev_loss',
    userId: revengeUser,
    userDisplayName: 'Emotional Trader',
    symbol: 'BTCUSDT',
    side: 'long',
    entryPrice: 65000,
    exitPrice: 64500,
    quantity: 0.5,
    margin: 32500,
    realizedPnl: -250,
    realizedPnlPct: -0.77,
    fee: 32.5,
    durationSeconds: 600,
    durationFormatted: '10m',
    openedAt: new Date(now - 20 * 60 * 1000).toISOString(),
    closedAt: new Date(now - 12 * 60 * 1000).toISOString(), // Closed 12 mins ago
  };

  // 3 rapid trades placed within 10 minutes following the loss
  const rapidTrade1: ClosedTradeRecord = {
    ...initialLoss,
    id: 'trade_rev_1',
    realizedPnl: -50,
    openedAt: new Date(now - 10 * 60 * 1000).toISOString(),
    closedAt: new Date(now - 8 * 60 * 1000).toISOString(),
  };
  const rapidTrade2: ClosedTradeRecord = {
    ...initialLoss,
    id: 'trade_rev_2',
    realizedPnl: 20,
    openedAt: new Date(now - 7 * 60 * 1000).toISOString(),
    closedAt: new Date(now - 5 * 60 * 1000).toISOString(),
  };
  const rapidTrade3: ClosedTradeRecord = {
    ...initialLoss,
    id: 'trade_rev_3',
    realizedPnl: -30,
    openedAt: new Date(now - 4 * 60 * 1000).toISOString(),
    closedAt: new Date(now - 2 * 60 * 1000).toISOString(),
  };

  (serverPaperTrading as any).closedTrades.set(revengeUser, [
    rapidTrade3,
    rapidTrade2,
    rapidTrade1,
    initialLoss,
  ]);

  const revengeCheck = lossProtectionService.detectRevengeTrading(revengeUser);
  assert(revengeCheck.detected, 'Detects revenge trading when 3+ rapid trades occur within 15m of a loss');
  assert(
    revengeCheck.message.includes('Pattern detected: 3 rapid trades after a loss'),
    'Revenge trade detector produces gentle educational warning'
  );

  // Activate 5-minute break
  const until = lossProtectionService.activateBreakCooldown(revengeUser, 5);
  assert(until > Date.now(), 'Activates 5-minute cooldown break');
  const postBreakCheck = lossProtectionService.detectRevengeTrading(revengeUser);
  assert(postBreakCheck.isCooldownActive, 'Cooldown is active following break trigger');

  // 3.4 Post-Session Review (The 3-line card)
  const sessionReview = lossProtectionService.computeSessionReview(revengeUser);
  assert(sessionReview.totalTradesToday === 4, 'Session review correctly counts total trades today');
  assert(sessionReview.losingTrades === 3, 'Session review counts losing trades');
  assert(sessionReview.winningTrades === 1, 'Session review counts winning trades');
  assert(sessionReview.feesPaidUsdt > 0, 'Session review computes fees paid (what the casino made)');
  assert(typeof sessionReview.ifDoneNothingUsdt === 'number', 'Session review computes if you had done nothing delta');

  // 3.5 Server-side order rejection on lock
  const tradeOrderRouteFile = fs.readFileSync(
    path.join(process.cwd(), 'src/app/api/trade/order/route.ts'),
    'utf-8'
  );
  assert(
    tradeOrderRouteFile.includes('lossProtectionService.checkDailyLossStatus(userId)'),
    '/api/trade/order checks lossProtectionService before order execution'
  );
  assert(
    tradeOrderRouteFile.includes('DAILY_LOSS_LIMIT_REACHED'),
    '/api/trade/order returns DAILY_LOSS_LIMIT_REACHED error code when locked'
  );

  // 3.6 Protection API route
  const protectionRouteFile = fs.readFileSync(
    path.join(process.cwd(), 'src/app/api/trade/protection/route.ts'),
    'utf-8'
  );
  assert(protectionRouteFile.includes('set_daily_loss_cap'), '/api/trade/protection handles set_daily_loss_cap');
  assert(protectionRouteFile.includes('activate_cooldown'), '/api/trade/protection handles activate_cooldown');

  // 3.7 UI Components
  const lockBannerFile = fs.readFileSync(
    path.join(process.cwd(), 'src/components/trading/DailyLossLockBanner.tsx'),
    'utf-8'
  );
  assert(
    lockBannerFile.includes("You've reached your daily limit. Great traders know when to walk away."),
    'DailyLossLockBanner displays calm circuit breaker message'
  );

  const revengeBannerFile = fs.readFileSync(
    path.join(process.cwd(), 'src/components/trading/RevengeTradeWarningBanner.tsx'),
    'utf-8'
  );
  assert(
    revengeBannerFile.includes('Take a 5-Minute Break'),
    'RevengeTradeWarningBanner includes "Take a 5-Minute Break" button'
  );

  const reviewModalFile = fs.readFileSync(
    path.join(process.cwd(), 'src/components/trading/PostSessionReviewModal.tsx'),
    'utf-8'
  );
  assert(
    reviewModalFile.includes('Total Trades Today') &&
    reviewModalFile.includes('Fees Paid (What casino made)') &&
    reviewModalFile.includes('If you had done nothing'),
    'PostSessionReviewModal implements the exact 3-line honest summary card'
  );

  console.log('\n========================================================');
  console.log(`Phase 3 Test Results: ${passed} passed, ${failed} failed`);
  console.log('========================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error('Test run error:', err);
  process.exit(1);
});
