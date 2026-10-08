import { NextRequest, NextResponse } from 'next/server';
import { scoreboardService, CallPlatform, CallDirection, CallStatus } from '@/lib/scoreboardService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const platform = searchParams.get('platform') || undefined;
    const symbol = searchParams.get('symbol') || undefined;
    const status = (searchParams.get('status') as CallStatus) || undefined;
    const callerName = searchParams.get('caller') || undefined;

    const summary = scoreboardService.getScoreboardSummary();

    if (platform || symbol || status || callerName) {
      const filteredCalls = scoreboardService.getCalls({
        platform,
        symbol,
        status,
        callerName,
      });
      return NextResponse.json({
        success: true,
        summary,
        calls: filteredCalls,
      });
    }

    return NextResponse.json({
      success: true,
      ...summary,
    });
  } catch (error) {
    console.error('Error fetching scoreboard:', error);
    return NextResponse.json({ error: 'Internal scoreboard error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      callerName,
      callerHandle,
      platform,
      symbol,
      direction,
      entryPrice,
      timeframeDays,
      proofUrl,
      notes,
    } = body;

    if (!callerName || typeof callerName !== 'string' || callerName.trim().length === 0) {
      return NextResponse.json({ error: 'Caller name is required.' }, { status: 400 });
    }

    const validPlatforms: CallPlatform[] = [
      'youtube',
      'twitter',
      'telegram',
      'tiktok',
      'tv',
      'discord',
      'other',
    ];
    if (!platform || !validPlatforms.includes(platform)) {
      return NextResponse.json(
        { error: 'Valid platform (youtube, twitter, telegram, tiktok, tv, discord, other) is required.' },
        { status: 400 }
      );
    }

    if (!symbol || typeof symbol !== 'string') {
      return NextResponse.json({ error: 'Asset symbol is required (e.g. BTCUSDT).' }, { status: 400 });
    }

    if (direction !== 'bullish' && direction !== 'bearish') {
      return NextResponse.json(
        { error: "Direction must be either 'bullish' or 'bearish'." },
        { status: 400 }
      );
    }

    const parsedDays = parseInt(timeframeDays, 10);
    if (isNaN(parsedDays) || parsedDays <= 0 || parsedDays > 365) {
      return NextResponse.json(
        { error: 'Timeframe must be between 1 and 365 days.' },
        { status: 400 }
      );
    }

    let parsedPrice = parseFloat(entryPrice);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      // Auto-fetch Binance live price if price not supplied
      try {
        const cleanSym = symbol.toUpperCase().replace(/[^A-Z0-9]/g, '');
        const binanceRes = await fetch(
          `https://api.binance.com/api/v3/ticker/price?symbol=${cleanSym}`
        );
        if (binanceRes.ok) {
          const binanceData = await binanceRes.json();
          parsedPrice = parseFloat(binanceData.price);
        }
      } catch {}
    }

    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return NextResponse.json(
        { error: 'Valid positive entry price is required.' },
        { status: 400 }
      );
    }

    const newCall = scoreboardService.submitCall({
      callerName,
      callerHandle,
      platform,
      symbol,
      direction,
      entryPrice: parsedPrice,
      timeframeDays: parsedDays,
      proofUrl,
      notes,
    });

    return NextResponse.json({
      success: true,
      message: `Call for ${newCall.callerName} submitted successfully for verifiable scoring.`,
      call: newCall,
    });
  } catch (error) {
    console.error('Error submitting call:', error);
    return NextResponse.json({ error: 'Failed to submit public call.' }, { status: 500 });
  }
}
