'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useShell } from '@/hooks/use-shell';
import { Cpu, Wifi, Play } from 'lucide-react';
import FileTree from '@/components/filesystem/FileTree';
import { useState } from 'react';
import clsx from 'clsx';
import { useFileStore } from '@/lib/file-store';
import { useModalStore } from '@/lib/modal-store';
import BootLoader from '@/components/os/BootLoader';

// Dynamic imports to avoid SSR issues with heavy client-side libs
const CodeEditor = dynamic(() => import('@/components/editor/CodeEditor'), { ssr: false });
const Terminal = dynamic(() => import('@/components/terminal/Terminal'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-[#0D0E11] animate-pulse" />
});

const AIChat = dynamic(() => import('@/components/ai/AIChat'), { ssr: false });
const ModalRenderer = dynamic(() => import('@/components/ui/Modal'), { ssr: false });
const ResourceMonitor = dynamic(() => import('@/components/os/ResourceMonitor'), { ssr: false });

export default function Home() {
  const { startShell, runCommand } = useShell();
  const { selectedFile, saveFile } = useFileStore();
  const { openModal } = useModalStore();
  const [booted, setBooted] = useState(false);
  const [showAi, setShowAi] = useState(false);
  const [terminals, setTerminals] = useState<string[]>(['main']);
  const [activeTerminal, setActiveTerminal] = useState('main');

  const openResources = () => {
    openModal('custom', {
      title: 'SYSTEM RESOURCES',
      content: <ResourceMonitor />
    });
  };

  return (
    <main className="h-screen w-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)] font-mono overflow-hidden">
      {!booted && <BootLoader onBootComplete={() => {
        setBooted(true);
        useFileStore.getState().refreshFileTree();
      }} />}
      <ModalRenderer />
      
      {/* Header / Status Bar */}
      <header className="h-14 border-b border-[var(--bg-tertiary)] bg-[var(--bg-secondary)] flex items-center justify-between px-4 select-none">
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 flex items-center justify-center">
          <div className="absolute inset-0 bg-[var(--accent-orange)] opacity-20 animate-pulse rounded-full" />
             {/* Ensure logo path is correct and cache is cleared if needed. Next.js might be caching the old image if names are same. */}
             <Image src="/logo.png" alt="Logo" width={24} height={24} className="object-contain relative z-10" unoptimized />
          </div>
          <div className="flex flex-col">
              <span className="font-bold tracking-widest text-sm leading-none">SR TERMINAL</span>
              <span className="text-[10px] text-[var(--text-secondary)] tracking-wider">WEB OPERATING SYSTEM</span>
          </div>
        </div>
        
        {/* Central Actions */}
        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-2">
            <button 
                onClick={async () => {
                   if (!selectedFile) return;
                   // FIX: Save file before running
                   await saveFile(selectedFile);
                   runCommand(`node ${selectedFile.split('/').pop()}\n`, activeTerminal); 
                }}
                disabled={!selectedFile || !booted}
                className="flex items-center gap-2 px-4 py-1.5 bg-[var(--accent-green)] text-black rounded font-bold text-xs hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
                <Play size={14} fill="currentColor" />
                RUN PREVIEW
            </button>
        </div>

        {/* Stats / Controls */}
        <div className="flex items-center gap-4">
            <button 
                onClick={openResources}
                className="flex items-center gap-2 text-xs text-[var(--text-secondary)] hover:text-[var(--accent-blue)] transition-colors"
                title="System Resources"
            >
                <Cpu size={14} />
                <span className="hidden md:inline">SYSTEM: ONLINE</span>
            </button>
            <div className="h-4 w-[1px] bg-[var(--bg-tertiary)]" />
            <button 
                onClick={() => setShowAi(!showAi)}
                className={clsx(
                    "flex items-center gap-2 text-xs px-3 py-1.5 rounded transition-all border",
                    showAi 
                        ? "bg-[var(--accent-blue)] text-white border-transparent" 
                        : "border-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:border-[var(--accent-blue)]"
                )}
            >
                <Wifi size={14} />
                <span>AI NETLNK</span>
            </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 border-r border-[var(--bg-tertiary)] bg-[var(--bg-secondary)] flex flex-col">
          <FileTree />
        </div>

        {/* Editor Area */}
        <div className="flex-1 relative">
          <CodeEditor />
        </div>

        {/* AI Panel */}
        {showAi && (
            <div className="w-80 border-l border-[var(--bg-tertiary)] bg-[var(--bg-secondary)]">
                <AIChat />
            </div>
        )}
      </div>

      {/* Terminal Panel */}
      <div className="h-64 mt-auto border-t border-[var(--bg-tertiary)] bg-[var(--terminal-bg)] flex flex-col transition-all duration-300">
         {/* Tabs */}
         <div className="flex items-center bg-[var(--bg-secondary)] border-b border-[var(--bg-tertiary)]">
            {terminals.map((id) => (
                <button
                    key={id}
                    onClick={() => setActiveTerminal(id)}
                    className={clsx(
                        "px-3 py-1 text-[10px] font-bold uppercase tracking-wider border-r border-[var(--bg-tertiary)] flex items-center gap-2 transition-colors",
                         activeTerminal === id 
                            ? "bg-[var(--terminal-bg)] text-[var(--accent-orange)]" 
                            : "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
                    )}
                >
                    <span className="opacity-50">#</span> {id}
                    {terminals.length > 1 && (
                        <span 
                            onClick={(e) => {
                                e.stopPropagation();
                                const newTerms = terminals.filter(t => t !== id);
                                setTerminals(newTerms);
                                if (activeTerminal === id) setActiveTerminal(newTerms[0]);
                            }}
                            className="hover:text-red-400"
                        >
                            ×
                        </span>
                    )}
                </button>
            ))}
            <button 
                onClick={() => {
                    const newId = `term-${terminals.length + 1}`;
                    setTerminals([...terminals, newId]);
                    setActiveTerminal(newId);
                }}
                className="px-2 py-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
                title="New Terminal"
            >
                +
            </button>
         </div>

         {/* Terminals Container */}
         <div className="flex-1 relative p-2">
            {terminals.map((id) => (
                <div 
                    key={id} 
                    className={clsx(
                        "absolute inset-2 rounded overflow-hidden border border-[var(--bg-tertiary)] bg-black/50 backdrop-blur-sm",
                        activeTerminal === id ? "z-10 opacity-100 pointer-events-auto" : "z-0 opacity-0 pointer-events-none"
                    )}
                >
                     <div className="absolute top-2 right-2 z-20 pointer-events-none">
                        <div className="bg-[var(--accent-orange)] text-[var(--terminal-bg)] text-[10px] font-bold px-1.5 py-0.5 rounded opacity-50">
                            JSH
                        </div>
                     </div>
                     <Terminal onTerminalReady={(term) => startShell(id, term)} />
                </div>
            ))}
         </div>
      </div>
    </main>
  );
}
