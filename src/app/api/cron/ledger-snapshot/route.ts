// src/app/api/cron/ledger-snapshot/route.ts
import { NextResponse } from 'next/server';
import { transparencyService } from '@/lib/transparencyService';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const newSnapshot = transparencyService.generateDailySnapshot();

    return NextResponse.json({
      success: true,
      message: `Daily hash snapshot generated and chained for date ${newSnapshot.date}`,
      snapshot: newSnapshot,
    });
  } catch (error) {
    console.error('Failed to run daily ledger snapshot cron:', error);
    return NextResponse.json(
      { error: 'Failed to generate daily ledger snapshot' },
      { status: 500 }
    );
  }
}
