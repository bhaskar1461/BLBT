// src/app/api/transparency/route.ts
import { NextResponse } from 'next/server';
import { transparencyService } from '@/lib/transparencyService';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const latest = transparencyService.getLatestSnapshot();
    const snapshots = transparencyService.getAllSnapshots();
    const audit = transparencyService.verifyLedgerIntegrity();

    return NextResponse.json({
      success: true,
      latestSnapshot: latest,
      snapshots,
      audit,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to query transparency ledger:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve transparency records' },
      { status: 500 }
    );
  }
}
