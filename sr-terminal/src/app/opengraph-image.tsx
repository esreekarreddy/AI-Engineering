import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'SR Terminal | Browser-Based Web OS';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0a0a',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* Terminal Icon */}
          <svg
            width="120"
            height="120"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#10b981"
            strokeWidth="2"
          >
            <rect x="3" y="4" width="18" height="16" rx="2" stroke="#10b981" />
            <path d="M7 8l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M13 16h4" strokeLinecap="round" />
          </svg>
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 100, fontWeight: 900, color: 'white', letterSpacing: '-0.05em' }}>
              SR TERMINAL
            </div>
            <div style={{ fontSize: 30, color: '#a1a1aa', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '-10px' }}>
              Browser-Based Web OS with AI
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
