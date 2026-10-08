// src/app/api/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { profileService } from '@/lib/profileService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id') || 'usr_celsius_demo';
    const profile = await profileService.getProfileWithLiveStats(userId);

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error('Failed to fetch trader profile:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve trader profile' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id') || 'usr_celsius_demo';
    const body = await req.json().catch(() => ({}));

    const updated = await profileService.updateProfile(userId, body);

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      profile: updated,
    });
  } catch (error: any) {
    console.error('Failed to update trader profile:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update profile' },
      { status: 400 }
    );
  }
}
