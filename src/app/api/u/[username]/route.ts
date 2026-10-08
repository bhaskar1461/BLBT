// src/app/api/u/[username]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { profileService } from '@/lib/profileService';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params;
    const profile = await profileService.getPublicProfileByUsername(username);

    if (!profile) {
      return NextResponse.json(
        { error: 'Trader profile not found or set to private' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error('Failed to query public trader profile:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve trader profile' },
      { status: 500 }
    );
  }
}
