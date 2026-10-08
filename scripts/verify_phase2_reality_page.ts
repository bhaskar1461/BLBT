// scripts/verify_phase2_reality_page.ts
import fs from 'fs';
import path from 'path';

async function testPhase2() {
  console.log('================================================================');
  console.log('🧪 VERIFYING PHASE 2: THE REALITY PAGE (PUBLIC TRUTH STATISTICS)');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, desc: string) {
    if (condition) {
      console.log(`  ✅ [PASS] ${desc}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${desc}`);
      failed++;
    }
  }

  const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

  // Test 1: AGENTS.md Honesty Rule
  console.log('--- Test Group 1: AGENTS.md Honesty Rule ---');
  const agentsMdPath = path.join(process.cwd(), 'AGENTS.md');
  assert(fs.existsSync(agentsMdPath), 'AGENTS.md exists');
  if (fs.existsSync(agentsMdPath)) {
    const content = fs.readFileSync(agentsMdPath, 'utf8');
    assert(
      content.includes('Every number on /reality must be computed from the database at render time — no hand-written stats, ever.'),
      'AGENTS.md contains Phase 2 honesty rule verbatim'
    );
    assert(
      content.includes('Everyone shows you their wins. We show you everything.'),
      'AGENTS.md contains Phase 2 tone directive'
    );
  }

  // Test 2: Vercel Cron Configuration
  console.log('\n--- Test Group 2: Vercel Cron Configuration ---');
  const vercelJsonPath = path.join(process.cwd(), 'vercel.json');
  assert(fs.existsSync(vercelJsonPath), 'vercel.json exists');
  if (fs.existsSync(vercelJsonPath)) {
    const vercelConfig = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf8'));
    const cron = vercelConfig.crons?.find((c: any) => c.path === '/api/cron/reality-stats');
    assert(Boolean(cron), 'reality-stats cron is configured in vercel.json');
    assert(cron?.schedule === '0 0 * * *', 'reality-stats cron runs daily at 00:00 UTC (0 0 * * *)');
  }

  // Test 3: Daily Cron Endpoint /api/cron/reality-stats
  console.log('\n--- Test Group 3: Reality Stats Daily Cron Endpoint ---');
  try {
    const cronRes = await fetch(`${BASE_URL}/api/cron/reality-stats`);
    assert(cronRes.status === 200, '/api/cron/reality-stats returns HTTP 200');
    const cronData = await cronRes.json();
    assert(cronData.success === true, 'Cron execution succeeded');
    assert(Array.isArray(cronData.cachedPeriods) && cronData.cachedPeriods.includes(30) && cronData.cachedPeriods.includes(90), 'Cron cached both 30d and 90d periods');
    assert(typeof cronData.sample30?.profitablePct === 'number', 'Sample 30d computed profitable %');
    assert(typeof cronData.sample30?.medianPnl === 'number', 'Sample 30d computed median PnL');
    assert(typeof cronData.sample30?.averagePnl === 'number', 'Sample 30d computed average PnL');
  } catch (err: any) {
    assert(false, `Reality cron endpoint error: ${err.message}`);
  }

  // Test 4: Reality API Endpoint /api/reality
  console.log('\n--- Test Group 4: Reality Stats API Endpoint ---');
  try {
    const apiRes = await fetch(`${BASE_URL}/api/reality?period=30`);
    assert(apiRes.status === 200, '/api/reality returns HTTP 200');
    const apiData = await apiRes.json();
    const stats = apiData.stats;
    assert(Boolean(stats), 'API returns stats object');
    assert(stats.profitableTradersPct === 21.8, 'Profitable traders % matches truth data: 21.8%');
    assert(stats.unprofitableTradersPct === 78.2, 'Unprofitable traders % matches truth data: 78.2%');
    assert(stats.medianPnlUsdt === -342.5, 'Median PnL is computed: -$342.50');
    assert(stats.averagePnlUsdt === -512.4, 'Average PnL is computed: -$512.40');
    assert(stats.buyAndHoldOutperformedPct === 83.6, 'Buy-and-hold outperformed active trading: 83.6%');
    assert(Array.isArray(stats.topAssetsVsPerformance) && stats.topAssetsVsPerformance.length === 3, 'Top 3 most-traded assets vs performance present');
    assert(stats.topAssetsVsPerformance[0].symbol === 'BTCUSDT', 'Asset 1 is BTCUSDT');
    assert(stats.topAssetsVsPerformance[1].symbol === 'ETHUSDT', 'Asset 2 is ETHUSDT');
    assert(stats.topAssetsVsPerformance[2].symbol === 'SOLUSDT', 'Asset 3 is SOLUSDT');
    assert(Array.isArray(stats.pnlDistribution) && stats.pnlDistribution.length === 6, 'P&L distribution curve has 6 buckets');
  } catch (err: any) {
    assert(false, `Reality API error: ${err.message}`);
  }

  // Test 5: Server-Rendered /reality Page (Sub-second load & copy check)
  console.log('\n--- Test Group 5: Server-Rendered /reality Page ---');
  try {
    const startTime = Date.now();
    const pageRes = await fetch(`${BASE_URL}/reality`);
    const elapsed = Date.now() - startTime;
    assert(pageRes.status === 200, '/reality returns HTTP 200');
    assert(elapsed < 1000, `/reality loads in under 1 second (${elapsed}ms)`);

    const html = await pageRes.text();
    assert(html.includes('Everyone shows you their wins.'), 'Headline copy part 1 present');
    assert(html.includes('We show you everything.'), 'Headline copy part 2 present');
    assert(html.includes('78.2%'), 'Unprofitable trader percentage rendered in HTML');
    assert(html.includes('21.8%'), 'Profitable trader percentage rendered in HTML');
    assert(html.includes('-$342'), 'Median loss rendered in HTML');
    assert(html.includes('-$512'), 'Average loss rendered in HTML');
    assert(html.includes('Top 3 Most-Traded Assets vs. Actual Performance'), 'Top assets comparison header present');
    assert(html.includes('Bitcoin') && html.includes('BTCUSDT'), 'Bitcoin comparison rendered');
    assert(html.includes('Ethereum') && html.includes('ETHUSDT'), 'Ethereum comparison rendered');
    assert(html.includes('Solana') && html.includes('SOLUSDT'), 'Solana comparison rendered');
    assert(html.includes('P&amp;L Distribution Curve') || html.includes('P&L Distribution Curve'), 'P&L distribution curve rendered');
    assert(html.includes('Revenge Trading After Loss'), 'Most common losing behavior rendered');
    assert(html.includes('Last 30 Days') && html.includes('Last 90 Days'), '30d / 90d switcher links rendered');
    assert(html.includes('Share Reality'), 'Share Reality button rendered');
  } catch (err: any) {
    assert(false, `Reality page error: ${err.message}`);
  }

  // Test 6: OpenGraph Image Route /api/og/reality
  console.log('\n--- Test Group 6: Social Share OpenGraph Card ---');
  try {
    const ogRes = await fetch(`${BASE_URL}/api/og/reality?period=30`);
    assert(ogRes.status === 200, '/api/og/reality returns HTTP 200');
    assert(ogRes.headers.get('content-type')?.includes('image/png') ?? false, 'OG card returns image/png content type');
  } catch (err: any) {
    assert(false, `OG card error: ${err.message}`);
  }

  console.log('\n================================================================');
  console.log(`🏁 RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

testPhase2().catch((e) => {
  console.error(e);
  process.exit(1);
});
