'use client';

import { X, Sparkles, Paintbrush, Cpu, MessageSquare, ExternalLink, Lock } from 'lucide-react';

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 flex items-center justify-center"
            style={{ zIndex: 99999 }}
        >
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose} 
            />
            
            {/* Modal */}
            <div 
                className="relative w-[500px] max-h-[85vh] overflow-y-auto p-6 rounded-2xl border border-zinc-800 bg-zinc-950/95 backdrop-blur-xl shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
                            <Sparkles className="text-violet-400" size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Mirage</h2>
                            <p className="text-xs text-zinc-400">Sketch → Code with Vision AI</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-1.5 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* How It Works */}
                <div className="space-y-3">
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">How It Works</h3>
                    
                    <FeatureRow 
                        icon={<Paintbrush size={16} />}
                        title="1. Draw"
                        desc="Sketch your UI using shapes, text, and colors"
                    />
                    <FeatureRow 
                        icon={<Cpu size={16} />}
                        title="2. Generate"
                        desc="Click 'Make It Real' — Vision AI analyzes and generates code"
                    />
                    <FeatureRow 
                        icon={<MessageSquare size={16} />}
                        title="3. Refine"
                        desc="Chat to tweak: 'Make the button blue', 'Add a header'"
                    />
                </div>

                {/* Access Code Info */}
                <div className="mt-5 p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
                    <div className="flex items-start gap-3">
                        <Lock size={18} className="text-amber-400 mt-0.5 shrink-0" />
                        <div>
                            <h4 className="text-sm font-medium text-amber-300">Access Code Required</h4>
                            <p className="text-xs text-zinc-400 mt-1">
                                To limit API usage on my personal Ollama key, this demo requires an access code. 
                                Code expires after 1 hour.
                            </p>
                            <p className="text-xs text-zinc-500 mt-2">
                                <strong>For local use:</strong> Add your own <code className="bg-black/50 px-1 rounded">OLLAMA_API_KEY</code> in .env.local and leave <code className="bg-black/50 px-1 rounded">MIRAGE_ACCESS_CODE</code> empty.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tech Details */}
                <div className="mt-5 p-4 bg-black/30 rounded-xl border border-zinc-800">
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Technical Details</h3>
                    <ul className="text-xs text-zinc-400 space-y-1.5">
                        <li>• <strong className="text-zinc-300">AI:</strong> Qwen3-VL 235B (Ollama Cloud)</li>
                        <li>• <strong className="text-zinc-300">Preview:</strong> WebContainer (in-browser Vite)</li>
                        <li>• <strong className="text-zinc-300">Canvas:</strong> tldraw vector graphics</li>
                    </ul>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-zinc-800">
                    <p className="text-xs text-zinc-500">
                        Built by <a href="https://sreekarreddy.com" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:underline">Sreekar Reddy</a>
                    </p>
                    <a 
                        href="https://github.com/esreekarreddy/AI-Engineering" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
                    >
                        <ExternalLink size={12} />
                        GitHub
                    </a>
                </div>
            </div>
        </div>
    );
}

function FeatureRow({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
    return (
        <div className="flex gap-3 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
            <div className="w-8 h-8 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 shrink-0">
                {icon}
            </div>
            <div>
                <h4 className="text-sm font-medium text-white">{title}</h4>
                <p className="text-xs text-zinc-400 mt-0.5">{desc}</p>
            </div>
        </div>
    );
}
