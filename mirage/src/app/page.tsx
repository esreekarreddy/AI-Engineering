'use client';

import { 
  PanelResizeHandle, 
  Panel, 
  PanelGroup 
} from "react-resizable-panels";
import { Tldraw, Editor } from 'tldraw';
import 'tldraw/tldraw.css';
import { Wand2, Loader2, RefreshCw } from 'lucide-react';
import { useState, useEffect } from "react";
import { useWebContainer } from "@/hooks/use-webcontainer";
import { BASE_FILES } from "@/lib/templates";
import { writeFile, installDependencies, runDev } from "@/lib/webcontainer";
import { aiEngine } from "@/lib/ai/engine";
import { sceneToPrompt } from "@/lib/ai/prompt";
import { MirageLogo } from "@/components/ui/Logo";
import { ChatPanel } from "@/components/ui/ChatPanel";
import { ModelManager } from "@/components/ui/ModelManager";
import { CyberButton } from "@/components/ui/CyberButton";

export default function Home() {
  const [editor, setEditor] = useState<Editor | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { instance, previewUrl } = useWebContainer();
  // aiStatus state removed as it is handled in ModelManager
  
  // Chat State (now includes System Logs)
  const [messages, setMessages] = useState<{role: 'user' | 'assistant' | 'system', content: string}[]>([]);

  const addLog = (msg: string) => {
      // Strip ANSI codes

      const cleanMsg = msg.replace(/\x1B\[\d+;?\d*m/g, '') // Colors
                          .replace(/\x1B\[\d*[A-Z]/g, '')   // Cursor moves
                          .replace(/[^\x20-\x7E\n]/g, '')   // Non-printable
                          .trim();

      if (!cleanMsg) return;
      
      // Debounce/Filter progress bars (keywords: [1G, [K, etc handled by regex above, but we filter spam)
      setMessages(prev => {
          const last = prev[prev.length - 1];
          // If the last message is very similar or it's a progress update, replace it to avoid flood
          if (last?.role === 'system' && (cleanMsg.includes('install') || cleanMsg.includes('dev'))) {
              return [...prev.slice(0, -1), { role: 'system', content: cleanMsg }];
          }
          return [...prev, { role: 'system', content: cleanMsg }];
      });
  };

  // Boot Sequence
  useEffect(() => {
    if (instance && !previewUrl) {
      const boot = async () => {
        addLog("Initializing WebContainer FileSystem...");
        await instance.mount(BASE_FILES);
        
        addLog("Installing dependencies (this may take a moment)...");
        await installDependencies((data) => addLog(data));
        
        addLog("Starting Dev Server...");
        await runDev((data) => addLog(data));
      };
      
      boot().catch(err => {
        console.error(err);
        addLog(`Error: ${err.message}`);
      });
    }
  }, [instance, previewUrl]);

  // AI Init removed (Manual via ModelManager)

  const extractCodebox = (text: string) => {
      if (text.includes('```jsx')) {
          return text.split('```jsx')[1].split('```')[0];
      } else if (text.includes('```')) {
          return text.split('```')[1].split('```')[0];
      }
      return text;
  };

  const handleGenerate = async () => {
    if (!editor || !instance) return;
    
    setIsGenerating(true);
    addLog("Reading Canvas...");
    
    try {
        const shapes = editor.getCurrentPageShapes();
        if (shapes.length === 0) {
            alert("Draw something first!");
            setIsGenerating(false);
            return;
        }

        const prompt = sceneToPrompt(shapes);
        addLog("Thinking...");
        
        const code = await aiEngine.generateCode(prompt);
        addLog("Code generated. Writing to file...");
        
        const cleanCode = extractCodebox(code);
        await writeFile('src/App.jsx', cleanCode);
        addLog("Updated App.jsx. Hot-reload should trigger.");
        
        // Add implicit message to chat
        setMessages(prev => [...prev, 
            { role: 'assistant', content: 'I generated the UI based on your sketch. How does it look?' }
        ]);

    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        addLog(`Error: ${errorMessage}`);
    } finally {
        setIsGenerating(false);
    }
  };

  const handleRefine = async (instruction: string) => {
      if (!instance) return;
      
      setMessages(prev => [...prev, { role: 'user', content: instruction }]);
      setIsGenerating(true);
      addLog(`Refining: "${instruction}"...`);
      
      try {
          // Read current code
          const currentCode = await instance.fs.readFile('src/App.jsx', 'utf-8');
          
          const newCode = await aiEngine.refineCode(currentCode, instruction);
          addLog("Refinement complete. Updating file...");
          
          const cleanCode = extractCodebox(newCode);
          await writeFile('src/App.jsx', cleanCode);
          
          setMessages(prev => [...prev, { role: 'assistant', content: 'Updated! Anything else?' }]);
      } catch (e) {
          const errorMessage = e instanceof Error ? e.message : String(e);
          addLog(`Error: ${errorMessage}`);
          setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I failed to refine the code.' }]);
      } finally {
          setIsGenerating(false);
      }
  };

  return (
    <main className="h-screen w-screen bg-[var(--background)] flex flex-col text-white overflow-hidden relative selection:bg-violet-500/30">
      
      {/* Ambient Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="h-14 border-b border-white/5 bg-black/20 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-50">
        <div className="flex items-center gap-3 select-none group cursor-default">
           <div className="relative">
              <div className="absolute inset-0 bg-violet-600 blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
              <MirageLogo size={24} className="relative z-10 text-white" />
           </div>
           <div className="flex flex-col">
              <h1 className="font-bold tracking-[0.2em] text-sm leading-none text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">MIRAGE</h1>
              <span className="text-[10px] text-zinc-500 tracking-wider font-mono">GENERATIVE ENGINE v0.3</span>
           </div>
        </div>
        
        <div className="flex items-center gap-6">
             <ModelManager />

             <CyberButton 
                onClick={handleGenerate}
                disabled={isGenerating || !instance}
                variant="primary"
                size="sm"
             >
                {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                MAKE IT REAL
            </CyberButton>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 overflow-hidden relative z-10 p-2">
        <PanelGroup direction="horizontal" className="rounded-2xl border border-white/5 overflow-hidden bg-black/40 shadow-2xl backdrop-blur-sm">
            
            {/* Left: Canvas (Input) */}
            <Panel defaultSize={45} minSize={20} maxSize={70} className="relative bg-[#09090b]">
                <div className="absolute inset-0 bg-[radial-gradient(#1f1f22_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />
                <Tldraw 
                    persistenceKey="mirage-canvas" 
                    onMount={setEditor}
                    hideUi={false}
                    className="z-10"
                />
            </Panel>

            <PanelResizeHandle className="w-1 bg-[#18181b] hover:bg-violet-600 transition-colors flex items-center justify-center group focus:outline-none">
                <div className="h-8 w-1 bg-zinc-700 rounded-full group-hover:bg-white transition-colors" />
            </PanelResizeHandle>

            {/* Right: Preview & Chat */}
            <Panel defaultSize={55} minSize={30}>
                <PanelGroup direction="vertical">
                    
                    {/* Top: Preview */}
                    <Panel defaultSize={70} minSize={30} className="flex flex-col bg-[#0c0c0e]">
                        {/* Browser Toolbar */}
                        <div className="h-10 border-b border-white/5 flex items-center px-4 bg-[#121214] justify-between select-none shrink-0">
                            <div className="flex items-center gap-2 group p-1.5 px-3 rounded-lg bg-black/40 border border-white/5 hover:border-violet-500/30 transition-colors w-full max-w-sm">
                                <span className="text-zinc-500">🔒</span>
                                <span className="text-xs font-mono text-zinc-400 group-hover:text-violet-200 transition-colors">preview://localhost:3000</span>
                            </div>
                            <button 
                                onClick={() => {
                                    const iframe = document.querySelector('iframe');
                                    if(iframe) iframe.src = iframe.src;
                                }}
                                className="p-1.5 hover:bg-white/10 rounded-md text-zinc-400 transition-colors" 
                                title="Refresh Preview"
                            >
                                <RefreshCw size={14} />
                            </button>
                        </div>

                        {/* Iframe Container - White bg for actual preview correctness */}
                        <div className="flex-1 flex items-center justify-center bg-zinc-950 relative overflow-hidden">
                            {previewUrl ? (
                                <iframe 
                                    src={previewUrl}
                                    className="w-full h-full border-0 bg-white"
                                    title="Mirage Preview"
                                />
                            ) : (
                                <div className="flex flex-col items-center gap-4 text-zinc-500/50">
                                    <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center bg-white/5">
                                        <Loader2 className="animate-spin text-violet-500" size={20} />
                                    </div>
                                    <span className="text-xs font-mono tracking-widest uppercase">Initializing Runtime</span>
                                </div>
                            )}
                        </div>
                    </Panel>
                    
                    <PanelResizeHandle className="h-1 bg-[#18181b] hover:bg-violet-600 transition-colors" />

                    {/* Bottom: Chat Panel */}
                    <Panel defaultSize={30} minSize={20} className="bg-[#050505]">
                        <ChatPanel 
                            messages={messages} 
                            onSendMessage={handleRefine} 
                            isGenerating={isGenerating} 
                        />
                    </Panel>

                </PanelGroup>
            </Panel>

        </PanelGroup>
      </div>
    </main>
  );
}
