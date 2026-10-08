import { NextRequest, NextResponse } from 'next/server';
import { sentimentService } from '@/lib/sentimentService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const symbol = (searchParams.get('symbol') || 'BTCUSDT').toUpperCase();
    const isDelayed = searchParams.get('delayed') !== 'false'; // Default to true (24h delayed) for public tier

    if (isDelayed) {
      const delayedData = sentimentService.getPublicDelayedSentiment(symbol);
      return NextResponse.json({
        success: true,
        isDelayed: true,
        ...delayedData,
      });
    }

    // Real-time terminal request
    const live = sentimentService.getLiveSentiment(symbol);
    if (!live.success || !live.snapshot) {
      return NextResponse.json(
        {
          success: false,
          error: live.error || 'Failed to retrieve sentiment',
          isCohortSufficient: live.isCohortSufficient,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      symbol,
      isDelayed: false,
      snapshot: live.snapshot,
      terminalStrip: live.snapshot.terminalContextStrip,
      isCohortSufficient: live.isCohortSufficient,
    });
  } catch (error) {
    console.error('Error fetching sentiment:', error);
    return NextResponse.json({ error: 'Internal sentiment engine error' }, { status: 500 });
  }
}
