// src/app/api/funding/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { fundingService } from '@/lib/fundingService';
import { adminService } from '@/lib/adminService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const summary = fundingService.getFundingSummary();
    return NextResponse.json({
      success: true,
      summary,
    });
  } catch (error: any) {
    console.error('Failed to get funding summary:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action } = body;

    // Action 1: Record Donation
    if (action === 'donate') {
      const { amountCents, donorName, isAnonymous, isMonthly, message } = body;

      if (!amountCents || Number(amountCents) <= 0) {
        return NextResponse.json(
          { error: 'Donation amount must be greater than zero' },
          { status: 400 }
        );
      }

      const donation = fundingService.recordDonation({
        amountCents: Number(amountCents),
        donorName,
        isAnonymous,
        isMonthly,
        message,
      });

      return NextResponse.json({
        success: true,
        message: 'Thank you for supporting financial transparency.',
        donation,
        summary: fundingService.getFundingSummary(),
      });
    }

    // Action 2: Admin Update Operating Cost
    if (action === 'update_cost') {
      const userRole = req.headers.get('x-user-role');
      if (userRole !== 'admin') {
        return NextResponse.json(
          { error: 'Unauthorized: Admin privileges required' },
          { status: 403 }
        );
      }

      const { costId, amountCents, description } = body;
      if (!costId || amountCents === undefined) {
        return NextResponse.json(
          { error: 'costId and amountCents are required' },
          { status: 400 }
        );
      }

      const updated = fundingService.updateOperatingCost(costId, Number(amountCents), description);

      // Audit log the cost update
      adminService.logAction(
        req.headers.get('x-user-id') || 'admin_sys',
        'admin@celsius.network',
        'update_operating_cost',
        costId,
        { amountCents, description }
      );

      return NextResponse.json({
        success: true,
        costItem: updated,
        summary: fundingService.getFundingSummary(),
      });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error: any) {
    console.error('Funding action failed:', error);
    return NextResponse.json({ error: error.message || 'Operation failed' }, { status: 500 });
  }
}
