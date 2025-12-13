import { aiEngine, AIState } from "@/lib/ai/engine";
import { useEffect, useState } from "react";
import { GlassPanel } from "./GlassPanel";
import { CyberButton } from "./CyberButton";
import { Zap, Server, AlertCircle, RefreshCw } from "lucide-react";
import clsx from "clsx";

export function ModelManager() {
    const [state, setState] = useState<AIState>(aiEngine.getState());
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        return aiEngine.subscribe(setState);
    }, []);

    // Auto-connect on mount
    useEffect(() => {
        aiEngine.init();
    }, []);

    const isConnected = state.status === 'connected' || state.status === 'generating';


    return (
        <>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={clsx(
                    "flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-full border transition-all",
                    isConnected ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"
                )}
            >
                <div className={clsx("w-1.5 h-1.5 rounded-full", isConnected ? "bg-emerald-500 shadow-[0_0_10px_#10b981]" : "bg-red-500")} />
                {isConnected ? `LINKED: ${state.model}` : 'NO SIGNAL'}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={() => setIsOpen(false)} />
                    <GlassPanel className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] p-6 z-50 rounded-2xl flex flex-col gap-6 border-zinc-800">
                        {/* Status Header */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={clsx("w-12 h-12 rounded-xl flex items-center justify-center border", isConnected ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-500" : "bg-red-500/20 border-red-500/30 text-red-500")}>
                                    <Server size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white tracking-wide">NEURAL BRIDGE</h3>
                                    <p className="text-xs text-zinc-400 font-mono mt-0.5">LOCALHOST:11434</p>
                                </div>
                            </div>
                            <div className={clsx("px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase border", isConnected ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-zinc-800 border-zinc-700 text-zinc-500")}>
                                {state.status}
                            </div>
                        </div>

                        {/* Model Selection Grid */}
                        {isConnected ? (
                            <div className="space-y-3">
                                <label className="text-xs text-zinc-500 uppercase tracking-widest font-bold ml-1">Detected Models</label>
                                <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                                    {state.availableModels.map(m => (
                                        <button
                                            key={m}
                                            onClick={() => aiEngine.setModel(m)}
                                            className={clsx(
                                                "flex items-center justify-between p-3 rounded-lg border text-sm transition-all",
                                                state.model === m 
                                                    ? "bg-violet-600/20 border-violet-500/50 text-white shadow-[0_0_15px_rgba(124,58,237,0.1)]" 
                                                    : "bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800"
                                            )}
                                        >
                                            <span className="font-mono truncate">{m}</span>
                                            {state.model === m && <Zap size={14} className="text-violet-400" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4 flex gap-3 items-start">
                                <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                                <div className="space-y-2">
                                    <p className="text-sm text-red-200 font-medium">Connection Failed</p>
                                    <p className="text-xs text-red-400/80 leading-relaxed">
                                        Could not connect to Ollama. Ensure it is running locally.
                                    </p>
                                    <code className="block bg-black/30 p-2 rounded text-[10px] text-zinc-400 font-mono mt-2 border border-red-500/10">
                                        ollama serve
                                    </code>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                             <CyberButton 
                                variant="primary" 
                                className="w-full"
                                onClick={() => aiEngine.init()}
                            >
                                <RefreshCw size={16} className={state.status === 'connecting' ? 'animate-spin' : ''} />
                                {state.status === 'connecting' ? 'SCANNING...' : 'SCAN NETWORK'}
                            </CyberButton>
                        </div>

                    </GlassPanel>
                </>
            )}
        </>
    );
}
