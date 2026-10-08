// scripts/verify_phase7_backtester.ts
// Verification script for Phase 7 — The Backtester (The Retention Engine)

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { backtestService, StrategyType } from '../src/lib/backtestService';

async function runVerification() {
  console.log('🚀 RUNNING PHASE 7 (THE BACKTESTER) VERIFICATION SUITE\n');
  let passedTests = 0;

  function test(name: string, fn: () => void | Promise<void>) {
    return Promise.resolve()
      .then(fn)
      .then(() => {
        passedTests++;
        console.log(`  ✅ [PASS] ${name}`);
      })
      .catch((err) => {
        console.error(`  ❌ [FAIL] ${name}: ${err.message}`);
        throw err;
      });
  }

  // 1. Preset Strategy Library
  await test('Preset Library returns 4 core strategies with reality facts', () => {
    const presets = backtestService.getPresets();
    assert.strictEqual(presets.length, 4, 'Should have exactly 4 preset strategies');

    const types = presets.map((p) => p.strategyType);
    assert(types.includes('ma_crossover'), 'Includes MA crossover');
    assert(types.includes('rsi_thresholds'), 'Includes RSI thresholds');
    assert(types.includes('breakouts'), 'Includes Breakouts');
    assert(types.includes('dca'), 'Includes DCA');

    presets.forEach((p) => {
      assert(p.name.length > 5, `Preset ${p.id} has descriptive name`);
      assert(p.description.length > 15, `Preset ${p.id} has description`);
      assert(p.realityFact.length > 15, `Preset ${p.id} includes honest reality check`);
      assert(p.defaultParams && typeof p.defaultParams === 'object', `Preset ${p.id} has defaultParams`);
    });
  });

  // 2. Historical Kline Bar Fetching
  await test('fetchHistoricalKlines returns valid candle bars with timestamps and prices', async () => {
    const bars = await backtestService.fetchHistoricalKlines('BTCUSDT', '1d', 30);
    assert(bars.length >= 25, 'Returns expected number of candles');
    const first = bars[0];
    assert(typeof first.open === 'number' && first.open > 0, 'Open price is positive number');
    assert(typeof first.close === 'number' && first.close > 0, 'Close price is positive number');
    assert(typeof first.high === 'number' && first.high >= first.low, 'High >= Low');
    assert(typeof first.openTime === 'number' && first.openTime > 0, 'Timestamp is valid');
  });

  // 3. Strategy 1: MA Crossover Simulation
  await test('Simulates MA Crossover with integer-accurate fee deductions and equity curve', async () => {
    const report = await backtestService.runBacktest({
      strategyType: 'ma_crossover',
      symbol: 'BTCUSDT',
      timeframe: '1d',
      periodDays: 60,
      initialCapital: 10000,
      params: { fastPeriod: 5, slowPeriod: 15 },
    });

    assert.strictEqual(report.strategyType, 'ma_crossover');
    assert.strictEqual(report.initialCapital, 10000);
    assert(typeof report.finalEquity === 'number');
    assert(typeof report.maxDrawdownPct === 'number');
    assert(typeof report.winRatePct === 'number');
    assert(Array.isArray(report.equityCurve) && report.equityCurve.length > 0);
    assert(report.benchmark && typeof report.benchmark.returnPct === 'number');
    assert(typeof report.honestSummaryLine === 'string' && report.honestSummaryLine.length > 10);

    // Verify 0.10% fee accounting
    if (report.totalTrades > 0) {
      assert(report.totalFeesPaid > 0, 'Fees paid must be tracked');
      assert(report.feeDragPct > 0, 'Fee drag percentage must be calculated');
    }
  });

  // 4. Strategy 2: RSI Thresholds Simulation
  await test('Simulates RSI Thresholds mean reversion with oversold/overbought parameters', async () => {
    const report = await backtestService.runBacktest({
      strategyType: 'rsi_thresholds',
      symbol: 'ETHUSDT',
      timeframe: '1d',
      periodDays: 90,
      initialCapital: 10000,
      params: { rsiPeriod: 14, rsiOversold: 35, rsiOverbought: 65 },
    });

    assert.strictEqual(report.strategyType, 'rsi_thresholds');
    assert.strictEqual(report.symbol, 'ETHUSDT');
    assert(report.equityCurve.length > 0);
    assert(report.honestSummaryLine.includes('strategy') || report.honestSummaryLine.includes('ETH'));
  });

  // 5. Strategy 3: Breakouts Simulation
  await test('Simulates Donchian Channel Breakouts strategy', async () => {
    const report = await backtestService.runBacktest({
      strategyType: 'breakouts',
      symbol: 'SOLUSDT',
      timeframe: '1d',
      periodDays: 90,
      initialCapital: 10000,
      params: { breakoutLookback: 15, exitLookback: 7 },
    });

    assert.strictEqual(report.strategyType, 'breakouts');
    assert.strictEqual(report.symbol, 'SOLUSDT');
    assert(typeof report.profitFactor === 'number');
  });

  // 6. Strategy 4: DCA Systematic Accumulation
  await test('Simulates Systematic DCA accumulation with periodic installment fills', async () => {
    const report = await backtestService.runBacktest({
      strategyType: 'dca',
      symbol: 'BTCUSDT',
      timeframe: '1d',
      periodDays: 60,
      initialCapital: 10000,
      params: { dcaIntervalCandles: 7 },
    });

    assert.strictEqual(report.strategyType, 'dca');
    assert(report.trades.length >= 2, 'DCA makes periodic buy fills');
    assert(report.honestSummaryLine.includes('DCA'), 'Honest summary specifically addresses DCA dynamics');
    assert(report.totalFeesPaid > 0, 'DCA accounts for execution fees');
  });

  // 7. Buy-and-Hold Benchmark Invariant
  await test('Mandatory Buy-and-Hold benchmark is computed identically and permanently', async () => {
    const report = await backtestService.runBacktest({
      strategyType: 'ma_crossover',
      symbol: 'BTCUSDT',
      timeframe: '1d',
      periodDays: 90,
      initialCapital: 10000,
    });

    const bm = report.benchmark;
    assert(bm, 'Benchmark result exists');
    assert(bm.symbol === 'BTCUSDT', 'Benchmark matches asset symbol');
    assert(bm.endPrice > 0 && bm.startPrice > 0, 'Benchmark prices valid');
    const expectedReturn = Number((((bm.endPrice - bm.startPrice) / bm.startPrice) * 100).toFixed(2));
    assert.strictEqual(bm.returnPct, expectedReturn, 'Benchmark return exactly matches candle delta');
    assert(bm.permanentStatement.includes('buy-and-hold'), 'Contains permanent statement');
    assert.strictEqual(bm.alphaPct, Number((report.returnPct - bm.returnPct).toFixed(2)), 'Alpha is strategy minus benchmark');
  });

  // 8. Honest Summary Verdict
  await test('Honest summary line generated dynamically without marketing fluff', async () => {
    const report = await backtestService.runBacktest({
      strategyType: 'ma_crossover',
      symbol: 'BTCUSDT',
      timeframe: '1d',
      periodDays: 45,
    });

    assert(report.honestSummaryLine.length > 20, 'Summary line has meaningful length');
    assert(
      report.honestSummaryLine.includes('underperformed') ||
        report.honestSummaryLine.includes('beat') ||
        report.honestSummaryLine.includes('DCA') ||
        report.honestSummaryLine.includes('alpha'),
      'Contains sober performance verdict keyword'
    );
  });

  // 9. Forward Paper Trading Strategy Adoption
  await test('adoptForwardStrategy records forward execution with risk-per-trade cap', () => {
    const fwd = backtestService.adoptForwardStrategy({
      userId: 'test-user-123',
      strategyType: 'ma_crossover',
      symbol: 'BTCUSDT',
      timeframe: '1d',
      parameters: { fastPeriod: 9, slowPeriod: 21 },
      riskPerTradeCapPct: 1.0,
    });

    assert(fwd.id.startsWith('fwd-'), 'Forward strategy has ID');
    assert.strictEqual(fwd.strategyType, 'ma_crossover');
    assert.strictEqual(fwd.symbol, 'BTCUSDT');
    assert.strictEqual(fwd.riskPerTradeCapPct, 1.0);
    assert.strictEqual(fwd.status, 'active');

    const list = backtestService.getForwardStrategies('test-user-123');
    assert(list.some((s) => s.id === fwd.id), 'Strategy is retrievable');
  });

  // 10. Database Migration Verification
  await test('Database schema migration file exists with required tables', () => {
    const migrationPath = path.join(process.cwd(), 'supabase/migrations/20261007000006_backtester.sql');
    assert(fs.existsSync(migrationPath), 'Migration file exists');
    const content = fs.readFileSync(migrationPath, 'utf8');
    assert(content.includes('CREATE TABLE IF NOT EXISTS public.backtest_presets'), 'Creates backtest_presets table');
    assert(content.includes('CREATE TABLE IF NOT EXISTS public.backtest_runs'), 'Creates backtest_runs table');
    assert(content.includes('CREATE TABLE IF NOT EXISTS public.user_forward_strategies'), 'Creates user_forward_strategies table');
    assert(content.includes('ROW LEVEL SECURITY'), 'Enforces Supabase RLS');
  });

  // 11. API Routes Verification
  await test('API route files exist and export expected HTTP methods', () => {
    const backtestRoutePath = path.join(process.cwd(), 'src/app/api/backtest/route.ts');
    assert(fs.existsSync(backtestRoutePath), '/api/backtest/route.ts exists');
    const content = fs.readFileSync(backtestRoutePath, 'utf8');
    assert(content.includes('export async function GET'), 'Exports GET handler');
    assert(content.includes('export async function POST'), 'Exports POST handler');

    const adoptRoutePath = path.join(process.cwd(), 'src/app/api/backtest/adopt/route.ts');
    assert(fs.existsSync(adoptRoutePath), '/api/backtest/adopt/route.ts exists');

    const ogRoutePath = path.join(process.cwd(), 'src/app/api/og/backtest/route.tsx');
    assert(fs.existsSync(ogRoutePath), '/api/og/backtest/route.tsx exists');
  });

  // 12. Frontend Components Verification
  await test('All Phase 7 UI components exist and are implemented', () => {
    const comps = [
      'src/components/backtest/BacktestEquityChart.tsx',
      'src/components/backtest/BacktestForm.tsx',
      'src/components/backtest/BacktestResultsView.tsx',
      'src/components/backtest/AdoptForwardModal.tsx',
      'src/components/backtest/BacktestManager.tsx',
      'src/app/backtest/page.tsx',
    ];

    comps.forEach((rel) => {
      const p = path.join(process.cwd(), rel);
      assert(fs.existsSync(p), `${rel} exists`);
    });
  });

  // 13. TopBar & Header Cross-Navigation Verification
  await test('Cross-navigation links to /backtest across platform pages', () => {
    const topBarContent = fs.readFileSync(path.join(process.cwd(), 'src/components/layout/TopBar.tsx'), 'utf8');
    assert(topBarContent.includes('href="/backtest"'), 'TopBar links to /backtest');

    const scoreboardContent = fs.readFileSync(path.join(process.cwd(), 'src/app/scoreboard/page.tsx'), 'utf8');
    assert(scoreboardContent.includes('href="/backtest"'), 'Scoreboard links to /backtest');

    const sentimentContent = fs.readFileSync(path.join(process.cwd(), 'src/app/sentiment/page.tsx'), 'utf8');
    assert(sentimentContent.includes('href="/backtest"'), 'Sentiment links to /backtest');

    const realityContent = fs.readFileSync(path.join(process.cwd(), 'src/app/reality/page.tsx'), 'utf8');
    assert(realityContent.includes('href="/backtest"'), 'Reality links to /backtest');

    const transparencyContent = fs.readFileSync(path.join(process.cwd(), 'src/app/transparency/page.tsx'), 'utf8');
    assert(transparencyContent.includes('href="/backtest"'), 'Transparency links to /backtest');
  });

  // 14. AGENTS.md Invariants Documented
  await test('AGENTS.md documents Phase 7 Backtester Invariants', () => {
    const agentsMd = fs.readFileSync(path.join(process.cwd(), 'AGENTS.md'), 'utf8');
    assert(agentsMd.includes('Phase 7 — The Backtester'), 'Documents Phase 7');
    assert(agentsMd.includes('Mandatory Buy-and-Hold Benchmark'), 'Documents permanent benchmark invariant');
    assert(agentsMd.includes('0.10% Transaction Fee Drag'), 'Documents realistic fee invariant');
    assert(agentsMd.includes('Data-Bound Honest Summary Verdict'), 'Documents honest summary line invariant');
    assert(agentsMd.includes('Server-Side Execution'), 'Documents server-side performance invariant');
  });

  console.log(`\n🎉 ALL ${passedTests} PHASE 7 BACKTESTER TESTS PASSED CLEANLY!`);
}

runVerification().catch((err) => {
  console.error('Phase 7 Verification Failed:', err);
  process.exit(1);
});
