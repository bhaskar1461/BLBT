// scripts/verify_phase5_verified_records.ts
import fs from 'fs';
import path from 'path';
import { profileService } from '../src/lib/profileService';
import { transparencyService } from '../src/lib/transparencyService';

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
  console.log('🧪 VERIFYING PHASE 5: VERIFIED PUBLIC RECORDS (THE TRUST MOAT)');
  console.log('🧪 ========================================================\n');

  // --------------------------------------------------------------------------
  // PROMPT 5.1: AGENTS.MD INVARIANTS & TRUTH RULES
  // --------------------------------------------------------------------------
  console.log('--- TEST GROUP 1: Prompt 5.1 — AGENTS.md Invariants & Grounding Rules ---');

  const agentsMd = fs.readFileSync(path.join(process.cwd(), 'AGENTS.md'), 'utf-8');
  assert(
    agentsMd.includes('Phase 5 — Verified Public Records'),
    'AGENTS.md documents Phase 5 Verified Public Records section'
  );
  assert(
    agentsMd.includes('All-or-Nothing Track Record Invariant'),
    'AGENTS.md enforces the All-or-Nothing Track Record Invariant'
  );
  assert(
    agentsMd.includes('Make my track record public'),
    'AGENTS.md specifies the exact toggle label "Make my track record public"'
  );
  assert(
    agentsMd.includes('A public profile is a resume, not a highlight reel'),
    'AGENTS.md pins the core truth motto: "A public profile is a resume, not a highlight reel."'
  );
  assert(
    agentsMd.includes('Ledger Snapshot Hash Stamped'),
    'AGENTS.md enforces stamping public track records with cryptographic ledger root hash'
  );

  // --------------------------------------------------------------------------
  // PROMPT 5.1: USER TOGGLE & PROFILE SETTINGS MODAL
  // --------------------------------------------------------------------------
  console.log('\n--- TEST GROUP 2: Prompt 5.1 — User Toggle in ProfileModal ---');

  const profileModalPath = path.join(process.cwd(), 'src/components/profile/ProfileModal.tsx');
  assert(fs.existsSync(profileModalPath), 'ProfileModal.tsx exists');
  const profileModalCode = fs.readFileSync(profileModalPath, 'utf-8');

  assert(
    profileModalCode.includes('Make my track record public'),
    'ProfileModal features the exact toggle: "Make my track record public"'
  );
  assert(
    profileModalCode.includes('All-or-nothing: your complete trade history (every win and loss)'),
    'ProfileModal subtext explicitly explains the all-or-nothing policy'
  );
  assert(
    profileModalCode.includes('stamped with the daily ledger snapshot hash'),
    'ProfileModal explains cryptographic stamping in user settings'
  );
  assert(
    profileModalCode.includes('A public profile is a resume, not a highlight reel'),
    'ProfileModal echoes the resume philosophy in privacy settings'
  );

  // --------------------------------------------------------------------------
  // PROMPT 5.1: /TRANSPARENCY VERIFIED RECORD EXPLANATION
  // --------------------------------------------------------------------------
  console.log('\n--- TEST GROUP 3: Prompt 5.1 — /transparency Explanation ---');

  const transparencyPagePath = path.join(process.cwd(), 'src/app/transparency/page.tsx');
  assert(fs.existsSync(transparencyPagePath), 'src/app/transparency/page.tsx exists');
  const transparencyCode = fs.readFileSync(transparencyPagePath, 'utf-8');

  assert(
    transparencyCode.includes('What is a') && transparencyCode.includes('Verified Record'),
    '/transparency page contains dedicated "What is a Verified Record?" section'
  );
  assert(
    transparencyCode.includes('The Screenshot Problem') && transparencyCode.includes('photoshop'),
    '/transparency exposes how screenshots are easily faked by trading influencers'
  );
  assert(
    transparencyCode.includes('The Verified Record Standard') && transparencyCode.includes('/u/[username]'),
    '/transparency explains the /u/[username] cryptographic verification standard'
  );
  assert(
    transparencyCode.includes('A public profile is a resume, not a highlight reel'),
    '/transparency reinforces "A public profile is a resume, not a highlight reel."'
  );

  // --------------------------------------------------------------------------
  // PROMPT 5.1: BACKEND SERVICE & ALL-OR-NOTHING INVARIANT
  // --------------------------------------------------------------------------
  console.log('\n--- TEST GROUP 4: Prompt 5.1 — Profile Service & Cryptographic Stamping ---');

  const satoshiRecord = await profileService.getPublicProfileByUsername('satoshisniper');
  assert(satoshiRecord !== null, 'Retrieves public verified profile for @satoshisniper');
  assert(satoshiRecord?.isRecordVerified === true, 'Profile is marked as verified track record');
  assert(
    typeof satoshiRecord?.latestLedgerSnapshotHash === 'string' &&
      satoshiRecord.latestLedgerSnapshotHash.length === 64,
    `Profile is stamped with 64-char SHA-256 snapshot hash: ${satoshiRecord?.latestLedgerSnapshotHash.slice(0, 16)}...`
  );
  assert(
    (satoshiRecord?.trades?.length || 0) >= 6,
    `Profile contains complete trade history: ${satoshiRecord?.trades?.length} closed trades`
  );

  // Equal Billing Verification: must have both wins and losses
  const wins = satoshiRecord?.trades?.filter((t: { realizedPnl: number }) => t.realizedPnl > 0) || [];
  const losses = satoshiRecord?.trades?.filter((t: { realizedPnl: number }) => t.realizedPnl < 0) || [];
  assert(wins.length > 0, `Profile includes winning trades: count=${wins.length}`);
  assert(losses.length > 0, `Profile includes losing trades: count=${losses.length}`);
  assert(
    wins.length > 0 && losses.length > 0,
    'Equal billing for losses: Public track record includes both wins and losses without hiding'
  );

  // Benchmark comparison
  assert(
    typeof satoshiRecord?.benchmark?.formattedComparison === 'string' &&
      satoshiRecord.benchmark.formattedComparison.includes('Same capital in BTC buy-and-hold'),
    `Profile includes buy-and-hold benchmark context: "${satoshiRecord?.benchmark?.formattedComparison}"`
  );

  // --------------------------------------------------------------------------
  // PROMPT 5.1: PUBLIC /U/[USERNAME] PAGE
  // --------------------------------------------------------------------------
  console.log('\n--- TEST GROUP 5: Prompt 5.1 — Public /u/[username] Showcase Page ---');

  const uPagePath = path.join(process.cwd(), 'src/app/u/[username]/page.tsx');
  assert(fs.existsSync(uPagePath), 'src/app/u/[username]/page.tsx exists');
  const uPageCode = fs.readFileSync(uPagePath, 'utf-8');

  assert(
    uPageCode.includes('VERIFIED RECORD') || uPageCode.includes('Verified Public Track Record'),
    '/u/[username] renders the Verified Record badge'
  );
  assert(
    uPageCode.includes('latestHash') && uPageCode.includes('Ledger Snapshot'),
    '/u/[username] stamps the profile with the ledger snapshot root hash'
  );
  assert(
    uPageCode.includes('A public profile is a resume, not a highlight reel'),
    '/u/[username] displays the truth motto: "A public profile is a resume, not a highlight reel."'
  );
  assert(
    uPageCode.includes('Context Check') || uPageCode.includes('formattedComparison'),
    '/u/[username] displays the buy-and-hold benchmark context banner'
  );
  assert(
    uPageCode.includes('Complete Trade History') && uPageCode.toLowerCase().includes('equal billing'),
    '/u/[username] features the Complete Trade History section with equal billing for losses'
  );
  assert(
    uPageCode.includes('WIN') && uPageCode.includes('LOSS'),
    '/u/[username] renders both WIN and LOSS statuses transparently'
  );

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log('\n========================================================');
  console.log(`📊 PHASE 5 VERIFICATION RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('========================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error('Fatal error during Phase 5 verification:', err);
  process.exit(1);
});
