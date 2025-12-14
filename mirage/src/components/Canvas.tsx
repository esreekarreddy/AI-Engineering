'use client';

import dynamic from 'next/dynamic';
import type { Editor } from 'tldraw';
import 'tldraw/tldraw.css';

// Dynamic import with SSR disabled for production compatibility
const TldrawComponent = dynamic(
  () => import('tldraw').then((mod) => mod.Tldraw),
  { 
    ssr: false, 
    loading: () => (
      <div className="flex items-center justify-center h-full w-full bg-[#09090b]">
        <div className="text-zinc-500 text-sm animate-pulse">Loading canvas...</div>
      </div>
    )
  }
);

interface CanvasProps {
  onMount: (editor: Editor) => void;
}

export function Canvas({ onMount }: CanvasProps) {
  return (
    <div className="absolute inset-0" style={{ width: '100%', height: '100%' }}>
      <TldrawComponent 
        persistenceKey="mirage-canvas" 
        onMount={onMount}
        hideUi={false}
      />
    </div>
  );
}
