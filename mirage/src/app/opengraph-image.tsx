import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Mirage | Generative UI Engine';
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
          backgroundColor: '#09090b', // zinc-950
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
             {/* Logo SVG */}
             <svg
                width="120"
                height="120"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                fill="#8b5cf6" // violet-500
                />
                <path
                d="M2 17L12 22L22 17"
                stroke="#a78bfa" // violet-400
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                />
                <path
                d="M2 12L12 17L22 12"
                stroke="white"
                strokeOpacity="0.3"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                />
            </svg>
            
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: 100, fontWeight: 900, color: 'white', letterSpacing: '-0.05em' }}>
                    MIRAGE
                </div>
                <div style={{ fontSize: 30, color: '#a1a1aa', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '-10px' }}>
                    Generative UI Engine
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
