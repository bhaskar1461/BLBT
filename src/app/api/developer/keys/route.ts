// src/app/api/developer/keys/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { developerApiService } from '@/lib/developerApiService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id') || 'usr_celsius_demo';
    const keys = developerApiService.listUserKeys(userId);
    const usage = developerApiService.getUsageStats(userId);

    return NextResponse.json({
      success: true,
      keys,
      usage,
    });
  } catch (error: any) {
    console.error('Failed to list API keys:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const userId = req.headers.get('x-user-id') || 'usr_celsius_demo';
    const { name, tier } = body;

    const { rawKey, keyRecord } = developerApiService.generateApiKey({
      userId,
      name: name || 'API Key',
      tier: tier === 'pro' ? 'pro' : 'free',
    });

    return NextResponse.json({
      success: true,
      rawKey, // Returned only once at creation!
      key: keyRecord,
      message: 'API Key generated successfully. Save this key in a secure place as it will not be shown again.',
    });
  } catch (error: any) {
    console.error('Failed to create API key:', error);
    return NextResponse.json({ error: error.message || 'Operation failed' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const keyId = searchParams.get('id');
    const userId = req.headers.get('x-user-id') || 'usr_celsius_demo';

    if (!keyId) {
      return NextResponse.json({ error: 'Key ID is required' }, { status: 400 });
    }

    const revoked = developerApiService.revokeKey(userId, keyId);
    if (!revoked) {
      return NextResponse.json({ error: 'Key not found or already revoked' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'API key revoked successfully',
    });
  } catch (error: any) {
    console.error('Failed to revoke API key:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
