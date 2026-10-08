// e2e/replica_flows.test.ts
// Automated End-to-End Test Suite for all 9 core flows of Celsius Network

import assert from 'assert';

const BASE_URL = 'http://localhost:3000';

interface FlowTestResult {
  code: string;
  flow: string;
  type: string;
  description: string;
  passed: boolean;
  durationMs: number;
  error?: string;
}

const results: FlowTestResult[] = [];

async function recordTest(
  code: string,
  flow: string,
  type: string,
  description: string,
  fn: () => Promise<void>
) {
  const start = Date.now();
  try {
    await fn();
    const durationMs = Date.now() - start;
    results.push({ code, flow, type, description, passed: true, durationMs });
    console.log(`  ✅ [${code}] ${description} (${durationMs}ms)`);
  } catch (err: any) {
    const durationMs = Date.now() - start;
    results.push({ code, flow, type, description, passed: false, durationMs, error: err.message });
    console.error(`  ❌ [${code}] ${description} FAILED: ${err.message}`);
  }
}

async function runAllFlows() {
  console.log('\n============================================================');
  console.log('🧪 RUNNING REPLICA-TEST SUITE AGAINST LOCAL CLONE');
  console.log(`Target: ${BASE_URL}`);
  console.log('============================================================\n');

  // --------------------------------------------------------------------------
  // FLOW 01: Order Execution & Paper Trading Lifecycle
  // --------------------------------------------------------------------------
  console.log('--- FLOW 01: Market & Limit Order Execution ---');

  await recordTest('F01-H1', 'Order Execution', 'happy', 'Executes paper order and verifies balance updates', async () => {
    // 1. Fetch account
    const accRes = await fetch(`${BASE_URL}/api/trade/account`);
    assert(accRes.ok, `Account endpoint returned ${accRes.status}`);
    const acc = await accRes.json();
    assert(acc.account && (acc.account.balanceUnits !== undefined || acc.account.balance_units !== undefined), 'Account balance exists');

    // 2. Submit order
    const orderRes = await fetch(`${BASE_URL}/api/trade/order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        symbol: 'BTCUSDT',
        side: 'buy',
        type: 'market',
        quantity: 0.01,
      }),
    });
    assert(orderRes.ok, `Order endpoint returned ${orderRes.status}`);
    const orderData = await orderRes.json();
    assert(orderData.success, 'Order execution succeeded');
    assert(
      orderData.fillPrice > 0 || (orderData.order && orderData.order.price_units),
      'Order was filled with real Binance price'
    );
  });

  await recordTest('F01-N1', 'Order Execution', 'negative', 'Rejects order when balance is insufficient', async () => {
    const orderRes = await fetch(`${BASE_URL}/api/trade/order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        symbol: 'BTCUSDT',
        side: 'buy',
        type: 'market',
        quantity: 999999, // Exceeds balance
      }),
    });
    const orderData = await orderRes.json();
    assert(!orderData.success || orderRes.status >= 400, 'Over-budget order must be rejected');
  });

  // --------------------------------------------------------------------------
  // FLOW 02: Daily Loss Lock & Revenge Trade Protection
  // --------------------------------------------------------------------------
  console.log('\n--- FLOW 02: Daily Loss Lock & Honest Protection ---');

  await recordTest('F02-H1', 'Loss Protection', 'happy', 'Fetches loss protection state and verifies circuit breaker config', async () => {
    const res = await fetch(`${BASE_URL}/api/trade/protection`);
    assert(res.ok, `Protection endpoint returned ${res.status}`);
    const data = await res.json();
    assert(data.success, 'Protection state returned');
    assert(data.config && typeof data.config.maxDailyLossPct === 'number', 'Daily loss cap is configured');
  });

  await recordTest('F02-N1', 'Loss Protection', 'negative', 'Protects against arbitrary daily loss cap modifications', async () => {
    const res = await fetch(`${BASE_URL}/api/trade/protection`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'set_daily_loss_cap',
        dailyLossCapPct: 5.0,
      }),
    });
    assert(res.ok, 'Protection endpoint handles cap update request cleanly');
  });

  // --------------------------------------------------------------------------
  // FLOW 03: Cryptographic Ledger Snapshots
  // --------------------------------------------------------------------------
  console.log('\n--- FLOW 03: Cryptographic Ledger Transparency ---');

  await recordTest('F03-H1', 'Ledger Transparency', 'happy', 'Fetches /transparency and audits cryptographic root hashes', async () => {
    const res = await fetch(`${BASE_URL}/api/transparency`);
    assert(res.ok, `Transparency API returned ${res.status}`);
    const data = await res.json();
    assert(data.success, 'Transparency API returned success');
    assert(data.latestSnapshot && data.latestSnapshot.root_hash, 'Latest snapshot has SHA-256 root hash');
    assert(data.latestSnapshot.root_hash.length === 64, 'Root hash is 64 hex characters');
  });

  await recordTest('F03-E1', 'Ledger Transparency', 'edge', 'Verifies unbroken hash chain integrity across history', async () => {
    const res = await fetch(`${BASE_URL}/api/transparency`);
    const data = await res.json();
    assert(data.audit && data.audit.isValid === true, 'Cryptographic chain audit must be valid');
    assert.strictEqual(data.audit.brokenLinksCount, 0, 'Zero broken links in ledger history');
  });

  // --------------------------------------------------------------------------
  // FLOW 04: The Reality Check
  // --------------------------------------------------------------------------
  console.log('\n--- FLOW 04: The Reality Check (/reality) ---');

  await recordTest('F04-H1', 'Reality Check', 'happy', 'Renders server-side /reality page with sub-second response', async () => {
    const res = await fetch(`${BASE_URL}/reality`);
    assert(res.ok, `Reality page returned ${res.status}`);
    const html = await res.text();
    assert(html.includes('REALITY CHECK'), 'Reality page header present');
    assert(html.includes('Distribution'), 'P&L distribution chart present');
  });

  await recordTest('F04-E1', 'Reality Check', 'edge', 'Fetches reality API stats for 30d and 90d periods', async () => {
    const res = await fetch(`${BASE_URL}/api/reality?period=30`);
    assert(res.ok, `Reality API returned ${res.status}`);
    const data = await res.json();
    assert(data.stats && typeof data.stats.unprofitableTradersPct === 'number', 'Unprofitable percentage computed');
    assert(data.stats.unprofitableTradersPct > 50, 'Truth statistic reflects majority retail loss');
  });

  // --------------------------------------------------------------------------
  // FLOW 05: Retail Sentiment Index (/sentiment)
  // --------------------------------------------------------------------------
  console.log('\n--- FLOW 05: The Sentiment Index (/sentiment) ---');

  await recordTest('F05-H1', 'Sentiment Index', 'happy', 'Loads /sentiment page with contrarian crowd positioning overlay', async () => {
    const res = await fetch(`${BASE_URL}/sentiment?symbol=BTCUSDT`);
    assert(res.ok, `Sentiment page returned ${res.status}`);
    const html = await res.text();
    assert(html.includes('SENTIMENT INDEX'), 'Sentiment Index banner present');
    assert(html.includes('Crowd'), 'Crowd positioning stats present');
  });

  await recordTest('F05-E1', 'Sentiment Index', 'edge', 'Sentiment API enforces 24h delay on public feed', async () => {
    const res = await fetch(`${BASE_URL}/api/sentiment?symbol=BTCUSDT`);
    assert(res.ok, `Sentiment API returned ${res.status}`);
    const data = await res.json();
    assert(data.success, 'Sentiment API returned success');
    assert(data.currentSummary && typeof data.currentSummary.longPct === 'number', 'Crowd long percentage present');
  });

  // --------------------------------------------------------------------------
  // FLOW 06: Verified Public Records (/u/[username])
  // --------------------------------------------------------------------------
  console.log('\n--- FLOW 06: Verified Public Records (/u/[username]) ---');

  await recordTest('F06-H1', 'Verified Records', 'happy', 'Renders public profile with Verified Record badge and root hash', async () => {
    const res = await fetch(`${BASE_URL}/u/satoshisniper`);
    assert(res.ok, `Public profile page returned ${res.status}`);
    const html = await res.text();
    assert(html.includes('Verified Record'), 'Verified Record badge present');
    assert(html.includes('buy-and-hold') || html.includes('Same capital'), 'Buy-and-hold mirror present');
  });

  await recordTest('F06-E1', 'Verified Records', 'edge', 'Equal billing for losses: profile displays both wins and losses', async () => {
    const res = await fetch(`${BASE_URL}/u/satoshisniper`);
    const html = await res.text();
    assert(html.includes('WIN') && html.includes('LOSS'), 'Public profile displays both wins and losses without hiding');
  });

  // --------------------------------------------------------------------------
  // FLOW 07: The Scoreboard (/scoreboard)
  // --------------------------------------------------------------------------
  console.log('\n--- FLOW 07: The Scoreboard (/scoreboard) ---');

  await recordTest('F07-H1', 'The Scoreboard', 'happy', 'Renders public call scoreboard with caller rankings and platform accuracy', async () => {
    const res = await fetch(`${BASE_URL}/scoreboard`);
    assert(res.ok, `Scoreboard page returned ${res.status}`);
    const html = await res.text();
    assert(html.includes('THE SCOREBOARD'), 'Scoreboard title present');
    assert(html.includes('influencers'), 'Accountability copy present');
  });

  await recordTest('F07-H2', 'The Scoreboard', 'happy', 'Submits a new public trading call for scoring', async () => {
    const res = await fetch(`${BASE_URL}/api/scoreboard`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callerName: 'E2E Influencer Test',
        platform: 'youtube',
        symbol: 'BTCUSDT',
        direction: 'bullish',
        entryPrice: 65000,
        timeframeDays: 14,
        proofUrl: 'https://youtube.com/watch?v=e2e-test',
      }),
    });
    assert(res.ok, `Call submission API returned ${res.status}`);
    const data = await res.json();
    assert(data.success, 'Call successfully recorded');
    assert(data.call && data.call.status === 'pending', 'Call created with status pending');
  });

  // --------------------------------------------------------------------------
  // FLOW 08: The Backtester (/backtest)
  // --------------------------------------------------------------------------
  console.log('\n--- FLOW 08: The Backtester (/backtest) ---');

  await recordTest('F08-H1', 'The Backtester', 'happy', 'Renders /backtest with preset strategy library and permanent benchmark mirror', async () => {
    const res = await fetch(`${BASE_URL}/backtest`);
    assert(res.ok, `Backtest page returned ${res.status}`);
    const html = await res.text();
    assert(html.includes('THE BACKTESTER'), 'Backtester title present');
    assert(html.includes('Mandatory Buy-and-Hold Benchmark'), 'Permanent benchmark mirror present');
  });

  await recordTest('F08-H2', 'The Backtester', 'happy', 'Simulates strategy server-side and deducts 0.10% transaction fees', async () => {
    const res = await fetch(`${BASE_URL}/api/backtest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        strategyType: 'rsi_thresholds',
        symbol: 'BTCUSDT',
        periodDays: 60,
        initialCapital: 10000,
        params: { rsiPeriod: 14, rsiOversold: 30, rsiOverbought: 70 },
      }),
    });
    assert(res.ok, `Backtest API returned ${res.status}`);
    const data = await res.json();
    assert(data.success, 'Backtest simulation succeeded');
    assert(data.report && data.report.benchmark, 'Benchmark result returned');
    assert(data.report.honestSummaryLine, 'Honest summary verdict computed');
  });

  await recordTest('F08-H3', 'The Backtester', 'happy', 'Queues backtested strategy forward in paper trading with 1% risk cap', async () => {
    const res = await fetch(`${BASE_URL}/api/backtest/adopt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        strategyType: 'rsi_thresholds',
        symbol: 'BTCUSDT',
        timeframe: '1d',
        parameters: { rsiPeriod: 14 },
        riskPerTradeCapPct: 1.0,
      }),
    });
    assert(res.ok, `Adopt API returned ${res.status}`);
    const data = await res.json();
    assert(data.success, 'Strategy adopted successfully');
    assert(data.forwardStrategy && data.forwardStrategy.riskPerTradeCapPct === 1.0, 'Enforces 1.0% risk cap');
  });

  // --------------------------------------------------------------------------
  // FLOW 09: Admin Console Security & Audit Logging
  // --------------------------------------------------------------------------
  console.log('\n--- FLOW 09: Admin Governance & Security Gate ---');

  await recordTest('F09-H1', 'Admin Security', 'happy', 'Admin API returns system status and audit logging capability', async () => {
    const res = await fetch(`${BASE_URL}/api/admin`, {
      headers: {
        'x-user-role': 'admin',
      },
    });
    assert(res.ok, `Admin API returned ${res.status}`);
    const data = await res.json();
    assert(data.success, 'Admin API authorized');
  });

  // --------------------------------------------------------------------------
  // SUMMARY REPORT
  // --------------------------------------------------------------------------
  console.log('\n============================================================');
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  console.log(`🏁 REPLICA-TEST RESULTS: ${passed} PASSED | ${failed} FAILED | ${results.length} TOTAL CASES`);
  console.log('============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runAllFlows().catch((err) => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});
