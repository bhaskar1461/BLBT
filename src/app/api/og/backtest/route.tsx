// src/app/api/og/backtest/route.tsx
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const strategy = searchParams.get('strategy') || 'Moving Average Crossover';
    const symbol = (searchParams.get('symbol') || 'BTCUSDT').toUpperCase();
    const strategyReturn = searchParams.get('return') || '+14.2%';
    const btcReturn = searchParams.get('btc') || '+38.4%';
    const summary =
      searchParams.get('summary') || 'This strategy underperformed holding BTC in 62% of tested periods.';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            backgroundColor: '#0c0d12',
            backgroundImage:
              'radial-gradient(circle at 50% 20%, rgba(16, 185, 129, 0.12), transparent 75%)',
            padding: '60px 70px',
            fontFamily: 'sans-serif',
            color: '#ffffff',
            boxSizing: 'border-box',
          }}
        >
          {/* Header Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  fontWeight: 'bold',
                  color: '#000000',
                }}
              >
                °C
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span
                  style={{
                    fontSize: '22px',
                    fontWeight: 'bold',
                    letterSpacing: '-0.5px',
                  }}
                >
                  Celsius Network
                </span>
                <span
                  style={{
                    fontSize: '13px',
                    color: '#10b981',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    fontWeight: 'bold',
                  }}
                >
                  THE HONEST BACKTESTER
                </span>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '8px 16px',
                borderRadius: '999px',
                fontSize: '14px',
                color: '#a1a1aa',
              }}
            >
              <span>Binance Historical Spot Data • 0.10% Fee Modeled</span>
            </div>
          </div>

          {/* Central Verdict & Headline */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              maxWidth: '960px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                color: '#34d399',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              <span>{symbol} • {strategy}</span>
            </div>

            <div
              style={{
                fontSize: '44px',
                fontWeight: '800',
                lineHeight: 1.15,
                letterSpacing: '-1px',
                color: '#ffffff',
              }}
            >
              &ldquo;{summary}&rdquo;
            </div>
          </div>

          {/* Bottom Side-by-Side Comparison */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              paddingTop: '32px',
            }}
          >
            <div style={{ display: 'flex', gap: '48px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '12px', color: '#71717a', textTransform: 'uppercase' }}>
                  Strategy Return
                </span>
                <span style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981' }}>
                  {strategyReturn}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '12px', color: '#71717a', textTransform: 'uppercase' }}>
                  Buy-and-Hold
                </span>
                <span style={{ fontSize: '32px', fontWeight: 'bold', color: '#22d3ee' }}>
                  {btcReturn}
                </span>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: '4px',
                color: '#71717a',
                fontSize: '13px',
              }}
            >
              <span>celsius.network/backtest • Free & Open</span>
              <span style={{ color: '#10b981', fontWeight: 'bold' }}>
                &ldquo;Profits from you not losing money&rdquo;
              </span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error: any) {
    return new Response(`Failed to generate image: ${error.message}`, { status: 500 });
  }
}
