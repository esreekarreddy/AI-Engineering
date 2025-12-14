'use client';

import { useState } from 'react';
import { Lock, X } from 'lucide-react';

interface AccessCodeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (code: string) => void;
    error?: string;
}

export function AccessCodeModal({ isOpen, onClose, onSubmit, error }: AccessCodeModalProps) {
    const [code, setCode] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (code.trim()) {
            onSubmit(code.trim());
        }
    };

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
                className="relative w-[400px] p-6 rounded-2xl border border-zinc-800 bg-zinc-950/95 backdrop-blur-xl shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
                            <Lock className="text-violet-400" size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Access Required</h2>
                            <p className="text-xs text-zinc-400">Enter your access code to continue</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-1.5 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            type="password"
                            value={code}
                            onChange={e => setCode(e.target.value)}
                            placeholder="Enter access code..."
                            className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
                            autoFocus
                        />
                        {error && (
                            <p className="mt-2 text-sm text-red-400">{error}</p>
                        )}
                    </div>
                    
                    <button
                        type="submit"
                        disabled={!code.trim()}
                        className="w-full py-3 bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-medium rounded-lg transition-colors"
                    >
                        Unlock
                    </button>
                </form>

                <p className="mt-4 text-xs text-zinc-500 text-center">
                    This protects against unauthorized API usage
                </p>
            </div>
        </div>
    );
}
