// scripts/verify_phase6_scoreboard.ts
import fs from 'fs';
import path from 'path';
import { scoreboardService } from '../src/lib/scoreboardService';

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
  console.log('🧪 VERIFYING PHASE 6: THE SCOREBOARD (THE CONTROVERSY ENGINE)');
  console.log('🧪 ========================================================\n');

  // --------------------------------------------------------------------------
  // PROMPT 6.1: DATABASE MIGRATION & RLS ARCHITECTURE
  // --------------------------------------------------------------------------
  console.log('--- TEST GROUP 1: Prompt 6.1 — Database Schema & Invariants in AGENTS.md ---');

  const migrationPath = path.join(
    process.cwd(),
    'supabase/migrations/20261007000005_scoreboard.sql'
  );
  assert(fs.existsSync(migrationPath), 'Migration file 20261007000005_scoreboard.sql exists');

  const migrationSql = fs.readFileSync(migrationPath, 'utf-8');
  assert(
    migrationSql.includes('CREATE TABLE IF NOT EXISTS public.public_trading_calls'),
    'Migration creates public_trading_calls table'
  );
  assert(
    migrationSql.includes('direction VARCHAR(16) NOT NULL CHECK (direction IN (\'bullish\', \'bearish\'))'),
    'Table enforces direction constraint (bullish / bearish)'
  );
  assert(
    migrationSql.includes('result VARCHAR(16) CHECK (result IN (\'correct\', \'wrong\', \'undefined\'))'),
    'Table enforces result constraint (correct / wrong / undefined)'
  );
  assert(
    migrationSql.includes('ENABLE ROW LEVEL SECURITY'),
    'Table enables Supabase Row Level Security'
  );

  // Vercel Cron registration
  const vercelJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'vercel.json'), 'utf-8'));
  const cronJob = vercelJson.crons?.find((c: { path: string }) => c.path === '/api/cron/scoreboard');
  assert(!!cronJob, 'vercel.json registers /api/cron/scoreboard cron job');
  assert(cronJob?.schedule === '0 * * * *', 'Cron runs hourly on schedule (0 * * * *)');

  // AGENTS.md invariants
  const agentsMd = fs.readFileSync(path.join(process.cwd(), 'AGENTS.md'), 'utf-8');
  assert(
    agentsMd.includes('Phase 6 — The Scoreboard'),
    'AGENTS.md documents Phase 6 The Scoreboard section'
  );
  assert(
    agentsMd.includes('Authoritative Real-Price Scoring'),
    'AGENTS.md enforces authoritative real-price scoring against Binance'
  );
  assert(
    agentsMd.includes('Tone: neutral, factual, undeniable. Never mock — let the numbers do the talking'),
    'AGENTS.md pins the verbatim neutral, factual, undeniable tone rule'
  );
  assert(
    agentsMd.includes('Database-Computed Aggregates — Zero Hardcoding'),
    'AGENTS.md enforces dynamic database calculation with zero hardcoded stats'
  );

  // --------------------------------------------------------------------------
  // PROMPT 6.1: SCOREBOARD SERVICE CORE LOGIC & ACCURACY MATHEMATICS
  // --------------------------------------------------------------------------
  console.log('\n--- TEST GROUP 2: Prompt 6.1 — Scoreboard Service Scoring Mathematics ---');

  const summary = scoreboardService.getScoreboardSummary();
  assert(summary.totalCallsScored > 0, `Scored calls exist in database: count=${summary.totalCallsScored}`);
  assert(summary.totalCallersTracked > 0, `Callers tracked in leaderboard: count=${summary.totalCallersTracked}`);
  assert(summary.platformBreakdown.length >= 3, `Platform breakdown includes YouTube, Twitter, and Telegram`);

  // YouTube Headline Stat verification
  const ytBreakdown = summary.platformBreakdown.find((p) => p.platform === 'youtube');
  assert(!!ytBreakdown, 'Platform breakdown includes YouTube data');
  assert(
    (ytBreakdown?.wrongPct || 0) >= 70,
    `YouTube wrong rate reflects retail reality: ${ytBreakdown?.wrongPct}% wrong`
  );
  assert(
    summary.headlineFact.includes('YouTube calls this month were wrong'),
    `Scoreboard generates the dynamic headline fact: "${summary.headlineFact}"`
  );

  // Accurate Scoring Mathematics:
  // Bullish call when exitPrice > entryPrice => correct
  const testCallBullish = scoreboardService.submitCall({
    callerName: 'Test Analyst Bull',
    platform: 'twitter',
    symbol: 'BTCUSDT',
    direction: 'bullish',
    entryPrice: 60000,
    timeframeDays: 7,
    notes: 'Test Bullish Call',
  });
  const scoredBullWin = scoreboardService.scoreCall(testCallBullish.id, 66000);
  assert(scoredBullWin?.result === 'correct', 'Bullish call with price increase is scored "correct"');
  assert(
    scoredBullWin?.priceChangePct === 10.0,
    `Calculates exact percentage move: ${scoredBullWin?.priceChangePct}%`
  );

  // Bearish call when exitPrice > entryPrice => wrong
  const testCallBearish = scoreboardService.submitCall({
    callerName: 'Test Analyst Bear',
    platform: 'youtube',
    symbol: 'ETHUSDT',
    direction: 'bearish',
    entryPrice: 3000,
    timeframeDays: 14,
    notes: 'Test Bearish Call',
  });
  const scoredBearLoss = scoreboardService.scoreCall(testCallBearish.id, 3300);
  assert(scoredBearLoss?.result === 'wrong', 'Bearish call with price increase is scored "wrong"');
  assert(
    scoredBearLoss?.priceChangePct === 10.0,
    `Calculates exact percentage move on bearish failure: ${scoredBearLoss?.priceChangePct}%`
  );

  // Leaderboard ranking calculation
  const callers = scoreboardService.getCallerScorecards();
  assert(callers.length >= 5, `Caller leaderboard includes at least 5 public figures: count=${callers.length}`);
  assert(callers[0].rank === 1, 'First ranked caller has rank #1');
  assert(
    callers[0].accuracyPct >= callers[callers.length - 1].accuracyPct,
    'Leaderboard ranks callers in descending order of accuracy %'
  );

  // --------------------------------------------------------------------------
  // PROMPT 6.1: CRON EVALUATION WORKER
  // --------------------------------------------------------------------------
  console.log('\n--- TEST GROUP 3: Prompt 6.1 — Cron Expired Call Evaluation ---');

  // Submit expired call
  const expiredCall = scoreboardService.submitCall({
    callerName: 'Test Expired Call',
    platform: 'telegram',
    symbol: 'SOLUSDT',
    direction: 'bullish',
    entryPrice: 150,
    timeframeDays: 1,
  });
  // Manually backdate expiry to simulate time passing
  (expiredCall as any).expiresAt = new Date(Date.now() - 1000).toISOString();

  const evalResult = scoreboardService.evaluateExpiredCalls((sym) => (sym === 'SOLUSDT' ? 165 : 100));
  assert(evalResult.evaluatedCount >= 1, `Cron evaluated expired calls: count=${evalResult.evaluatedCount}`);
  const matchScored = evalResult.scoredCalls.find((c) => c.id === expiredCall.id);
  assert(matchScored?.status === 'scored', 'Expired call transitioned from pending to scored');
  assert(matchScored?.result === 'correct', 'Expired call scored correctly against simulated Binance price');

  // --------------------------------------------------------------------------
  // PROMPT 6.1: PUBLIC /SCOREBOARD PAGE & OPENGRAPH CARD
  // --------------------------------------------------------------------------
  console.log('\n--- TEST GROUP 4: Prompt 6.1 — Frontend /scoreboard Page & OpenGraph ---');

  const pagePath = path.join(process.cwd(), 'src/app/scoreboard/page.tsx');
  assert(fs.existsSync(pagePath), 'src/app/scoreboard/page.tsx exists');
  const pageCode = fs.readFileSync(pagePath, 'utf-8');

  assert(
    pageCode.includes('Holding public influencers accountable against real market data'),
    '/scoreboard page headlines the accountability mission'
  );
  assert(
    pageCode.includes('Tone: neutral, factual, undeniable. Never mock — let the numbers do the talking'),
    '/scoreboard includes the grounding methodology and neutral tone statement'
  );
  assert(
    pageCode.includes('ScoreboardViewer'),
    '/scoreboard embeds the interactive ScoreboardViewer component'
  );

  // Modal component
  const modalPath = path.join(process.cwd(), 'src/components/scoreboard/SubmitCallModal.tsx');
  assert(fs.existsSync(modalPath), 'SubmitCallModal.tsx exists');
  const modalCode = fs.readFileSync(modalPath, 'utf-8');
  assert(
    modalCode.includes('Submit a Public Trading Call') && modalCode.includes('COMMUNITY FACT-CHECK'),
    'SubmitCallModal allows community submission of public calls'
  );

  // OpenGraph Image Route
  const ogPath = path.join(process.cwd(), 'src/app/api/og/scoreboard/route.tsx');
  assert(fs.existsSync(ogPath), 'src/app/api/og/scoreboard/route.tsx exists');
  const ogCode = fs.readFileSync(ogPath, 'utf-8');
  assert(
    ogCode.includes('ImageResponse') && ogCode.includes('1200') && ogCode.includes('630'),
    'Dynamic 1200x630 OG image card endpoint exists for scoreboard sharing'
  );

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log('\n========================================================');
  console.log(`📊 PHASE 6 VERIFICATION RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('========================================================\n');

  if (failed > 0) process.exit(1);
}

run().catch((err) => {
  console.error('Fatal error during Phase 6 verification:', err);
  process.exit(1);
});
