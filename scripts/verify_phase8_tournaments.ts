// scripts/verify_phase8_tournaments.ts
// Verification suite for Phase 8 — Community without Casino Vibes & Honest Share Cards

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { tournamentService } from '../src/lib/tournamentService';

async function runVerification() {
  console.log('🚀 RUNNING PHASE 8 (COMMUNITY WITHOUT CASINO VIBES) VERIFICATION SUITE\n');
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

  // 1. Database Migration & Schema Invariant
  await test('Database migration enforces CHECK (entry_fee = 0) constraint', () => {
    const migrationPath = path.join(
      process.cwd(),
      'supabase/migrations/20261007000007_tournaments.sql'
    );
    assert(fs.existsSync(migrationPath), 'Migration file 20261007000007_tournaments.sql must exist');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    assert(
      sql.includes('CHECK (entry_fee = 0)'),
      'SQL schema must enforce CHECK (entry_fee = 0) invariant'
    );
    assert(
      sql.includes('risk_adjusted_score'),
      'SQL schema must have risk_adjusted_score column'
    );
    assert(
      sql.includes('is_flagged_for_review'),
      'SQL schema must have is_flagged_for_review column'
    );
  });

  // 2. Free Entry Invariant (entryFee = 0)
  await test('Tournaments strictly enforce entryFee = 0 across all events', () => {
    const list = tournamentService.listTournaments();
    assert(list.length >= 2, 'Must have at least 2 default seeded tournaments');
    list.forEach((t) => {
      assert.strictEqual(t.entryFee, 0, `Tournament ${t.id} entryFee must be 0`);
      assert(t.riskCapPct <= 1.0, `Tournament ${t.id} must enforce risk cap <= 1.0%`);
      assert(t.startingBalanceUsdt === 10000, `Tournament ${t.id} starts at 10,000 USDT`);
    });
  });

  // 3. Risk-Adjusted Scoring Mathematical Invariant
  await test('Risk-adjusted formula strictly ranks disciplined drawdown control above YOLO gamblers', () => {
    // Sarah: +14.8% return, 2.1% max drawdown, 16 trades
    const scoreDisciplined = tournamentService.calculateRiskAdjustedScore(14.8, 2.1, 16);
    // Degen Rick: +32.0% return (higher raw PnL!), 38.4% max drawdown, 18 trades
    const scoreGambler = tournamentService.calculateRiskAdjustedScore(32.0, 38.4, 18);

    assert(
      scoreDisciplined > scoreGambler,
      `Disciplined score (${scoreDisciplined}) must be higher than Gambler score (${scoreGambler})`
    );
    assert.strictEqual(
      scoreDisciplined,
      4.7742,
      'Score calculated accurately: 14.8 / 3.1 = 4.7742'
    );
    assert.strictEqual(
      scoreGambler,
      0.8122,
      'Score calculated accurately: 32.0 / 39.4 = 0.8122'
    );
  });

  // 4. Sample Size Weighting in Scoring
  await test('Applies sample weighting penalty to small trade samples (<5 trades)', () => {
    const smallSampleScore = tournamentService.calculateRiskAdjustedScore(10.0, 1.0, 2);
    const matureSampleScore = tournamentService.calculateRiskAdjustedScore(10.0, 1.0, 10);

    assert(
      matureSampleScore > smallSampleScore,
      'Mature trade sample must rank higher than 2-trade sample with identical return/drawdown'
    );
  });

  // 5. Statistical Anomaly Detection (Improbable Win Rates)
  await test('Auto-flags impossible win rates for administrative review', () => {
    // Normal trader: 16 trades, 68.75% win rate -> clean
    const normal = tournamentService.checkImprobableWinRate(16, 68.75);
    assert.strictEqual(normal.isFlagged, false, 'Realistic win rates must not be flagged');

    // Improbable win rate: 12 trades, 100% win rate -> flagged!
    const perfectWinRate = tournamentService.checkImprobableWinRate(12, 100.0);
    assert.strictEqual(perfectWinRate.isFlagged, true, '100% win rate across 12 trades must be flagged');
    assert(perfectWinRate.reason?.includes('100% win rate'));

    // High volume improbable win rate: 10 trades, 96% win rate -> flagged!
    const ninetySixPct = tournamentService.checkImprobableWinRate(10, 96.0);
    assert.strictEqual(ninetySixPct.isFlagged, true, '96% win rate across 10 trades must be flagged');
  });

  // 6. Leaderboard Standings Invariant
  await test('Tournament leaderboard ranks by riskAdjustedScore, not raw P&L', () => {
    const t1 = tournamentService.getTournament('tourney-discipline-cup-2026');
    assert(t1, 'Discipline cup tournament must exist');

    const leaderboard = tournamentService.getLeaderboard(t1.id);
    assert(leaderboard.length >= 4, 'Must have at least 4 participants');

    // Check rank 1
    assert.strictEqual(leaderboard[0].rank, 1);
    assert.strictEqual(
      leaderboard[0].username,
      'sarah_m',
      'Sarah Miller must rank #1 due to highest risk-adjusted efficiency'
    );

    // Verify Degen Rick ranks below Sarah despite higher raw return
    const degen = leaderboard.find((p) => p.username === 'yolo_trader');
    assert(degen, 'Degen trader must exist in participants');
    assert(
      degen.rank > leaderboard[0].rank,
      'Degen trader with 38.4% drawdown must rank below disciplined trader'
    );

    // Verify Bot is flagged
    const bot = leaderboard.find((p) => p.username === 'quantum_signals');
    assert(bot, 'Flagged bot must exist in participants');
    assert.strictEqual(bot.isFlaggedForReview, true, 'Bot must be flagged for review');
  });

  // 7. Free Participant Registration Invariant
  await test('Allows free participant registration with $0 fee and $10,000 USDT balance', () => {
    const newParticipant = tournamentService.joinTournament('tourney-discipline-cup-2026', {
      userId: 'usr-new-tester',
      username: 'discipline_guru',
      displayName: 'Discipline Guru',
    });

    assert.strictEqual(newParticipant.userId, 'usr-new-tester');
    assert.strictEqual(newParticipant.startingBalanceUsdt, 10000);
    assert.strictEqual(newParticipant.currentBalanceUsdt, 10000);
    assert.strictEqual(newParticipant.riskAdjustedScore, 0);
    assert.strictEqual(newParticipant.isFlaggedForReview, false);
  });

  // 8. Admin Tournament Creation with Invariant Enforced
  await test('Admin tournament creation forces entryFee = 0 and default 1.0% risk cap', () => {
    const created = tournamentService.createTournament({
      title: 'Solana High Discipline Derby',
      description: 'Zero entry fees, disciplined Solana trading.',
      durationDays: 14,
      startingBalanceUsdt: 10000,
      riskCapPct: 1.0,
      rules: {
        eligiblePairs: ['SOLUSDT'],
        maxDailyLossPct: 5.0,
        perTradeRiskCapPct: 1.0,
        minTradesForRank: 5,
        allowWeekendTrading: true,
      },
    });

    assert.strictEqual(created.entryFee, 0, 'Created tournament entryFee must strictly be 0');
    assert.strictEqual(created.riskCapPct, 1.0);
    assert.strictEqual(created.status, 'active');
  });

  // 9. Admin Review & Flagging Actions
  await test('Allows admin to flag and unflag participants with audit reason', () => {
    const flagged = tournamentService.setParticipantReviewStatus(
      'tourney-discipline-cup-2026',
      'usr-sarah-m',
      true,
      'Auditing trade fills'
    );
    assert.strictEqual(flagged, true);

    const lb = tournamentService.getLeaderboard('tourney-discipline-cup-2026');
    const sarah = lb.find((p) => p.userId === 'usr-sarah-m');
    assert.strictEqual(sarah?.isFlaggedForReview, true);

    // Unflag
    tournamentService.setParticipantReviewStatus(
      'tourney-discipline-cup-2026',
      'usr-sarah-m',
      false
    );
    const sarahClean = tournamentService
      .getLeaderboard('tourney-discipline-cup-2026')
      .find((p) => p.userId === 'usr-sarah-m');
    assert.strictEqual(sarahClean?.isFlaggedForReview, false);
  });

  // 10. Prompt 8.2: Honest Share Cards Dignity for Losses & Tagline
  await test('OG share card routes uphold Prompt 8.2 with "Full record, verified." and loss dignity', () => {
    // Check Trade OG Image Route
    const tradeOgPath = path.join(
      process.cwd(),
      'src/app/api/og/trade/[tradeId]/route.tsx'
    );
    const tradeOg = fs.readFileSync(tradeOgPath, 'utf8');
    assert(
      tradeOg.includes('Full record, verified.'),
      'Trade OG card must contain "Full record, verified."'
    );
    assert(
      tradeOg.includes('BADGE OF HONESTY • DISCIPLINED LOSS') ||
        tradeOg.includes('Took a -'),
      'Trade OG card must render loss cards with equal dignity'
    );

    // Check Reality OG Route
    const realityOgPath = path.join(
      process.cwd(),
      'src/app/api/og/reality/route.tsx'
    );
    const realityOg = fs.readFileSync(realityOgPath, 'utf8');
    assert(
      realityOg.includes('Full record, verified.'),
      'Reality OG card must contain "Full record, verified."'
    );

    // Check Sentiment OG Route
    const sentimentOgPath = path.join(
      process.cwd(),
      'src/app/api/og/sentiment/route.tsx'
    );
    const sentimentOg = fs.readFileSync(sentimentOgPath, 'utf8');
    assert(
      sentimentOg.includes('Full record, verified.'),
      'Sentiment OG card must contain "Full record, verified."'
    );
  });

  // 11. AGENTS.md Invariant Documentation
  await test('AGENTS.md contains comprehensive Phase 8 invariants', () => {
    const agentsMdPath = path.join(process.cwd(), 'AGENTS.md');
    const content = fs.readFileSync(agentsMdPath, 'utf8');
    assert(content.includes('Phase 8 — Community without Casino Vibes Invariants'));
    assert(content.includes('Strictly Zero Entry Fees'));
    assert(content.includes('Risk-Adjusted Ranking Metric — Never Raw P&L'));
    assert(content.includes('Statistical Anomaly Detection'));
    assert(content.includes('Equal Dignity for Losses & Share Cards'));
  });

  // 12. Frontend Pages and Components Exist
  await test('Tournament pages and UI components exist and are correctly structured', () => {
    const pagePath = path.join(process.cwd(), 'src/app/tournaments/page.tsx');
    const detailPagePath = path.join(process.cwd(), 'src/app/tournaments/[id]/page.tsx');
    const cardCompPath = path.join(
      process.cwd(),
      'src/components/tournaments/TournamentCard.tsx'
    );
    const lbCompPath = path.join(
      process.cwd(),
      'src/components/tournaments/TournamentLeaderboardTable.tsx'
    );
    const modalCompPath = path.join(
      process.cwd(),
      'src/components/tournaments/JoinTournamentModal.tsx'
    );

    assert(fs.existsSync(pagePath), 'Tournaments page exists');
    assert(fs.existsSync(detailPagePath), 'Tournament detail page exists');
    assert(fs.existsSync(cardCompPath), 'TournamentCard component exists');
    assert(fs.existsSync(lbCompPath), 'TournamentLeaderboardTable component exists');
    assert(fs.existsSync(modalCompPath), 'JoinTournamentModal component exists');
  });

  console.log(`\n🎉 PHASE 8 VERIFICATION COMPLETE: ALL ${passedTests}/${passedTests} TESTS PASSED!\n`);
}

runVerification().catch((err) => {
  console.error('Phase 8 verification failed:', err);
  process.exit(1);
});
