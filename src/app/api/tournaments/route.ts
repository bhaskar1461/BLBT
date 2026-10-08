// src/app/api/tournaments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { tournamentService } from '@/lib/tournamentService';
import { adminService } from '@/lib/adminService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tournamentId = searchParams.get('id');

    if (tournamentId) {
      const tournament = tournamentService.getTournament(tournamentId);
      if (!tournament) {
        return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
      }
      const leaderboard = tournamentService.getLeaderboard(tournamentId);
      return NextResponse.json({
        success: true,
        tournament,
        leaderboard,
        methodology: {
          ranking: 'Risk-Adjusted Score: Return % / (Max Drawdown % + 1.0) * Sample Weight',
          invariants: 'Zero entry fees, enforced 1.0% risk cap, auto-flagging of improbable win rates',
        },
      });
    }

    const tournaments = tournamentService.listTournaments();
    return NextResponse.json({
      success: true,
      tournaments,
    });
  } catch (error: any) {
    console.error('Failed to get tournaments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action, tournamentId, user, title, description, durationDays, startingBalanceUsdt, riskCapPct, rules } = body;

    // ACTION 1: Join tournament (Free, Zero Entry Fees)
    if (action === 'join') {
      if (!tournamentId) {
        return NextResponse.json({ error: 'tournamentId is required' }, { status: 400 });
      }

      const participantUser = user || {
        userId: 'usr_celsius_demo',
        username: 'satoshisniper',
        displayName: 'Alex "Satoshi" Chen',
      };

      const participant = tournamentService.joinTournament(tournamentId, participantUser);
      return NextResponse.json({
        success: true,
        message: 'Successfully registered for tournament with zero entry fee.',
        participant,
      });
    }

    // ACTION 2: Admin Create Tournament
    if (action === 'create') {
      const userRole = req.headers.get('x-user-role');
      if (userRole !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 403 });
      }

      if (!title || !description) {
        return NextResponse.json({ error: 'title and description are required' }, { status: 400 });
      }

      const tournament = tournamentService.createTournament({
        title,
        description,
        durationDays: Number(durationDays) || 7,
        startingBalanceUsdt: Number(startingBalanceUsdt) || 10000,
        riskCapPct: Number(riskCapPct) || 1.0,
        rules,
      });

      // Audit log admin action
      adminService.logAction(
        req.headers.get('x-user-id') || 'admin_sys',
        'admin@celsius.network',
        'create_tournament',
        tournament.id,
        { title, durationDays }
      );

      return NextResponse.json({
        success: true,
        message: 'Tournament created successfully.',
        tournament,
      });
    }

    // ACTION 3: Admin Review / Flag Participant
    if (action === 'review_participant') {
      const userRole = req.headers.get('x-user-role');
      if (userRole !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      const { targetUserId, isFlagged, reason } = body;
      const updated = tournamentService.setParticipantReviewStatus(tournamentId, targetUserId, isFlagged, reason);
      return NextResponse.json({ success: updated });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error: any) {
    console.error('Tournament action failed:', error);
    return NextResponse.json({ error: error.message || 'Operation failed' }, { status: 500 });
  }
}
