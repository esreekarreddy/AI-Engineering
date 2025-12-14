'use client';

import { 
  PanelResizeHandle, 
  Panel, 
  PanelGroup 
} from "react-resizable-panels";
import type { Editor } from 'tldraw';
import 'tldraw/tldraw.css';
import { Wand2, Loader2, RefreshCw, HelpCircle, Download } from 'lucide-react';
import { useState, useEffect } from "react";
import { useWebContainer } from "@/hooks/use-webcontainer";
import { BASE_FILES } from "@/lib/templates";
import { writeFile, installDependencies, runDev } from "@/lib/webcontainer";
import { aiEngine } from "@/lib/ai/engine";
import { MirageLogo } from "@/components/ui/Logo";
import { ChatPanel } from "@/components/ui/ChatPanel";
import { ModelManager } from "@/components/ui/ModelManager";
import { CyberButton } from "@/components/ui/CyberButton";
import { HelpModal } from "@/components/ui/HelpModal";
import { AccessCodeModal } from "@/components/ui/AccessCodeModal";
import { Canvas } from "@/components/Canvas";


export default function Home() {
  const [editor, setEditor] = useState<Editor | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { instance, previewUrl } = useWebContainer();
  // aiStatus state removed as it is handled in ModelManager
  
  // Chat State (now includes System Logs)
  const [messages, setMessages] = useState<{role: 'user' | 'assistant' | 'system', content: string}[]>([]);
  const [showHelp, setShowHelp] = useState(false);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [accessCode, setAccessCode] = useState<string | null>(null);
  const [accessError, setAccessError] = useState<string | undefined>();

  // Load access code from localStorage on mount (with 1-hour expiry)
  useEffect(() => {
      const savedData = localStorage.getItem('mirage_access');
      if (savedData) {
          try {
              const { code, timestamp } = JSON.parse(savedData);
              const ONE_HOUR = 60 * 60 * 1000; // 1 hour in ms
              const isExpired = Date.now() - timestamp > ONE_HOUR;
              
              if (isExpired) {
                  localStorage.removeItem('mirage_access');
                  setAccessCode(null);
              } else {
                  setAccessCode(code);
              }
          } catch {
              localStorage.removeItem('mirage_access');
          }
      }
  }, []);

  const addLog = (msg: string) => {
      // Strip ANSI codes and terminal noise
      let cleanMsg = msg
          .replace(/\x1B\[[0-9;]*[A-Za-z]/g, '')  // ANSI escape sequences
          .replace(/[\x00-\x1F\x7F]/g, '')         // Control characters
          .trim();
      
      // Filter out spinner characters and short noise
      const spinnerChars = ['\\', '|', '/', '-', '$'];
      const isSpinner = cleanMsg.split('').every(c => spinnerChars.includes(c) || c === ' ');
      if (!cleanMsg || isSpinner || cleanMsg.length < 3) {
          return;
      }
      
      // Remove leading/trailing $ prompts
      cleanMsg = cleanMsg.replace(/^\$\s*/, '').replace(/\s*\$$/, '').trim();
      if (!cleanMsg) return;
      
      setMessages(prev => {
          const last = prev[prev.length - 1];
          // Avoid duplicate messages
          if (last?.role === 'system' && last.content === cleanMsg) {
              return prev;
          }
          // Replace progress messages to avoid flood
          if (last?.role === 'system' && 
              (cleanMsg.includes('added') || cleanMsg.includes('packages') || cleanMsg.includes('hmr'))) {
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
    
    // Check AI connection first
    const aiState = aiEngine.getState();
    if (aiState.status === 'disconnected' || aiState.status === 'error') {
        setMessages(prev => [...prev, 
            { role: 'assistant', content: '⚠️ Ollama is not connected. Please start Ollama first:\n\n1. Run: `ollama serve`\n2. Click the connection button to retry' }
        ]);
        return;
    }

    // Check for access code - show modal if not set
    if (!accessCode) {
        setShowAccessModal(true);
        return;
    }
    
    setIsGenerating(true);
    addLog("Reading Canvas...");
    
    try {
        const shapes = editor.getCurrentPageShapes();
        if (shapes.length === 0) {
            setMessages(prev => [...prev, 
                { role: 'assistant', content: '✏️ Draw something on the canvas first, then click "Make It Real"!' }
            ]);
            setIsGenerating(false);
            return;
        }

        addLog("📸 Capturing canvas screenshot...");
        
        // Export canvas as SVG, then convert to PNG base64
        const shapeIds = shapes.map(s => s.id);
        const svg = await editor.getSvgElement(shapeIds, {
            background: true,
            padding: 20,
        });
        
        if (!svg) {
            throw new Error("Failed to export canvas");
        }

        // Convert SVG to PNG using canvas (full resolution for better AI quality)
        const svgData = new XMLSerializer().serializeToString(svg.svg);
        const img = new Image();
        const canvas = document.createElement('canvas');
        canvas.width = svg.width;
        canvas.height = svg.height;
        
        await new Promise<void>((resolve, reject) => {
            img.onload = () => {
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.fillStyle = '#ffffff'; // White background
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                }
                resolve();
            };
            img.onerror = reject;
            img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
        });
        
        // Get base64 PNG (without data:image/png;base64, prefix)
        const base64Image = canvas.toDataURL('image/png').split(',')[1];
        
        addLog(`🧠 Sending ${canvas.width}x${canvas.height} image to vision model...`);
        const code = await aiEngine.generateFromImage(base64Image, accessCode);
        
        addLog("Code generated. Writing to file...");
        
        const cleanCode = extractCodebox(code);
        await writeFile('src/App.jsx', cleanCode);
        addLog("Updated App.jsx. Hot-reload triggered.");
        
        // Add implicit message to chat
        setMessages(prev => [...prev, 
            { role: 'assistant', content: '✨ I generated the UI based on your sketch. How does it look?' }
        ]);

    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        
        // Check if this is an auth error
        if (errorMessage.includes('Invalid access code')) {
            localStorage.removeItem('mirage_access');
            setAccessCode(null);
            setAccessError('Invalid access code. Please try again.');
            setShowAccessModal(true);
        } else {
            addLog(`Error: ${errorMessage}`);
            setMessages(prev => [...prev, 
                { role: 'assistant', content: `❌ Generation failed: ${errorMessage}` }
            ]);
        }
    } finally {
        setIsGenerating(false);
    }
  };

  // Handle access code submission - verify with server first
  const handleAccessCodeSubmit = async (code: string) => {
      const isValid = await aiEngine.verifyAccessCode(code);
      if (isValid) {
          setAccessCode(code);
          // Save with timestamp for 1-hour expiry
          localStorage.setItem('mirage_access', JSON.stringify({
              code,
              timestamp: Date.now()
          }));
          setAccessError(undefined);
          setShowAccessModal(false);
          // Trigger generation after modal closes
          setTimeout(() => handleGenerate(), 100);
      } else {
          setAccessError('Invalid access code. Please try again.');
      }
  };

  const handleRefine = async (instruction: string) => {
      if (!instance) return;
      
      // Check AI connection first
      const aiState = aiEngine.getState();
      if (aiState.status === 'disconnected' || aiState.status === 'error') {
          setMessages(prev => [...prev, 
              { role: 'user', content: instruction },
              { role: 'assistant', content: '⚠️ Ollama is not connected. Start `ollama serve` and reconnect.' }
          ]);
          return;
      }
      
      setMessages(prev => [...prev, { role: 'user', content: instruction }]);
      setIsGenerating(true);
      addLog(`Refining: "${instruction}"...`);
      
      try {
          // Read current code
          const currentCode = await instance.fs.readFile('src/App.jsx', 'utf-8');
          
          const newCode = await aiEngine.refineCode(currentCode, instruction, accessCode || '');
          addLog("Refinement complete. Updating file...");
          
          const cleanCode = extractCodebox(newCode);
          await writeFile('src/App.jsx', cleanCode);
          
          setMessages(prev => [...prev, { role: 'assistant', content: '✅ Updated! Anything else?' }]);
      } catch (e) {
          const errorMessage = e instanceof Error ? e.message : String(e);
          addLog(`Error: ${errorMessage}`);
          setMessages(prev => [...prev, { role: 'assistant', content: `❌ Refinement failed: ${errorMessage}` }]);
      } finally {
          setIsGenerating(false);
      }
  };

  // Download generated code
  const handleDownload = async () => {
      if (!instance) return;
      
      try {
          const code = await instance.fs.readFile('src/App.jsx', 'utf-8');
          const blob = new Blob([code], { type: 'text/javascript' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'App.jsx';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          addLog('✅ Code downloaded!');
      } catch {
          addLog('❌ No code to download yet.');
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
              <span className="text-[10px] text-zinc-500 tracking-wider font-mono">GENERATIVE ENGINE</span>
           </div>
        </div>
        
        <div className="flex items-center gap-4">
             <button
                 onClick={() => setShowHelp(true)}
                 className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors"
                 title="About Mirage"
             >
                 <HelpCircle size={18} />
             </button>
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
                <Canvas onMount={setEditor} />
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
                            <button 
                                onClick={handleDownload}
                                className="p-1.5 hover:bg-white/10 rounded-md text-zinc-400 hover:text-emerald-400 transition-colors" 
                                title="Download App.jsx"
                            >
                                <Download size={14} />
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

      {/* Help Modal */}
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
      
      {/* Access Code Modal */}
      <AccessCodeModal 
          isOpen={showAccessModal} 
          onClose={() => setShowAccessModal(false)}
          onSubmit={handleAccessCodeSubmit}
          error={accessError}
      />
    </main>
  );
}
