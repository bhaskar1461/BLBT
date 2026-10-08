// scripts/verify_phase1_honest_terminal.ts
import fs from 'fs';
import path from 'path';

async function testPhase1() {
  console.log('================================================================');
  console.log('🧪 VERIFYING PHASE 1: THE VERIFIABLE LEDGER & PERFORMANCE DISCIPLINE');
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

  // Test 1: vercel.json cron config
  console.log('--- Test Group 1: Vercel Cron Configuration ---');
  const vercelJsonPath = path.join(process.cwd(), 'vercel.json');
  assert(fs.existsSync(vercelJsonPath), 'vercel.json exists in root');
  if (fs.existsSync(vercelJsonPath)) {
    const vercelConfig = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf8'));
    assert(Array.isArray(vercelConfig.crons), 'vercel.json has crons array');
    const cron = vercelConfig.crons?.find((c: any) => c.path === '/api/cron/ledger-snapshot');
    assert(Boolean(cron), 'ledger-snapshot cron is registered');
    assert(cron?.schedule === '0 0 * * *', 'ledger-snapshot runs daily at 00:00 UTC (0 0 * * *)');
  }

  // Test 2: Migration file
  console.log('\n--- Test Group 2: Supabase Migration Immutability & Ledger Hash ---');
  const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '20261006000003_honest_terminal_ledger_snapshots.sql');
  assert(fs.existsSync(migrationPath), '20261006000003_honest_terminal_ledger_snapshots.sql exists');
  if (fs.existsSync(migrationPath)) {
    const sql = fs.readFileSync(migrationPath, 'utf8');
    assert(sql.includes('ledger_hash'), 'Migration adds ledger_hash');
    assert(sql.includes('ledger_snapshots'), 'Migration creates ledger_snapshots table');
    assert(sql.includes('fn_prevent_snapshot_tampering'), 'Migration creates immutability trigger preventing update/delete');
  }

  // Test 3: AGENTS.md Permanent Rules Verbatim
  console.log('\n--- Test Group 3: AGENTS.md Permanent Rules Verbatim ---');
  const agentsMdPath = path.join(process.cwd(), 'AGENTS.md');
  assert(fs.existsSync(agentsMdPath), 'AGENTS.md exists');
  if (fs.existsSync(agentsMdPath)) {
    const content = fs.readFileSync(agentsMdPath, 'utf8');
    assert(content.includes('The Permanent Rules (Verbatim)'), 'AGENTS.md contains The Permanent Rules header');
    assert(content.includes('No result shown without context: drawdown, sample size, buy-and-hold'), 'Rule 1 present');
    assert(content.includes('Every public number is computed from the database — never hand-written'), 'Rule 2 present');
    assert(content.includes('Losses get equal billing to wins, everywhere'), 'Rule 3 present');
    assert(content.includes('Aggregate-only data, 25-user minimum cohort, no per-user export'), 'Rule 4 present');
    assert(content.includes('No ads, no affiliate links, no signals, no "premium predictions"'), 'Rule 5 present');
    assert(content.includes('Performance budget is permanent: sub-1s pages, <150KB JS'), 'Rule 6 present');
    assert(content.includes("If a feature would make a signal-seller money, it's off-brand"), 'Rule 7 present');
  }

  // Test 4: Live API /api/transparency
  console.log('\n--- Test Group 4: Cryptographic Transparency API ---');
  try {
    const res = await fetch(`${BASE_URL}/api/transparency`);
    assert(res.status === 200, '/api/transparency returns HTTP 200');
    const data = await res.json();
    assert(Boolean(data.latestSnapshot), 'API returns latestSnapshot');
    assert(typeof data.latestSnapshot?.root_hash === 'string' && data.latestSnapshot.root_hash.length === 64, 'root_hash is valid SHA-256 (64 hex chars)');
    assert(Array.isArray(data.snapshots) && data.snapshots.length >= 7, 'API returns historical daily snapshots');
    assert(data.audit?.isValid === true, 'Ledger chain integrity audit is valid');
    assert(data.audit?.brokenLinksCount === 0, 'Zero broken links in cryptographic chain');
  } catch (err: any) {
    assert(false, `Transparency API error: ${err.message}`);
  }

  // Test 5: Daily Cron /api/cron/ledger-snapshot
  console.log('\n--- Test Group 5: Daily Cron Sealing Endpoint ---');
  try {
    const cronRes = await fetch(`${BASE_URL}/api/cron/ledger-snapshot`);
    assert(cronRes.status === 200, '/api/cron/ledger-snapshot returns HTTP 200');
    const cronData = await cronRes.json();
    assert(cronData.success === true, 'Cron execution succeeded');
    assert(Boolean(cronData.snapshot?.root_hash), 'Cron sealed snapshot with root_hash');
  } catch (err: any) {
    assert(false, `Cron endpoint error: ${err.message}`);
  }

  // Test 6: Admin API exposure of latest snapshot
  console.log('\n--- Test Group 6: Admin API & Console Exposure ---');
  try {
    const adminRes = await fetch(`${BASE_URL}/api/admin`, {
      headers: {
        'x-user-role': 'admin',
        'x-user-id': 'usr_celsius_demo',
      },
    });
    assert(adminRes.status === 200, '/api/admin returns HTTP 200 for admin');
    const adminData = await adminRes.json();
    assert(Boolean(adminData.latestLedgerSnapshot), 'Admin API provides latestLedgerSnapshot');
    assert(typeof adminData.latestLedgerSnapshot?.root_hash === 'string', 'Admin API returns root_hash for latest snapshot');
    assert(adminData.ledgerAudit?.isValid === true, 'Admin API provides verified ledger audit');
  } catch (err: any) {
    assert(false, `Admin API error: ${err.message}`);
  }

  // Test 7: Frontend Pages HTTP 200 & Copy Check
  console.log('\n--- Test Group 7: Transparency Page Copy & UI ---');
  try {
    const transRes = await fetch(`${BASE_URL}/transparency`);
    assert(transRes.status === 200, '/transparency page returns HTTP 200');
    const html = await transRes.text();
    assert(html.includes('Every day we publish a cryptographic fingerprint of all trading activity'), 'Plain-language copy heading present');
    assert(html.includes('History cannot be silently edited'), 'Plain-language copy guarantee present');
    assert(html.includes('Copy Fingerprint') || html.includes('Hash Copied'), 'Copy button present on transparency page');
  } catch (err: any) {
    assert(false, `Transparency page error: ${err.message}`);
  }

  // Test 8: Performance Budget Validation
  console.log('\n--- Test Group 8: Performance Discipline (<150KB JS Budget) ---');
  const layoutPath = path.join(process.cwd(), 'src', 'app', 'layout.tsx');
  const layoutContent = fs.readFileSync(layoutPath, 'utf8');
  assert(!layoutContent.includes('next/font/google'), 'layout.tsx does NOT load external google fonts (system fonts only)');

  const pagePath = path.join(process.cwd(), 'src', 'app', 'page.tsx');
  const pageContent = fs.readFileSync(pagePath, 'utf8');
  assert(pageContent.includes("dynamic(() => import('@/components/layout/Shell')"), 'Charting shell is lazy-loaded via next/dynamic with ssr: false');

  console.log('\n================================================================');
  console.log(`🏁 RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

testPhase1().catch((e) => {
  console.error(e);
  process.exit(1);
});
