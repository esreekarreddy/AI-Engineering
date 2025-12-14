'use client';

import dynamic from 'next/dynamic';
import type { Editor } from 'tldraw';
import 'tldraw/tldraw.css';
import { useEffect } from 'react';

console.log('[Canvas] Module loaded');

// Dynamic import with SSR disabled - must be in a Client Component file
const TldrawComponent = dynamic(
  () => {
    console.log('[Canvas] Dynamic import starting...');
    return import('tldraw').then((mod) => {
      console.log('[Canvas] tldraw module loaded successfully:', Object.keys(mod));
      return mod.Tldraw;
    }).catch((err) => {
      console.error('[Canvas] tldraw import FAILED:', err);
      throw err;
    });
  },
  { 
    ssr: false, 
    loading: () => {
      console.log('[Canvas] Showing loading state...');
      return (
        <div className="flex items-center justify-center h-full w-full bg-[#09090b]">
          <div className="text-zinc-500 text-sm animate-pulse">Loading canvas...</div>
        </div>
      );
    }
  }
);

interface CanvasProps {
  onMount: (editor: Editor) => void;
}

export function Canvas({ onMount }: CanvasProps) {
  console.log('[Canvas] Canvas component rendering');

  useEffect(() => {
    console.log('[Canvas] Canvas component mounted (client-side)');
    return () => console.log('[Canvas] Canvas component unmounting');
  }, []);

  const handleMount = (editor: Editor) => {
    console.log('[Canvas] Tldraw editor mounted!', editor);
    onMount(editor);
  };

  console.log('[Canvas] About to render TldrawComponent');
  
  return (
    <div className="absolute inset-0" style={{ width: '100%', height: '100%' }}>
      <TldrawComponent 
        persistenceKey="mirage-canvas" 
        onMount={handleMount}
        hideUi={false}
      />
    </div>
  );
}
