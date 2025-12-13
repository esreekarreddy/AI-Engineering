'use client';

import { useState, useEffect, useRef } from 'react';
import { aiEngine, AIState } from '@/lib/ai/engine';
import { Send, Bot, User, Loader2, Download, Cpu } from 'lucide-react';
import clsx from 'clsx';
import { useFileStore } from '@/lib/file-store';
import { useEditorStore } from '@/lib/editor-store';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I am your local AI system. Initialize me to start coding.' }
  ]);
  const [input, setInput] = useState('');
  const [aiState, setAiState] = useState<AIState>({ status: 'idle', progress: 0, text: '' });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { selectedFile, fileContents } = useFileStore();
  const { cursorPosition, selection } = useEditorStore();

  useEffect(() => {
    // Check if model is already cached/loaded on mount
    const checkCache = async () => {
       // Logic to check cache could be here, but engine handles it via state updates
    };
    checkCache();
    return aiEngine.subscribe(setAiState);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInit = async () => {
    await aiEngine.init();
  };


  const handleSend = async () => {
    if (!input.trim() || aiState.status !== 'ready') return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);

    try {
      // Build context from current file
      let contextInfo = `\nContext Information:\n`;
      
      if (selectedFile && fileContents[selectedFile]) {
          const content = fileContents[selectedFile];
          contextInfo += `Active File: ${selectedFile}\n`;
          contextInfo += `File Content:\n\`\`\`javascript\n${content}\n\`\`\`\n`;
          
          if (cursorPosition) {
              contextInfo += `Cursor Position: Line ${cursorPosition.lineNumber}, Column ${cursorPosition.column}\n`;
          }
          
          if (selection) {
              contextInfo += `Currently Selected Code:\n\`\`\`\n${selection}\n\`\`\`\n`;
              contextInfo += `(User is asking specifically about this selection)\n`;
          }
      } else {
          contextInfo += `No active file selected.\n`;
      }

      const systemPrompt: Message = {
        role: "system",
        content: `You are an expert coding assistant embedded in a web IDE. 
You are helpful, concise, and expert in Node.js/React.
${contextInfo}
When answering, assume the user is asking about the Active File unless specified otherwise.
If the cursor position is provided, pay attention to the code around that line.`
      };

      const response = await aiEngine.completion([
        systemPrompt,
        ...messages.filter(m => m.role !== 'system'),
        { role: 'user', content: userMsg }
      ]);

      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error generating response.' }]);
    }
  };

  // Show Download Screen if NOT ready
  // Show Download Screen if NOT ready
  if (aiState.status === 'idle' || aiState.status === 'loading' && aiState.progress < 100) {
    return (
      <div className="h-full overflow-y-auto bg-[var(--bg-secondary)]">
        <div className="min-h-full flex flex-col items-center justify-center p-6 text-center">
        <div className="w-full max-w-[280px] space-y-6">
          {/* Logo */}
          <div className="w-20 h-20 rounded-2xl bg-white shadow-sm border border-[var(--bg-tertiary)] flex items-center justify-center relative mx-auto">
              <div className="absolute inset-0 bg-orange-500/10 rounded-2xl" />
              <Bot size={36} className="text-orange-600 relative z-10" />
          </div>
          
          {/* Title */}
          <div className="space-y-2">
              <h3 className="text-lg font-bold tracking-tight text-gray-900">SR CO-PILOT</h3>
              <p className="text-sm text-gray-600 leading-relaxed max-w-[240px] mx-auto">
                  Running <span className="text-gray-900 font-semibold">Phi-3 Mini</span> locally in your browser via WebGPU.
              </p>
          </div>

          {/* Trust Indicators */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-center">
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5 uppercase tracking-wide">
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      Verified Model
                  </span>
              </div>
              
              <div className="space-y-1">
                <a 
                    href="https://huggingface.co/mlc-ai/Phi-3-mini-4k-instruct-q4f16_1-MLC" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[11px] text-blue-600 hover:text-blue-800 hover:underline flex items-center justify-center gap-1.5 font-mono font-medium"
                >
                    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                    <span className="truncate max-w-[180px]">huggingface.co/mlc-ai/Phi-3...</span>
                </a>
                <p className="text-[10px] text-gray-400 font-medium">
                    Open-source model by Microsoft Research
                </p>
              </div>
          </div>
          
          {aiState.status === 'loading' ? (
            <div className="space-y-3 pt-2">
              <div className="flex justify-between text-xs text-gray-600 font-medium font-mono">
                  <span>DOWNLOADING</span>
                  <span className="text-gray-900">{Math.round(aiState.progress)}%</span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                  <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300 relative overflow-hidden rounded-full"
                      style={{ width: `${aiState.progress}%` }}
                  >
                      <div className="absolute inset-0 bg-white/30 animate-[shimmer_1s_infinite]" />
                  </div>
              </div>
              <p className="text-[10px] text-gray-500 font-mono truncate">{aiState.text}</p>
            </div>
          ) : (
            <div className="space-y-3 pt-2">
                <button 
                  onClick={handleInit}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 hover:bg-black text-white rounded-xl font-bold text-sm transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
                >
                  <Download size={18} />
                  <span>Initialize Engine</span>
                  <span className="text-gray-400 text-xs font-normal">(1.8GB)</span>
                </button>
                
                <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-500 font-medium">
                   <Cpu size={12} />
                   <span>Requires WebGPU Capable Device</span>
                </div>
            </div>
          )}

          {/* Info Link */}
          <div className="pt-4 border-t border-gray-200/50">
            <a 
                href="https://webllm.mlc.ai/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[10px] text-gray-400 hover:text-blue-600 flex items-center justify-center gap-1.5 transition-colors font-medium"
            >
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 16v-4"></path>
                    <path d="M12 8h.01"></path>
                </svg>
                What is WebLLM?
            </a>
          </div>
        </div>
      </div>
    </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[var(--bg-secondary)] border-l border-[var(--bg-tertiary)]">
      <div className="p-3 border-b border-[var(--bg-tertiary)] flex items-center justify-between bg-[var(--bg-secondary)]">
        <div className="flex items-center gap-2">
            <Bot size={16} className="text-[var(--accent-orange)]" />
            <span className="font-bold text-sm tracking-wide">CO-PILOT</span>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-[10px] bg-[var(--accent-green)]/20 text-[var(--accent-green)] border border-[var(--accent-green)]/30 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />
                ONLINE
            </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans">
        {messages.map((m, i) => (
          <div key={i} className={clsx("flex gap-3 text-sm group", m.role === 'user' && "flex-row-reverse")}>
            <div className={clsx(
                "w-8 h-8 rounded shrink-0 flex items-center justify-center shadow-sm",
                m.role === 'assistant' ? "bg-[var(--bg-tertiary)] border border-[var(--bg-tertiary)]" : "bg-[var(--accent-blue)] text-white"
            )}>
                {m.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
            </div>
            <div className={clsx(
                "p-3 rounded-lg max-w-[85%] whitespace-pre-wrap leading-relaxed shadow-sm",
                m.role === 'assistant' 
                    ? "bg-[var(--bg-primary)] border border-[var(--bg-tertiary)]" 
                    : "bg-[var(--accent-blue)] text-white"
            )}>
                {m.content}
            </div>
          </div>
        ))}
        {aiState.status === 'generating' && (
             <div className="flex gap-3 text-sm animate-pulse">
                <div className="w-8 h-8 rounded shrink-0 bg-[var(--bg-tertiary)] flex items-center justify-center">
                    <Bot size={16} />
                </div>
                <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs pt-2">
                    <Loader2 size={12} className="animate-spin" />
                    <span>Processing context...</span>
                </div>
             </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-[var(--bg-tertiary)] bg-[var(--bg-primary)]/50">
        <div className="flex gap-2">
            <input 
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && aiState.status === 'ready' && handleSend()}
                placeholder="Ask Co-Pilot about your code..."
                disabled={aiState.status !== 'ready'}
                className="flex-1 bg-[var(--bg-secondary)] border border-[var(--bg-tertiary)] rounded px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--accent-blue)] disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-[var(--text-secondary)]/50"
            />
            <button 
                onClick={handleSend}
                disabled={aiState.status !== 'ready' || !input.trim()}
                className="p-2.5 bg-[var(--accent-blue)] text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
            >
                <Send size={16} />
            </button>
        </div>
        <div className="px-1 pt-2 flex justify-between items-center text-[10px] text-[var(--text-secondary)] font-mono opacity-60">
            <span>Phi-3 Mini 4k Instruct</span>
            <span>{aiState.status === 'ready' ? 'READY' : 'BUSY'}</span>
        </div>
      </div>
    </div>
  );
}
