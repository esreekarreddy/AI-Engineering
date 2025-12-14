'use client';

import dynamic from 'next/dynamic';
import type { Editor } from 'tldraw';

// Dynamic import with SSR disabled - must be in a Client Component file
const TldrawComponent = dynamic(
  () => import('tldraw').then((mod) => mod.Tldraw),
  { 
    ssr: false, 
    loading: () => (
      <div className="flex items-center justify-center h-full w-full bg-[#09090b]">
        <div className="text-zinc-500 text-sm">Loading canvas...</div>
      </div>
    )
  }
);

interface CanvasProps {
  onMount: (editor: Editor) => void;
}

export function Canvas({ onMount }: CanvasProps) {
  return (
    <div className="absolute inset-0">
      <TldrawComponent 
        persistenceKey="mirage-canvas" 
        onMount={onMount}
        hideUi={false}
      />
    </div>
  );
}
