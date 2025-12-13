import { Send, Bot, User, Sparkles } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface Msg {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

interface ChatPanelProps {
    messages: Msg[];
    onSendMessage: (msg: string) => void;
    isGenerating: boolean;
}

export function ChatPanel({ messages, onSendMessage, isGenerating }: ChatPanelProps) {
    const [input, setInput] = useState('');
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = () => {
        if (!input.trim() || isGenerating) return;
        onSendMessage(input);
        setInput('');
    };

    return (
        <div className="flex flex-col h-full bg-zinc-900 border-t border-(--panel-border)">
            {/* Header */}
            <div className="h-10 px-4 border-b border-(--panel-border) flex items-center justify-between bg-(--panel-bg)">
                <span className="text-xs font-bold text-zinc-400 flex items-center gap-2">
                    <Sparkles size={14} className="text-violet-500" />
                    REFINE
                </span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                   <div className="text-center text-zinc-600 text-xs mt-4">
                       Ask Mirage to change colors, add features, or fix bugs.
                   </div>
                )}
                {messages.map((m, i) => {
                    if (m.role === 'system') {
                        return (
                            <div key={i} className="flex gap-2 text-[10px] font-mono text-zinc-500 items-start">
                                <span className="text-violet-500 shrink-0">$</span>
                                <span className="break-all">{m.content}</span>
                            </div>
                        );
                    }
                    return (
                        <div key={i} className={`flex gap-3 text-sm ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${m.role === 'assistant' ? 'bg-violet-900/50 text-violet-400' : 'bg-zinc-700 text-zinc-300'}`}>
                                {m.role === 'assistant' ? <Bot size={14}/> : <User size={14}/>}
                            </div>
                            <div className={`px-3 py-2 rounded max-w-[85%] ${m.role === 'assistant' ? 'bg-zinc-800 text-zinc-300' : 'bg-violet-600 text-white'}`}>
                                {m.content}
                            </div>
                        </div>
                    );
                })}
                <div ref={endRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-(--panel-border) bg-(--panel-bg)">
                <div className="flex gap-2">
                    <input 
                        className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
                        placeholder="Make the button blue..."
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                    />
                    <button 
                        onClick={handleSend}
                        disabled={isGenerating || !input.trim()}
                        className="p-1.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 rounded text-white transition-colors"
                    >
                        <Send size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
