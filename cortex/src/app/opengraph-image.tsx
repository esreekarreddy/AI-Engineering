import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Cortex | AI Code Review Council';
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
          backgroundColor: '#09090b',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* Brain Icon */}
          <svg
            width="120"
            height="120"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#22d3ee"
            strokeWidth="1.5"
          >
            <path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7Z" />
            <path d="M9 22h6" strokeLinecap="round" />
            <path d="M12 17v5" strokeLinecap="round" />
          </svg>
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 100, fontWeight: 900, color: 'white', letterSpacing: '-0.05em' }}>
              CORTEX
            </div>
            <div style={{ fontSize: 30, color: '#a1a1aa', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '-10px' }}>
              Multi-Agent Code Review Council
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
