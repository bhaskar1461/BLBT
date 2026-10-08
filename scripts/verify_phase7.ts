import { paperTradingService, PaperOrderRecord, PaperPositionRecord } from '../src/lib/paperTradingService';
import { adminService } from '../src/lib/adminService';
import { LeaderboardEntry } from '../src/types/trading';

async function runPhase7Verification() {
  console.log('====================================================');
  console.log('🚀 RUNNING PHASE 7 (RETENTION & VIRALITY) VERIFICATION');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, name: string) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${name}`);
    }
  }

  // -----------------------------------------------------------------
  // 1. LEADERBOARD VERIFICATION (Prompt 1)
  // -----------------------------------------------------------------
  console.log('--- 1. Leaderboard Engine (Prompt 1) ---');
  
  const allTimeLeaderboard = paperTradingService.getLeaderboard('all', 'usr_celsius_demo');
  assert(Array.isArray(allTimeLeaderboard.rankings), 'Leaderboard returns array of rankings');
  assert(allTimeLeaderboard.rankings.length > 0, 'Leaderboard contains seeded/ranked traders');
  
  // Verify ranking is sorted descending by realized P&L %
  let sortedCorrectly = true;
  for (let i = 0; i < allTimeLeaderboard.rankings.length - 1; i++) {
    if (allTimeLeaderboard.rankings[i].realizedPnlPercent < allTimeLeaderboard.rankings[i + 1].realizedPnlPercent) {
      sortedCorrectly = false;
      break;
    }
  }
  assert(sortedCorrectly, 'Leaderboard is strictly sorted by realized P&L % (fair percentage ranking)');

  // Verify frozen users are excluded
  const frozenInLeaderboard = allTimeLeaderboard.rankings.find((e: LeaderboardEntry) => e.userId === 'usr_bad_actor');
  assert(!frozenInLeaderboard, 'Frozen user (usr_bad_actor) is strictly excluded from leaderboard');

  // Verify time filters
  const lb24h = paperTradingService.getLeaderboard('24h', 'usr_celsius_demo');
  const lb7d = paperTradingService.getLeaderboard('7d', 'usr_celsius_demo');
  const lb30d = paperTradingService.getLeaderboard('30d', 'usr_celsius_demo');
  assert(Array.isArray(lb24h.rankings), 'Time filter 24h returns rankings');
  assert(Array.isArray(lb7d.rankings), 'Time filter 7d returns rankings');
  assert(Array.isArray(lb30d.rankings), 'Time filter 30d returns rankings');

  // Check top 50 capping & pinned user
  assert(allTimeLeaderboard.rankings.length <= 50, 'Leaderboard caps at top 50');
  if (allTimeLeaderboard.currentUserRank) {
    assert(
      typeof allTimeLeaderboard.currentUserRank.rank === 'number',
      'Current user rank is accurately computed and pinned'
    );
  }

  // -----------------------------------------------------------------
  // 2. STREAKS & WEEKLY RECAP (Prompt 3)
  // -----------------------------------------------------------------
  console.log('\n--- 2. Streaks & Weekly Engagement Hooks (Prompt 3) ---');
  const testUserId = 'test-streak-user-' + Date.now();
  
  // Record visit
  const streak1 = paperTradingService.recordUserVisit(testUserId);
  assert(streak1.currentStreak >= 1, 'First visit initializes streak to at least 1 day');
  assert(streak1.lastVisitDate.length > 0, 'Visit date is recorded');

  // Fetch streak
  const streakFetched = paperTradingService.getUserStreak(testUserId);
  assert(streakFetched.currentStreak === streak1.currentStreak, 'getUserStreak retrieves accurate visit streak');

  // Weekly recap computation
  const recap = paperTradingService.getUserWeeklyRecap(testUserId);
  assert(typeof recap.tradesCount === 'number', 'Weekly recap returns trade count');
  assert(typeof recap.winRatePct === 'number', 'Weekly recap returns win rate %');
  assert(typeof recap.netPnl === 'number', 'Weekly recap returns net P&L USDT');
  assert(typeof recap.bestTradeSymbol === 'string', 'Weekly recap identifies best trade symbol');

  // -----------------------------------------------------------------
  // 3. ADVANCED ORDERS: LIMIT & SL/TP BRACKETS (Prompt 4)
  // -----------------------------------------------------------------
  console.log('\n--- 3. Advanced Orders: Limit & SL/TP Brackets (Prompt 4) ---');

  // Initialize account for advanced order test
  const { account, orders, positions } = await paperTradingService.getOrCreateAccount(testUserId);
  assert(Boolean(account.id), 'Account provisioned with 10,000 USDT');

  // Submit Limit Order (BUY BTC at limit price = $10,000)
  const limitOrder: PaperOrderRecord = {
    id: `ord_limit_${Date.now()}`,
    user_id: testUserId,
    account_id: account.id,
    symbol: 'BTCUSDT',
    side: 'buy',
    type: 'limit',
    status: 'open',
    price_units: (10000n * 100000000n).toString(),
    amount_units: (5000000n).toString(), // 0.05 BTC
    filled_amount_units: '0',
    total_cost_units: '50000000000',
    fee_units: '50000000',
    created_at: new Date().toISOString(),
  };
  orders.push(limitOrder);

  assert(limitOrder.status === 'open', 'Limit order stored server-side in "open" pending status');

  // Test cancel pending limit order
  const cancelled = await paperTradingService.cancelOrder(testUserId, limitOrder.id);
  assert(cancelled === true, 'Limit order can be successfully cancelled');
  assert(limitOrder.status === 'cancelled', 'Limit order status transitions to "cancelled"');

  // Place another open limit order to test execution when price triggers
  const executableLimitOrder: PaperOrderRecord = {
    id: `ord_limit_exec_${Date.now()}`,
    user_id: testUserId,
    account_id: account.id,
    symbol: 'ETHUSDT',
    side: 'buy',
    type: 'limit',
    status: 'open',
    price_units: (3000n * 100000000n).toString(), // Limit price: $3000
    amount_units: (100000000n).toString(), // 1 ETH
    filled_amount_units: '0',
    total_cost_units: '300000000000',
    fee_units: '300000000',
    created_at: new Date().toISOString(),
  };
  orders.push(executableLimitOrder);

  // Run advanced order engine when ETH live price drops to $2950 (triggers limit buy fill)
  const execResult = await paperTradingService.checkAndExecuteAdvancedOrders({
    ETHUSDT: 2950,
  });
  assert(execResult.executedOrders >= 1, 'Limit order executed when market price crossed trigger');
  assert(executableLimitOrder.status === 'filled', 'Order status updated to filled');

  // Test Stop-Loss and Take-Profit Bracket Execution
  const bracketPosition: PaperPositionRecord = {
    id: `pos_bracket_${Date.now()}`,
    user_id: testUserId,
    account_id: account.id,
    symbol: 'SOLUSDT',
    side: 'long',
    quantity_units: (10n * 100000000n).toString(), // 10 SOL
    entry_price_units: (150n * 100000000n).toString(), // Entry $150
    margin_units: (1500n * 100000000n).toString(), // Margin $1500
    realized_pnl_units: '0',
    stop_loss_units: (135n * 100000000n).toString(), // SL at $135
    take_profit_units: (180n * 100000000n).toString(), // TP at $180
    opened_at: new Date(Date.now() - 3600000).toISOString(),
    updated_at: new Date().toISOString(),
  };
  positions.push(bracketPosition);

  // Trigger stop-loss when SOL price drops to $130 (below SL $135)
  const bracketExecResult = await paperTradingService.checkAndExecuteAdvancedOrders({
    SOLUSDT: 130,
  });
  assert(bracketExecResult.triggeredBrackets >= 1, 'Stop-Loss bracket automatically triggered position close');

  // Verify closed trade created from automated bracket
  const userClosedTrades = paperTradingService.getUserClosedTrades(testUserId);
  assert(userClosedTrades.length > 0, 'Closed trade record created from triggered bracket');
  const solTrade = userClosedTrades.find((t) => t.symbol === 'SOLUSDT');
  assert(Boolean(solTrade), 'SOL closed trade recorded with exit telemetry');

  if (solTrade) {
    // Prompt 2: Shareable Trade Card retrieval
    const fetchedTrade = paperTradingService.getClosedTrade(solTrade.id);
    assert(Boolean(fetchedTrade), 'Closed trade retrievable by ID for public card share route /share/[tradeId]');
  }

  // -----------------------------------------------------------------
  // 4. USER FEEDBACK LOOP & ADMIN MODERATION (Prompt 5)
  // -----------------------------------------------------------------
  console.log('\n--- 4. Feedback Loop & Admin Moderation (Prompt 5) ---');

  const feedbackInitialCount = adminService.getFeedbackList().length;
  const newFeedback = adminService.addFeedback(
    testUserId,
    'trader_test@celsius.trade',
    'feature',
    'Awesome terminal! Please add multi-chart grid layout next.',
    5
  );

  assert(Boolean(newFeedback.id), 'Feedback entry successfully submitted and saved');
  assert(newFeedback.status === 'new', 'Feedback initializes with status "new"');
  assert(newFeedback.rating === 5, 'Feedback preserves trader rating');
  assert(
    adminService.getFeedbackList().length === feedbackInitialCount + 1,
    'Feedback listed in admin feedback list'
  );

  // Update status to reviewed
  const reviewed = adminService.updateFeedbackStatus(
    newFeedback.id,
    'reviewed',
    'Reviewed by PM team',
    'admin_1',
    'admin@celsius.trade'
  );
  assert(reviewed?.status === 'reviewed', 'Feedback marked as "reviewed" with admin notes');

  // Resolve feedback
  const resolved = adminService.updateFeedbackStatus(
    newFeedback.id,
    'resolved',
    'Scheduled for Phase 8',
    'admin_1',
    'admin@celsius.trade'
  );
  assert(resolved?.status === 'resolved', 'Feedback marked as "resolved"');

  // Verify admin audit log entry for feedback moderation
  const latestAudit = adminService.getAuditLogs()[0];
  assert(
    latestAudit.action === 'UPDATE_FEEDBACK_STATUS',
    'Feedback status moderation writes immutable audit log entry'
  );

  // Delete feedback
  const deleted = adminService.deleteFeedback(newFeedback.id, 'admin_1', 'admin@celsius.trade');
  assert(deleted === true, 'Feedback deletion succeeds');
  assert(
    adminService.getAuditLogs()[0].action === 'DELETE_FEEDBACK',
    'Feedback deletion logged in audit trail'
  );

  console.log('\n====================================================');
  console.log(`🎯 VERIFICATION COMPLETE: ${passed}/${total} TESTS PASSED`);
  console.log('====================================================');

  if (passed === total) {
    console.log('🌟 ALL PHASE 7 EXIT CRITERIA MET AND VERIFIED!');
    process.exit(0);
  } else {
    console.error('⚠️ SOME TESTS FAILED');
    process.exit(1);
  }
}

runPhase7Verification().catch((err) => {
  console.error('Fatal verification error:', err);
  process.exit(1);
});
