import { aiEngine, AIState } from "@/lib/ai/engine";
import { useEffect, useState } from "react";
import clsx from "clsx";

export function ModelManager() {
    const [state, setState] = useState<AIState>(aiEngine.getState());

    useEffect(() => {
        return aiEngine.subscribe(setState);
    }, []);

    // Auto-connect on mount
    useEffect(() => {
        aiEngine.init();
    }, []);

    const isConnected = state.status === 'connected' || state.status === 'generating';

    return (
        <div 
            className={clsx(
                "flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-full border select-none",
                isConnected 
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                    : "bg-red-500/10 text-red-400 border-red-500/20"
            )}
            title={isConnected ? `Connected to ${state.model}` : "Ollama not connected - run: ollama serve"}
        >
            <div className={clsx(
                "w-1.5 h-1.5 rounded-full", 
                isConnected ? "bg-emerald-500 shadow-[0_0_10px_#10b981]" : "bg-red-500 animate-pulse"
            )} />
            {isConnected ? `LINKED: ${state.model}` : 'NO SIGNAL'}
        </div>
    );
}
