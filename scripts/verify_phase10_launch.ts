// scripts/verify_phase10_launch.ts
// Verification suite for Phase 10 — Launch the Story 🚀

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { scoreboardService } from '../src/lib/scoreboardService';
import { profileService } from '../src/lib/profileService';
import { adminService } from '../src/lib/adminService';

async function runVerification() {
  console.log('🚀 RUNNING PHASE 10 (LAUNCH THE STORY) VERIFICATION SUITE\n');
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

  // 1. Landing Hero & Brand Positioning Invariant
  await test('Landing hero and subtitle match the mission verbatim', () => {
    const bannerPath = path.join(
      process.cwd(),
      'src/components/layout/LandingHeroBanner.tsx'
    );
    assert(fs.existsSync(bannerPath), 'LandingHeroBanner.tsx must exist');
    const content = fs.readFileSync(bannerPath, 'utf8');

    assert(
      content.includes('The only trading platform that profits from you not losing money.'),
      'Landing hero must state: "The only trading platform that profits from you not losing money."'
    );
    assert(
      content.includes('Free forever. Faster than everything. We show you what the herd is doing — and what happens to herds.'),
      'Landing subtitle must state: "Free forever. Faster than everything. We show you what the herd is doing — and what happens to herds."'
    );
  });

  // 2. Default Admin Announcement Reflects Mission
  await test('Global system announcement reflects the honest mission', () => {
    const announcements = adminService.getAnnouncements();
    assert(announcements.length > 0, 'Must have at least one announcement');
    const first = announcements[0];
    assert(
      first.title.includes('The only trading platform that profits from you not losing money.'),
      'Announcement title must contain the core positioning'
    );
    assert(
      first.text.includes('Free forever. Faster than everything.'),
      'Announcement text must contain the core subtitle'
    );
  });

  // 3. Root Layout Metadata & OpenGraph
  await test('Root layout.tsx metadata reflects mission title and description', () => {
    const layoutPath = path.join(process.cwd(), 'src/app/layout.tsx');
    const content = fs.readFileSync(layoutPath, 'utf8');

    assert(content.includes('The only trading platform that profits from you not losing money.'));
    assert(content.includes('Free forever. Faster than everything. We show you what the herd is doing'));
    assert(content.includes('openGraph:'));
    assert(content.includes('twitter:'));
  });

  // 4. Plain-Language /about Page
  await test('Public /about page exists with founding manifesto and $150/mo leanness', () => {
    const aboutPath = path.join(process.cwd(), 'src/app/about/page.tsx');
    assert(fs.existsSync(aboutPath), 'src/app/about/page.tsx must exist');
    const content = fs.readFileSync(aboutPath, 'utf8');

    assert(content.includes('Why Retail Trading Platforms Are Designed Like Casinos'));
    assert(content.includes('$150.00 per month'));
    assert(content.includes('The Permanent Invariants'));
    assert(content.includes('/funding'));
    assert(content.includes('/transparency'));
  });

  // 5. Plain-Language /terms Page
  await test('Public /terms page exists with plain-language contract and Right of Reply', () => {
    const termsPath = path.join(process.cwd(), 'src/app/terms/page.tsx');
    assert(fs.existsSync(termsPath), 'src/app/terms/page.tsx must exist');
    const content = fs.readFileSync(termsPath, 'utf8');

    assert(content.includes('Paper Trading Only — Zero Custody of Funds'));
    assert(content.includes('Right of Reply'));
    assert(content.includes('Structural Privacy Barrier'));
    assert(content.includes('Zero Ads & Zero Broker Affiliate Kickbacks'));
  });

  // 6. Public /changelog Page Documenting Full 10 Phases
  await test('Public /changelog page documents transparent 10-phase evolution', () => {
    const changelogPath = path.join(process.cwd(), 'src/app/changelog/page.tsx');
    assert(fs.existsSync(changelogPath), 'src/app/changelog/page.tsx must exist');
    const content = fs.readFileSync(changelogPath, 'utf8');

    for (let phase = 1; phase <= 10; phase++) {
      assert(content.includes(`Phase ${phase}`), `Changelog must document Phase ${phase}`);
    }
    assert(content.includes('The Verifiable Ledger'));
    assert(content.includes('The Reality Page'));
    assert(content.includes('The Sentiment Index'));
    assert(content.includes('The Scoreboard'));
    assert(content.includes('The Honest Backtester'));
    assert(content.includes('Community without Casino Vibes'));
    assert(content.includes('Transparent Funding'));
    assert(content.includes('Launch the Story'));
  });

  // 7. Seeded Scoreboard Public Calls (Prompt 10.2)
  await test('Scoreboard is pre-seeded with 10+ famous public calls before launch', () => {
    const summary = scoreboardService.getScoreboardSummary();
    assert(
      summary.totalCallsScored >= 10,
      `Scoreboard must have at least 10 seeded calls (actual: ${summary.totalCallsScored})`
    );
    assert(summary.topRankedCallers.length >= 5, 'Scoreboard must track multiple public figures');
  });

  // 8. Public Founder Verified Track Record (Prompt 10.2)
  await test('Founder public profile exists with verified track record and privacy opt-in', async () => {
    const founder = await profileService.getPublicProfileByUsername('bhaskar_sharma');
    assert(founder, 'Founder profile for bhaskar_sharma must exist');
    assert.strictEqual(founder.privacy.isPublicProfile, true, 'Founder profile must be public');
    assert.strictEqual(founder.privacy.showTradeHistory, true, 'Founder trade history must be visible');
  });

  // 9. Verbatim Permanent Rules in AGENTS.md
  await test('AGENTS.md documents all 7 Permanent Rules and Phase 10 invariants verbatim', () => {
    const agentsPath = path.join(process.cwd(), 'AGENTS.md');
    const content = fs.readFileSync(agentsPath, 'utf8');

    assert(content.includes('No result shown without context: drawdown, sample size, buy-and-hold.'));
    assert(content.includes('Every public number is computed from the database — never hand-written.'));
    assert(content.includes('Losses get equal billing to wins, everywhere.'));
    assert(content.includes('Aggregate-only data, 25-user minimum cohort, no per-user export — structural, not promissory.'));
    assert(content.includes('No ads, no affiliate links, no signals, no "premium predictions" — ever, at any revenue level.'));
    assert(content.includes('Performance budget is permanent: sub-1s pages, <150KB JS.'));
    assert(content.includes("If a feature would make a signal-seller money, it's off-brand. If it would get us banned from a signal Discord, it's on-brand."));
    assert(content.includes('Phase 10 — Launch the Story Invariants'));
  });

  // 10. Shell Integration
  await test('Shell.tsx embeds LandingHeroBanner and respects terminal aesthetic', () => {
    const shellPath = path.join(process.cwd(), 'src/components/layout/Shell.tsx');
    const content = fs.readFileSync(shellPath, 'utf8');

    assert(content.includes('LandingHeroBanner'), 'Shell must import and render LandingHeroBanner');
  });

  console.log(`\n🎉 PHASE 10 VERIFICATION COMPLETE: ALL ${passedTests}/${passedTests} TESTS PASSED!\n`);
}

runVerification().catch((err) => {
  console.error('Phase 10 verification failed:', err);
  process.exit(1);
});
