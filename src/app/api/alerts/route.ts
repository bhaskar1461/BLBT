import { NextRequest, NextResponse } from 'next/server';

const SYMBOL_REGEX = /^[A-Z0-9]{3,12}$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { symbol, targetPrice, condition, note } = body;

    // Server-side input validation
    if (!symbol || !SYMBOL_REGEX.test(symbol.toUpperCase())) {
      return NextResponse.json({ error: 'Valid trading symbol is required' }, { status: 400 });
    }

    if (typeof targetPrice !== 'number' || targetPrice <= 0 || isNaN(targetPrice)) {
      return NextResponse.json({ error: 'Target price must be a positive number' }, { status: 400 });
    }

    if (condition !== 'above' && condition !== 'below') {
      return NextResponse.json({ error: 'Condition must be either above or below' }, { status: 400 });
    }

    const alertId = `alt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newAlert = {
      id: alertId,
      symbol: symbol.toUpperCase(),
      targetPrice,
      condition,
      note: typeof note === 'string' ? note.slice(0, 200) : undefined,
      active: true,
      createdAt: Date.now(),
    };

    return NextResponse.json({ success: true, alert: newAlert });
  } catch {
    return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 });
  }
}
