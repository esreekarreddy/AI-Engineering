'use client';

import { useState, useEffect, useRef } from 'react';
import { aiEngine, AIState } from '@/lib/ai/engine';
import { Send, Bot, User, Loader2, Download, Trash2, Cpu } from 'lucide-react';
import clsx from 'clsx';
import { useFileStore } from '@/lib/file-store';

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

  const handleDeleteModel = async () => {
    if (confirm('Are you sure you want to delete the cached model? This will clear 1.8GB from your browser storage.')) {
        await aiEngine.deleteCache();
        setAiState({ status: 'idle', progress: 0, text: '' });
    }
  };

  const handleSend = async () => {
    if (!input.trim() || aiState.status !== 'ready') return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);

    try {
      // Build context from current file
      const currentContext = selectedFile 
        ? `\nCurrent File (${selectedFile}):\n\`\`\`\n${fileContents[selectedFile]}\n\`\`\`\n` 
        : '';

      const systemPrompt: Message = {
        role: "system",
        content: "You are an expert coding assistant embedded in a web IDE. You are helpful, concise, and expert in Node.js/React. " + currentContext
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
  if (aiState.status === 'idle' || aiState.status === 'loading' && aiState.progress < 100) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-6 relative">
        <div className="w-20 h-20 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center relative">
            <div className="absolute inset-0 bg-[var(--accent-orange)] opacity-20 animate-pulse rounded-full" />
            <Bot size={40} className="text-[var(--accent-orange)] relative z-10" />
        </div>
        
        <div className="space-y-2">
            <h3 className="text-xl font-bold tracking-wide">SR CO-PILOT</h3>
            <p className="text-sm text-[var(--text-secondary)] max-w-[200px] mx-auto">
                Running <b>Phi-3 Mini</b> locally in your browser via WebGPU.
            </p>
        </div>
        
        {aiState.status === 'loading' ? (
          <div className="w-full max-w-xs space-y-3">
            <div className="flex justify-between text-xs text-[var(--text-secondary)] font-mono">
                <span>DOWNLOADING...</span>
                <span>{Math.round(aiState.progress)}%</span>
            </div>
            <div className="h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                <div 
                    className="h-full bg-[var(--accent-orange)] transition-all duration-300 relative overflow-hidden"
                    style={{ width: `${aiState.progress}%` }}
                >
                    <div className="absolute inset-0 bg-white/20 animate-[shimmer_1s_infinite]" />
                </div>
            </div>
            <p className="text-xs text-[var(--text-secondary)] font-mono truncate">{aiState.text}</p>
          </div>
        ) : (
          <div className="space-y-3">
              <button 
                onClick={handleInit}
                className="flex items-center gap-2 px-6 py-2.5 bg-[var(--accent-blue)] hover:bg-blue-600 text-white rounded font-bold text-sm transition-all shadow-lg hover:shadow-blue-500/25"
              >
                <Download size={18} />
                INITIALIZE ENGINE (1.8GB)
              </button>
              
              <div className="flex items-center justify-center gap-1.5 text-[10px] text-[var(--text-secondary)]">
                 <Cpu size={12} />
                 <span>REQUIRES WebGPU Capable Device</span>
              </div>
          </div>
        )}
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
            <button 
                onClick={handleDeleteModel}
                title="Delete Model from Cache"
                className="p-1.5 text-[var(--text-secondary)] hover:text-red-400 hover:bg-red-900/20 rounded transition-colors"
            >
                <Trash2 size={14} />
            </button>
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
