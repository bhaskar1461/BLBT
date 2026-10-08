// src/app/api/og/funding/route.tsx
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const monthlyCost = searchParams.get('cost') || '150';
    const donations = searchParams.get('donations') || '53';
    const runway = searchParams.get('runway') || '12.4';

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
              'radial-gradient(circle at 50% 25%, rgba(0, 240, 144, 0.12), transparent 75%)',
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
                  background: 'linear-gradient(135deg, #00f090 0%, #2962ff 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  fontWeight: 900,
                  color: '#0c0d12',
                }}
              >
                °C
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span
                  style={{
                    fontSize: '22px',
                    fontWeight: 800,
                    letterSpacing: '-0.5px',
                    color: '#ffffff',
                  }}
                >
                  Celsius Network
                </span>
                <span style={{ fontSize: '13px', color: '#9ca3af' }}>
                  Radical Financial Transparency • The Honest Terminal
                </span>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'rgba(0, 240, 144, 0.15)',
                border: '1px solid rgba(0, 240, 144, 0.35)',
                padding: '8px 16px',
                borderRadius: '999px',
                fontSize: '13px',
                fontWeight: 700,
                color: '#00f090',
                letterSpacing: '0.5px',
              }}
            >
              ZERO ADS • ZERO AFFILIATES
            </div>
          </div>

          {/* Central Statement */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '24px',
              padding: '36px 44px',
              gap: '20px',
            }}
          >
            <div
              style={{
                display: 'flex',
                fontSize: '34px',
                fontWeight: 900,
                lineHeight: '1.25',
                color: '#ffffff',
              }}
            >
              “We show you our money so you know who we work for: you.”
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '16px',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase' }}>
                  Monthly Operating Cost
                </span>
                <span style={{ fontSize: '28px', fontWeight: 800, color: '#ffffff' }}>
                  ${monthlyCost}/mo
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase' }}>
                  Community Donations
                </span>
                <span style={{ fontSize: '28px', fontWeight: 800, color: '#00f090' }}>
                  ${donations}/mo
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase' }}>
                  Treasury Runway
                </span>
                <span style={{ fontSize: '28px', fontWeight: 800, color: '#3b82f6' }}>
                  {runway} Months
                </span>
              </div>
            </div>
          </div>

          {/* Footer Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '14px',
              color: '#9ca3af',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              paddingTop: '24px',
            }}
          >
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <span>Public Financial Ledger</span>
              <span>•</span>
              <span>No Sponsored Signals</span>
              <span>•</span>
              <span style={{ color: '#00f090', fontWeight: 700 }}>Full record, verified.</span>
            </div>
            <div style={{ display: 'flex', fontWeight: 700, color: '#ffffff' }}>
              celsius.network/funding
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    return new Response(`Failed to generate funding OG image: ${e.message}`, { status: 500 });
  }
}
