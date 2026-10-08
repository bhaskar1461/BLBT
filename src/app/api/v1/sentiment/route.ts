// src/app/api/v1/sentiment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { developerApiService } from '@/lib/developerApiService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const authHeader = req.headers.get('authorization');
    const queryKey = searchParams.get('apiKey');
    const rawKey = authHeader || queryKey || '';

    // 1. Authenticate and rate limit check
    const authResult = developerApiService.validateApiKey(rawKey);
    if (!authResult.isValid || !authResult.record) {
      return NextResponse.json(
        {
          error: authResult.error || 'Unauthorized',
          tier: 'unauthenticated',
          documentation: 'https://celsius.network/developers',
        },
        {
          status: authResult.statusCode || 401,
          headers: {
            'WWW-Authenticate': 'Bearer realm="Celsius Sentiment API"',
          },
        }
      );
    }

    const { record } = authResult;
    const symbol = searchParams.get('symbol') || 'BTCUSDT';

    // 2. Fetch Sentiment Feed according to tier (Free 24h delay / Pro real-time)
    const feed = developerApiService.getSentimentFeed(symbol, record);

    // 3. Construct response with rate-limit and tier headers
    const remaining = Math.max(0, record.monthlyLimit - record.currentMonthRequests);
    const headers = new Headers();
    headers.set('X-RateLimit-Limit', String(record.monthlyLimit));
    headers.set('X-RateLimit-Remaining', String(remaining));
    headers.set('X-Celsius-Tier', record.tier);
    headers.set('X-Celsius-Delayed', record.tier === 'free' ? 'true' : 'false');
    headers.set('Cache-Control', record.tier === 'free' ? 'public, max-age=3600' : 'no-cache');

    return NextResponse.json(feed, {
      status: 200,
      headers,
    });
  } catch (error: any) {
    console.error('Sentiment API error:', error);
    return NextResponse.json(
      { error: 'Internal API processing error', details: error.message },
      { status: 500 }
    );
  }
}
