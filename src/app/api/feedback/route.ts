import { NextRequest, NextResponse } from 'next/server';
import { adminService } from '@/lib/adminService';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id') || 'usr_celsius_demo';
    const body = await req.json().catch(() => ({}));
    const { category = 'general', message, email, rating } = body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Feedback message cannot be empty' },
        { status: 400 }
      );
    }

    const cleanCategory = ['bug', 'feature', 'praise', 'general'].includes(category)
      ? (category as 'bug' | 'feature' | 'praise' | 'general')
      : 'general';

    const cleanRating = typeof rating === 'number' && rating >= 1 && rating <= 5 ? rating : 5;

    const item = adminService.addFeedback(
      userId,
      email?.trim() || undefined,
      cleanCategory,
      message.trim().slice(0, 1000),
      cleanRating
    );

    return NextResponse.json({
      success: true,
      message: 'Feedback submitted successfully. Thank you for making Celsius better!',
      feedback: item,
    });
  } catch (error) {
    console.error('Feedback submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}
