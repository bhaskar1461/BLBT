// src/app/api/profile/reset/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { profileService } from '@/lib/profileService';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id') || 'usr_celsius_demo';
    const profile = await profileService.resetAccount(userId);

    return NextResponse.json({
      success: true,
      message: 'Paper trading account successfully reset to 10,000 USDT default funding.',
      profile,
    });
  } catch (error) {
    console.error('Failed to reset account:', error);
    return NextResponse.json(
      { error: 'Failed to reset paper trading account' },
      { status: 500 }
    );
  }
}
