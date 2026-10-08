// src/app/api/developer/subscribe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { developerApiService } from '@/lib/developerApiService';
import { fundingService } from '@/lib/fundingService';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const userId = req.headers.get('x-user-id') || 'usr_celsius_demo';
    const { keyId } = body;

    if (!keyId) {
      return NextResponse.json({ error: 'keyId is required for Pro upgrade' }, { status: 400 });
    }

    const upgradedKey = developerApiService.upgradeToPro(userId, keyId);

    // Record the subscription revenue in the funding ledger ($49.00 = 4900 cents)
    fundingService.recordDonation({
      amountCents: 4900,
      donorName: `Developer (${upgradedKey.name})`,
      isMonthly: true,
      message: 'Sentiment API Pro Tier Subscription ($49/mo)',
      stripePaymentId: `sub_sim_${Date.now()}`,
    });

    return NextResponse.json({
      success: true,
      key: upgradedKey,
      message: 'Upgraded to Pro tier ($49/mo). Real-time streaming feeds and 100,000 monthly requests unlocked.',
    });
  } catch (error: any) {
    console.error('Pro tier subscription error:', error);
    return NextResponse.json({ error: error.message || 'Upgrade failed' }, { status: 500 });
  }
}
