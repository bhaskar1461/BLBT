/**
 * Verification Test Suite: Trader Profile System
 *
 * Verifies:
 * 1. Normal Trader Profile default state (10,000 USDT starting capital, tier='standard', day_trader)
 * 2. VIP Institutional Profile differentiation (₹4.80 Cr / $576,000 USDT, tier='vip')
 * 3. Dynamic trading DNA KPIs (Win rate, Profit Factor, Long/Short ratio, Largest win/loss)
 * 4. Milestone Badges Engine (Pioneer, Green Day, Streak Master)
 * 5. Profile Update & Username Uniqueness Validation
 * 6. Safe 1-Click Account Reset to 10,000 USDT default funding
 * 7. Public Profile Privacy Filtering (/u/[username])
 */

import { profileService } from '../src/lib/profileService';
import { serverPaperTrading } from '../src/lib/paperTradingService';
import { toBaseUnits } from '../src/lib/tradeUnits';

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

async function runProfileSuite() {
  console.log('\n======================================================');
  console.log('👤 RUNNING TRADER PROFILE SYSTEM VERIFICATION SUITE');
  console.log('======================================================\n');

  // -------------------------------------------------------------------
  // TEST 1: NORMAL TRADER PROFILE INITIALIZATION
  // -------------------------------------------------------------------
  console.log('--- [TEST 1] Normal Trader Profile Default State ---');
  const normalProfile = await profileService.getProfileWithLiveStats('usr_celsius_demo');

  assert(normalProfile.tier === 'standard', `Tier is 'standard': ${normalProfile.tier}`);
  assert(normalProfile.stats.initialBalance === 10000, `Default initial balance is 10,000 USDT: $${normalProfile.stats.initialBalance}`);
  assert(normalProfile.username === 'satoshisniper', `Default username is @satoshisniper`);
  assert(normalProfile.tradingStyle === 'day_trader', `Trading style is 'day_trader'`);
  assert(normalProfile.privacy.isPublicProfile === true, `Profile is public by default`);
  assert(normalProfile.preferences.currencyDisplay === 'USDT', `Default currency display is USDT`);

  // -------------------------------------------------------------------
  // TEST 2: VIP INSTITUTIONAL PROFILE DIFFERENTIATION
  // -------------------------------------------------------------------
  console.log('\n--- [TEST 2] VIP Institutional Profile Differentiation ---');
  const vipProfile = await profileService.getProfileWithLiveStats('usr_bhaskar_sharma');

  assert(vipProfile.tier === 'vip', `Tier is 'vip': ${vipProfile.tier}`);
  assert(vipProfile.stats.initialBalance === 576000, `VIP initial balance is $576,000 USDT (₹4.80 Cr): $${vipProfile.stats.initialBalance}`);
  assert(vipProfile.displayName === 'Bhaskar Rustam Sharma', `VIP Display Name is Bhaskar Rustam Sharma`);
  const vipBadge = vipProfile.badges.find((b) => b.id === 'badge_vip');
  assert(vipBadge?.isUnlocked === true, `Institutional Net Worth badge is unlocked for VIP`);

  // -------------------------------------------------------------------
  // TEST 3: DYNAMIC TRADING DNA & KPI ENGINE
  // -------------------------------------------------------------------
  console.log('\n--- [TEST 3] Dynamic Trading DNA KPIs & Badges ---');
  const testTraderId = `usr_trader_test_${Date.now()}`;
  const { account, positions } = await serverPaperTrading.getOrCreateAccount(testTraderId);

  // Simulate trade 1: Big Win (+800 USDT)
  const pos1Id = `pos_win_${Date.now()}`;
  positions.push({
    id: pos1Id,
    user_id: testTraderId,
    account_id: account.id,
    symbol: 'BTCUSDT',
    side: 'long',
    quantity_units: toBaseUnits(0.5).toString(),
    entry_price_units: toBaseUnits(60000).toString(),
    margin_units: toBaseUnits(30000).toString(),
    realized_pnl_units: '0',
    opened_at: new Date(Date.now() - 7200000).toISOString(),
    updated_at: new Date().toISOString(),
  });
  await serverPaperTrading.closePosition(testTraderId, pos1Id, 61600, 'Alex Chen');

  // Simulate trade 2: Small Loss (-200 USDT)
  const pos2Id = `pos_loss_${Date.now()}`;
  positions.push({
    id: pos2Id,
    user_id: testTraderId,
    account_id: account.id,
    symbol: 'ETHUSDT',
    side: 'long',
    quantity_units: toBaseUnits(2).toString(),
    entry_price_units: toBaseUnits(3000).toString(),
    margin_units: toBaseUnits(6000).toString(),
    realized_pnl_units: '0',
    opened_at: new Date(Date.now() - 3600000).toISOString(),
    updated_at: new Date().toISOString(),
  });
  await serverPaperTrading.closePosition(testTraderId, pos2Id, 2900, 'Alex Chen');

  // Query live computed stats
  const calculated = await profileService.getProfileWithLiveStats(testTraderId);
  const s = calculated.stats;

  assert(s.totalTrades === 2, `Total trades accurately counted: ${s.totalTrades}`);
  assert(s.winningTrades === 1, `Winning trades counted: ${s.winningTrades}`);
  assert(s.losingTrades === 1, `Losing trades counted: ${s.losingTrades}`);
  assert(s.winRatePct === 50, `Win rate computed as 50%: ${s.winRatePct}%`);
  assert(s.profitFactor >= 3.5, `Profit factor computed: ${s.profitFactor}x`);
  assert(s.totalRealizedPnl > 0, `Net realized PnL is positive: $${s.totalRealizedPnl}`);
  assert(s.largestWin?.symbol === 'BTCUSDT', `Largest win symbol is BTCUSDT: ${s.largestWin?.symbol}`);
  assert(s.largestLoss?.symbol === 'ETHUSDT', `Largest drawdown symbol is ETHUSDT: ${s.largestLoss?.symbol}`);

  // Badges verification
  const pioneerBadge = calculated.badges.find((b) => b.id === 'badge_pioneer');
  const greenDayBadge = calculated.badges.find((b) => b.id === 'badge_green_day');
  assert(pioneerBadge?.isUnlocked === true, `Pioneer badge is unlocked`);
  assert(greenDayBadge?.isUnlocked === true, `First Green Trade badge is unlocked after profitable close`);

  // -------------------------------------------------------------------
  // TEST 4: PROFILE UPDATE & USERNAME VALIDATION
  // -------------------------------------------------------------------
  console.log('\n--- [TEST 4] Profile Update & Username Validation ---');
  const updated = await profileService.updateProfile(testTraderId, {
    displayName: 'Quantum Scalper Pro',
    bio: 'High-frequency momentum strategies on Binance Spot',
    tradingStyle: 'scalper',
    socials: { twitter: 'quantum_scalper', discord: 'quantum#9999' },
  });

  assert(updated.displayName === 'Quantum Scalper Pro', `Display name updated to: ${updated.displayName}`);
  assert(updated.bio.includes('High-frequency'), `Bio updated`);
  assert(updated.tradingStyle === 'scalper', `Trading style updated to scalper`);
  assert(updated.socials.twitter === 'quantum_scalper', `Twitter handle saved`);

  // Username collision check
  let collisionThrew = false;
  try {
    // Attempt to take existing @satoshisniper username
    await profileService.updateProfile(testTraderId, { username: 'satoshisniper' });
  } catch (err: any) {
    collisionThrew = true;
    assert(err.message.includes('already taken'), `Collision error caught: ${err.message}`);
  }
  assert(collisionThrew, 'Username uniqueness constraint enforced');

  // -------------------------------------------------------------------
  // TEST 5: ACCOUNT RESET (VIRTUAL FUNDING TO 10,000 USDT)
  // -------------------------------------------------------------------
  console.log('\n--- [TEST 5] Account Reset Back to 10,000 USDT ---');
  const resetProfile = await profileService.resetAccount(testTraderId);
  assert(
    resetProfile.stats.availableFunds === 10000,
    `Account reset restored balance to 10,000 USDT: $${resetProfile.stats.availableFunds}`
  );
  const { positions: postResetPositions } = await serverPaperTrading.getOrCreateAccount(testTraderId);
  assert(postResetPositions.length === 0, `All positions cleared upon reset: length=${postResetPositions.length}`);

  // -------------------------------------------------------------------
  // TEST 6: PUBLIC PROFILE PRIVACY FILTERING
  // -------------------------------------------------------------------
  console.log('\n--- [TEST 6] Public Profile Privacy Filtering (/u/[username]) ---');
  const publicSat = await profileService.getPublicProfileByUsername('satoshisniper');
  assert(!!publicSat, `Public profile returned for @satoshisniper`);
  assert(publicSat?.username === 'satoshisniper', `Username matched: ${publicSat?.username}`);

  // Test privacy: Hide balance
  await profileService.updateProfile('usr_celsius_demo', {
    privacy: { isPublicProfile: true, showBalanceUsdt: false, showOpenPositions: true, showTradeHistory: true },
  });
  const hiddenBalanceProfile = await profileService.getPublicProfileByUsername('satoshisniper');
  assert(
    hiddenBalanceProfile?.stats.currentEquity === -1,
    `USDT balance masked when showBalanceUsdt=false: equity=${hiddenBalanceProfile?.stats.currentEquity}`
  );

  // Test privacy: Fully Private Profile
  await profileService.updateProfile('usr_celsius_demo', {
    privacy: { isPublicProfile: false, showBalanceUsdt: false, showOpenPositions: false, showTradeHistory: false },
  });
  const privateProfile = await profileService.getPublicProfileByUsername('satoshisniper');
  assert(privateProfile === null, `Private profile hidden from public lookups (returns null)`);

  // Restore public status for demo
  await profileService.updateProfile('usr_celsius_demo', {
    privacy: { isPublicProfile: true, showBalanceUsdt: true, showOpenPositions: true, showTradeHistory: true },
  });

  // -------------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------------
  console.log('\n======================================================');
  console.log(`🏁 TEST COMPLETE: ${passed} PASSED | ${failed} FAILED`);
  console.log('======================================================\n');

  if (failed > 0) process.exit(1);
}

runProfileSuite().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
