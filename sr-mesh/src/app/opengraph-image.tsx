import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'SR Mesh | 3D Knowledge Graph';
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
          {/* Galaxy/Network Icon */}
          <svg
            width="120"
            height="120"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#a855f7"
            strokeWidth="1.5"
          >
            <circle cx="12" cy="12" r="3" fill="#a855f7" />
            <circle cx="5" cy="8" r="2" fill="#c084fc" />
            <circle cx="19" cy="8" r="2" fill="#c084fc" />
            <circle cx="5" cy="16" r="2" fill="#c084fc" />
            <circle cx="19" cy="16" r="2" fill="#c084fc" />
            <line x1="9" y1="10" x2="7" y2="8" stroke="#c084fc" />
            <line x1="15" y1="10" x2="17" y2="8" stroke="#c084fc" />
            <line x1="9" y1="14" x2="7" y2="16" stroke="#c084fc" />
            <line x1="15" y1="14" x2="17" y2="16" stroke="#c084fc" />
          </svg>
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 100, fontWeight: 900, color: 'white', letterSpacing: '-0.05em' }}>
              SR MESH
            </div>
            <div style={{ fontSize: 30, color: '#a1a1aa', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '-10px' }}>
              3D Knowledge Graph with Browser AI
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
