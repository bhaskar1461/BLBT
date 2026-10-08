// src/app/api/funding/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { fundingService } from '@/lib/fundingService';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { amountCents, isMonthly, donorName, email, message, isAnonymous } = body;

    const cents = Number(amountCents) || 500; // Default $5.00
    if (cents <= 0) {
      return NextResponse.json({ error: 'Valid amount is required' }, { status: 400 });
    }

    const sessionId = `cs_test_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const checkoutUrl = `/funding?session_id=${sessionId}&success=true&amount=${(cents / 100).toFixed(2)}`;

    // In a live production environment with Stripe secret key:
    // const session = await stripe.checkout.sessions.create({ ... })
    // In our test / paper environment, we record the simulated pledge
    fundingService.recordDonation({
      amountCents: cents,
      donorName: isAnonymous ? 'Anonymous Supporter' : donorName || 'Community Member',
      isAnonymous: Boolean(isAnonymous),
      isMonthly: Boolean(isMonthly),
      message,
      stripePaymentId: sessionId,
    });

    return NextResponse.json({
      success: true,
      sessionId,
      checkoutUrl,
      amountUsdt: (cents / 100).toFixed(2),
      isMonthly: Boolean(isMonthly),
      message: 'Donation session initiated.',
    });
  } catch (error: any) {
    console.error('Stripe donation checkout error:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
