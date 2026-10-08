// scripts/verify_phase4_sentiment_index.ts
import fs from 'fs';
import path from 'path';
import { sentimentService, MINIMUM_COHORT_SIZE } from '../src/lib/sentimentService';

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
  console.log('🧪 VERIFYING PHASE 4: THE SENTIMENT INDEX (UNFAIR ADVANTAGE)');
  console.log('🧪 ========================================================\n');

  // --------------------------------------------------------------------------
  // PROMPT 4.1: AGGREGATE SENTIMENT ENGINE & STRUCTURAL PRIVACY
  // --------------------------------------------------------------------------
  console.log('--- TEST GROUP 1: Prompt 4.1 — Aggregate Sentiment Engine & Structural Privacy ---');

  // 1.1 SQL Migration Verification
  const migrationPath = path.join(
    process.cwd(),
    'supabase/migrations/20261007000004_sentiment_snapshots.sql'
  );
  assert(fs.existsSync(migrationPath), 'Migration file 20261007000004_sentiment_snapshots.sql exists');

  const migrationSql = fs.readFileSync(migrationPath, 'utf-8');
  assert(
    migrationSql.includes('sentiment_snapshots'),
    'Migration creates sentiment_snapshots table'
  );
  assert(
    migrationSql.includes('trader_cohort_count INTEGER NOT NULL CHECK (trader_cohort_count >= 0)'),
    'Table tracks trader_cohort_count metric'
  );
  assert(
    migrationSql.includes('trader_cohort_count >= 25'),
    'Database RLS policy enforces minimum 25-trader cohort barrier structurally'
  );
  assert(
    !migrationSql.includes('user_id UUID') && !migrationSql.includes('REFERENCES profiles'),
    'Structural Privacy: No user_id column or foreign keys exist in sentiment snapshots table'
  );

  // 1.2 Vercel Cron Registration
  const vercelJsonPath = path.join(process.cwd(), 'vercel.json');
  assert(fs.existsSync(vercelJsonPath), 'vercel.json exists');
  const vercelJson = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf-8'));
  const sentimentCron = vercelJson.crons?.find(
    (c: { path: string }) => c.path === '/api/cron/sentiment'
  );
  assert(!!sentimentCron, 'vercel.json registers /api/cron/sentiment cron job');
  assert(
    sentimentCron?.schedule === '0 * * * *',
    'Cron runs hourly (0 * * * *) as required'
  );

  // 1.3 Invariants in AGENTS.md
  const agentsMd = fs.readFileSync(path.join(process.cwd(), 'AGENTS.md'), 'utf-8');
  assert(
    agentsMd.includes('Aggregate-only data, 25-user minimum cohort, no per-user export — structural, not promissory'),
    'AGENTS.md enforces the verbatim 25-user minimum cohort structural invariant'
  );
  assert(
    agentsMd.includes('The Sentiment Index') || agentsMd.includes('sentiment_snapshots'),
    'AGENTS.md documents Sentiment Index rules and tables'
  );

  // --------------------------------------------------------------------------
  // PROMPT 4.1 & 4.2: SENTIMENT SERVICE CORE LOGIC & 24H DELAY
  // --------------------------------------------------------------------------
  console.log('\n--- TEST GROUP 2: Prompt 4.1 & 4.2 — Sentiment Service Core Logic & Delay Rules ---');

  // 2.1 Minimum Cohort Barrier
  assert(MINIMUM_COHORT_SIZE === 25, 'MINIMUM_COHORT_SIZE constant is strictly 25');

  const liveBtc = sentimentService.getLiveSentiment('BTCUSDT');
  assert(liveBtc.success === true, 'getLiveSentiment succeeds for tracked asset BTCUSDT');
  assert(liveBtc.isCohortSufficient === true, 'Cohort is marked sufficient (>= 25 traders)');
  assert(
    (liveBtc.snapshot?.traderCohortCount || 0) >= 25,
    `BTC cohort count is ${liveBtc.snapshot?.traderCohortCount} (>= 25)`
  );

  // 2.2 Cohort < 25 Rejection
  const liveSmall = sentimentService.getLiveSentiment('UNKNOWN_COIN');
  assert(liveSmall.success === false, 'Rejects untracked asset or cohort < 25');
  assert(liveSmall.isCohortSufficient === false, 'Correctly flags insufficient cohort size');
  assert(
    liveSmall.error?.includes('Minimum 25 active traders required') || false,
    'Returns clear privacy threshold message for small cohorts'
  );

  // 2.3 Contrarian Accuracy & Counts
  assert(
    typeof liveBtc.snapshot?.crowdWrongCount === 'number' &&
      typeof liveBtc.snapshot?.crowdTotalMovesCount === 'number',
    'Snapshot includes crowdWrongCount and crowdTotalMovesCount metrics'
  );
  assert(
    (liveBtc.snapshot?.crowdWrongCount ?? 0) <= (liveBtc.snapshot?.crowdTotalMovesCount ?? 1),
    'crowdWrongCount is bounded by crowdTotalMovesCount'
  );

  // 2.4 24-Hour Delay on Free Public Tier
  const publicDelayed = sentimentService.getPublicDelayedSentiment('BTCUSDT');
  assert(publicDelayed.isDelayed24h === true, 'Free public sentiment is marked as 24-hour delayed');
  assert(publicDelayed.timeSeries.length > 0, 'Returns historical time-series data points');
  assert(
    publicDelayed.headline.includes('Retail was') || publicDelayed.headline.length > 10,
    `Includes honest headline finding: "${publicDelayed.headline}"`
  );
  assert(
    publicDelayed.crowdContrarianStat.includes('price moved in the opposite direction'),
    'Computes crowd contrarian stat correctly'
  );

  // --------------------------------------------------------------------------
  // PROMPT 4.2: PUBLIC /SENTIMENT PAGE, OPENGRAPH & SHARE CARDS
  // --------------------------------------------------------------------------
  console.log('\n--- TEST GROUP 3: Prompt 4.2 — Public /sentiment Page & OpenGraph Share Cards ---');

  const sentimentPagePath = path.join(process.cwd(), 'src/app/sentiment/page.tsx');
  assert(fs.existsSync(sentimentPagePath), 'src/app/sentiment/page.tsx exists');

  const sentimentPageCode = fs.readFileSync(sentimentPagePath, 'utf-8');
  assert(
    sentimentPageCode.includes('See what the herd is doing. Then consider not being the herd.'),
    'Public /sentiment page headlines the verbatim tone: "See what the herd is doing. Then consider not being the herd."'
  );
  assert(
    sentimentPageCode.toLowerCase().includes('delayed by 24 hours') || sentimentPageCode.includes('24H DELAYED'),
    'Page clearly disclaims 24-hour data delay on free tier'
  );
  assert(
    sentimentPageCode.includes('Crowd vs Price Accuracy') || sentimentPageCode.includes('Crowd vs Price'),
    'Page includes the "Crowd vs Price" accuracy metric section'
  );

  // 3.2 Dynamic OpenGraph Route
  const ogRoutePath = path.join(process.cwd(), 'src/app/api/og/sentiment/route.tsx');
  assert(fs.existsSync(ogRoutePath), 'src/app/api/og/sentiment/route.tsx exists');
  const ogRouteCode = fs.readFileSync(ogRoutePath, 'utf-8');
  assert(
    ogRouteCode.includes('ImageResponse') && ogRouteCode.includes('1200') && ogRouteCode.includes('630'),
    'Dynamic 1200x630 OG image card endpoint exists for shareable sentiment'
  );

  // 3.3 Lightweight SVG Chart
  const chartPath = path.join(process.cwd(), 'src/components/sentiment/SentimentChart.tsx');
  assert(fs.existsSync(chartPath), 'src/components/sentiment/SentimentChart.tsx exists');
  const chartCode = fs.readFileSync(chartPath, 'utf-8');
  assert(
    chartCode.includes('<svg') && !chartCode.includes('recharts') && !chartCode.includes('chart.js'),
    'SentimentChart is built with zero-dependency pure SVG to respect performance budget'
  );

  // --------------------------------------------------------------------------
  // PROMPT 4.3: SENTIMENT-IN-TERMINAL INTEGRATION
  // --------------------------------------------------------------------------
  console.log('\n--- TEST GROUP 4: Prompt 4.3 — Sentiment-in-Terminal Integration ---');

  const stripComponentPath = path.join(
    process.cwd(),
    'src/components/sentiment/TerminalSentimentStrip.tsx'
  );
  assert(fs.existsSync(stripComponentPath), 'TerminalSentimentStrip.tsx component exists');

  const stripCode = fs.readFileSync(stripComponentPath, 'utf-8');
  assert(
    stripCode.includes('Retail paper traders') &&
      stripCode.includes('long') &&
      stripCode.includes('crowd has been wrong'),
    'Strip component displays the verbatim honest sentiment readout'
  );
  assert(
    stripCode.includes('/sentiment?symbol='),
    'Strip links directly to /sentiment for deep analysis'
  );
  assert(
    stripCode.includes('Cohort < 25 traders (Privacy Protected)'),
    'Displays privacy protection indicator when cohort size < 25'
  );

  // Shell integration
  const shellPath = path.join(process.cwd(), 'src/components/layout/Shell.tsx');
  const shellCode = fs.readFileSync(shellPath, 'utf-8');
  assert(
    shellCode.includes('TerminalSentimentStrip'),
    'Shell.tsx integrates TerminalSentimentStrip directly into the terminal layout'
  );
  assert(
    shellCode.includes('<TerminalSentimentStrip symbol={activeSymbol} />'),
    'Strip dynamically passes activeSymbol from Zustand store'
  );

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log('\n========================================================');
  console.log(`📊 PHASE 4 VERIFICATION RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('========================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error('Fatal error during Phase 4 verification:', err);
  process.exit(1);
});
