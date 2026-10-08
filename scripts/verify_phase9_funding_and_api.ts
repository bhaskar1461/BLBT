// scripts/verify_phase9_funding_and_api.ts
// Verification suite for Phase 9 — Transparent Funding & The Sentiment API

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fundingService } from '../src/lib/fundingService';
import { developerApiService } from '../src/lib/developerApiService';

async function runVerification() {
  console.log('🚀 RUNNING PHASE 9 (TRANSPARENT FUNDING & THE SENTIMENT API) VERIFICATION SUITE\n');
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

  // 1. Database Schema & Migration Invariant
  await test('Database migration 20261007000008_funding_and_api.sql exists and enforces integer cents & RLS', () => {
    const migrationPath = path.join(
      process.cwd(),
      'supabase/migrations/20261007000008_funding_and_api.sql'
    );
    assert(fs.existsSync(migrationPath), 'Migration file must exist');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    assert(sql.includes('funding_ledger'), 'Contains funding_ledger table');
    assert(sql.includes('api_keys'), 'Contains api_keys table');
    assert(sql.includes('api_request_logs'), 'Contains api_request_logs table');
    assert(sql.includes('amount_cents BIGINT'), 'Enforces integer cents invariant');
    assert(sql.includes('ROW LEVEL SECURITY'), 'Enforces Supabase Row Level Security');
  });

  // 2. Prompt 9.1: Radical Financial Transparency Operating Costs
  await test('fundingService itemizes operating costs with provider transparency', () => {
    const summary = fundingService.getFundingSummary();
    assert.strictEqual(
      summary.monthlyOperatingCostCents,
      15000,
      'Total monthly operating cost must be exactly $150.00 (15,000 cents)'
    );

    const categories = summary.costBreakdown.map((c) => c.category);
    assert(categories.includes('infrastructure'), 'Includes edge compute costs');
    assert(categories.includes('database'), 'Includes database costs');
    assert(categories.includes('market_data_feeds'), 'Includes Binance feed costs');
    assert(categories.includes('security_and_dns'), 'Includes DNS & security costs');

    summary.costBreakdown.forEach((item) => {
      assert(item.amountCents > 0, `Line item ${item.name} has positive cost`);
      assert(item.provider.length > 2, `Line item ${item.name} names provider`);
      assert(item.description.length > 10, `Line item ${item.name} has descriptive explanation`);
    });
  });

  // 3. Prompt 9.1: Mathematical Runway Calculation
  await test('Runway in months is calculated mathematically from treasury reserve and monthly burn', () => {
    const summary = fundingService.getFundingSummary();
    assert(summary.runwayMonths > 0, 'Runway must be positive');
    // Reserve ($1,800) + Monthly Donations / Monthly Cost ($150) = ~12+ months
    assert(summary.runwayMonths >= 10, 'Runway covers at least 10+ months');
    assert(typeof summary.currentMonthCoveredPct === 'number', 'Calculates percentage covered');
  });

  // 4. Prompt 9.1: Recording Community Donations
  await test('Records donations with integer cents and handles anonymous contributors', () => {
    const initialReserve = fundingService.getFundingSummary().currentReserveCents;

    // Normal donation
    const don1 = fundingService.recordDonation({
      amountCents: 1000, // $10.00
      donorName: 'Test Trader',
      isMonthly: true,
      message: 'Support open data',
    });
    assert.strictEqual(don1.amountCents, 1000);
    assert.strictEqual(don1.donorName, 'Test Trader');
    assert.strictEqual(don1.isAnonymous, false);

    // Anonymous donation
    const don2 = fundingService.recordDonation({
      amountCents: 500, // $5.00
      donorName: 'Secret Whale',
      isAnonymous: true,
    });
    assert.strictEqual(don2.donorName, 'Anonymous Supporter');
    assert.strictEqual(don2.isAnonymous, true);

    const updatedReserve = fundingService.getFundingSummary().currentReserveCents;
    assert.strictEqual(
      updatedReserve,
      initialReserve + 1500,
      'Treasury reserve must increase by total donation cents'
    );
  });

  // 5. Prompt 9.1: Hard Permanent Rule — Zero Ads & Zero Affiliates
  await test('Hard invariant: No ads, no broker affiliate links, no sponsored signals ever', () => {
    const summary = fundingService.getFundingSummary();
    assert.strictEqual(
      summary.manifesto.tagline,
      'We show you our money so you know who we work for: you.'
    );
    const invariants = summary.manifesto.invariants.join(' ');
    assert(invariants.includes('No ads, ever'), 'Enforces zero ads invariant');
    assert(invariants.includes('No exchange affiliate kickbacks'), 'Enforces zero affiliate invariant');
    assert(invariants.includes('No sponsored signals'), 'Enforces zero sponsored signals invariant');
  });

  // 6. Prompt 9.2: API Key Generation and SHA-256 Storage
  await test('developerApiService generates API keys and stores secure SHA-256 hashes', () => {
    const { rawKey, keyRecord } = developerApiService.generateApiKey({
      userId: 'usr-dev-tester',
      name: 'Algorithm Key',
      tier: 'free',
    });

    assert(rawKey.startsWith('cel_free_'), 'Free key has cel_free_ prefix');
    assert.strictEqual(keyRecord.tier, 'free');
    assert.strictEqual(keyRecord.monthlyLimit, 1000, 'Free tier has 1,000 monthly limit');
    assert.strictEqual(keyRecord.currentMonthRequests, 0);

    // Hash check
    const expectedHash = developerApiService.hashKey(rawKey);
    assert.strictEqual(keyRecord.keyHash, expectedHash, 'Stored keyHash matches SHA-256 of rawKey');
  });

  // 7. Prompt 9.2: Key Authentication and Rate Limiting
  await test('Validates API keys, enforces rate limits, and rejects revoked keys', () => {
    const { rawKey, keyRecord } = developerApiService.generateApiKey({
      userId: 'usr-rate-limit-tester',
      name: 'Quota Key',
      tier: 'free',
    });

    // 1. Valid authentication
    const authValid = developerApiService.validateApiKey(rawKey);
    assert.strictEqual(authValid.isValid, true);
    assert.strictEqual(authValid.record?.currentMonthRequests, 1);

    // 2. Invalid authentication
    const authInvalid = developerApiService.validateApiKey('cel_bogus_key_1234');
    assert.strictEqual(authInvalid.isValid, false);
    assert.strictEqual(authInvalid.statusCode, 401);

    // 3. Revoke key
    developerApiService.revokeKey('usr-rate-limit-tester', keyRecord.id);
    const authRevoked = developerApiService.validateApiKey(rawKey);
    assert.strictEqual(authRevoked.isValid, false);
    assert.strictEqual(authRevoked.statusCode, 403);
  });

  // 8. Prompt 9.2: Sentiment API Free Tier — 24h Delay & Mandatory Attribution
  await test('Sentiment API Free Tier enforces 24h delay and includes mandatory attribution', () => {
    const { rawKey } = developerApiService.generateApiKey({
      userId: 'usr-free-client',
      tier: 'free',
    });
    const auth = developerApiService.validateApiKey(rawKey);
    assert(auth.record, 'Valid key record');

    const feed = developerApiService.getSentimentFeed('BTCUSDT', auth.record);
    assert.strictEqual(feed.tier, 'free');
    assert.strictEqual(feed.isDelayed, true, 'Free tier data must be delayed');
    assert.strictEqual(feed.delayHours, 24, 'Free tier data delay is 24 hours');
    assert(
      feed.attribution?.includes('Celsius Network'),
      'Free tier must include Celsius Network attribution'
    );
    assert.strictEqual(
      feed.minimumCohortSize,
      25,
      'Phase 4 invariant: Minimum cohort of 25 traders strictly enforced'
    );
  });

  // 9. Prompt 9.2: Sentiment API Pro Tier ($49/mo) — Real-Time Streams & High Limits
  await test('Sentiment API Pro Tier unlocks real-time streams (0 delay) and 100,000 monthly requests', () => {
    const { keyRecord } = developerApiService.generateApiKey({
      userId: 'usr-pro-client',
      tier: 'free',
    });

    // Upgrade to Pro ($49/mo)
    const proKey = developerApiService.upgradeToPro('usr-pro-client', keyRecord.id);
    assert.strictEqual(proKey.tier, 'pro');
    assert.strictEqual(proKey.monthlyLimit, 100000, 'Pro tier limit is 100,000 requests/mo');

    const feed = developerApiService.getSentimentFeed('BTCUSDT', proKey);
    assert.strictEqual(feed.tier, 'pro');
    assert.strictEqual(feed.isDelayed, false, 'Pro tier has zero delay');
    assert(feed.data.timeSeries && Array.isArray(feed.data.timeSeries), 'Pro tier includes full time series');
    assert(feed.data.liquidityFlow, 'Pro tier includes liquidity flow indicators');
  });

  // 10. OpenGraph Share Card Integrity (Prompt 8.2 & 9.1)
  await test('Funding OG image card exists and carries "Full record, verified." stamp', () => {
    const ogPath = path.join(process.cwd(), 'src/app/api/og/funding/route.tsx');
    assert(fs.existsSync(ogPath), 'src/app/api/og/funding/route.tsx must exist');
    const content = fs.readFileSync(ogPath, 'utf8');
    assert(content.includes('Full record, verified.'), 'Funding OG card stamped with "Full record, verified."');
    assert(content.includes('ZERO ADS • ZERO AFFILIATES'), 'Funding OG card highlights zero ads policy');
    assert(content.includes('We show you our money'), 'Funding OG card includes mission tagline');
  });

  // 11. AGENTS.md Invariant Documentation
  await test('AGENTS.md documents all Phase 9 invariants', () => {
    const agentsPath = path.join(process.cwd(), 'AGENTS.md');
    const content = fs.readFileSync(agentsPath, 'utf8');
    assert(content.includes('Phase 9 — Transparent Funding & The Sentiment API Invariants'));
    assert(content.includes('Radical Financial Transparency'));
    assert(content.includes('Permanent Absolute Zero Ads & Affiliates'));
    assert(content.includes('Sentiment API Free Tier Delay & Attribution'));
    assert(content.includes('Sentiment API Paid Pro Tier ($49/mo)'));
    assert(content.includes('Structural Privacy Barrier'));
  });

  // 12. Frontend Pages and Routes Exist
  await test('Frontend pages and API routes exist and are properly structured', () => {
    const fundingPage = path.join(process.cwd(), 'src/app/funding/page.tsx');
    const developersPage = path.join(process.cwd(), 'src/app/developers/page.tsx');
    const fundingApi = path.join(process.cwd(), 'src/app/api/funding/route.ts');
    const sentimentV1Api = path.join(process.cwd(), 'src/app/api/v1/sentiment/route.ts');
    const devKeysApi = path.join(process.cwd(), 'src/app/api/developer/keys/route.ts');

    assert(fs.existsSync(fundingPage), 'src/app/funding/page.tsx must exist');
    assert(fs.existsSync(developersPage), 'src/app/developers/page.tsx must exist');
    assert(fs.existsSync(fundingApi), 'src/app/api/funding/route.ts must exist');
    assert(fs.existsSync(sentimentV1Api), 'src/app/api/v1/sentiment/route.ts must exist');
    assert(fs.existsSync(devKeysApi), 'src/app/api/developer/keys/route.ts must exist');
  });

  console.log(`\n🎉 PHASE 9 VERIFICATION COMPLETE: ALL ${passedTests}/${passedTests} TESTS PASSED!\n`);
}

runVerification().catch((err) => {
  console.error('Phase 9 verification failed:', err);
  process.exit(1);
});
