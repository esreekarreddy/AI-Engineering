"use client";

import { Cpu, HardDrive, Trash2, Settings as SettingsIcon, Info, Zap } from "lucide-react";
import { useSettingsStore, useTraceStore } from "@/lib/store";
import { AVAILABLE_MODELS } from "@/lib/ollama";
import { useState, useEffect } from "react";

export default function SettingsPage() {
  const { selectedModel, setSelectedModel, reset: resetSettings } = useSettingsStore();
  const { clearTraces, getTraceCount } = useTraceStore();
  const [storageSize, setStorageSize] = useState("0 KB");
  const [traceCount, setTraceCount] = useState(0);

  useEffect(() => {
    // Calculate localStorage size safely
    let totalSize = 0;
    try {
      const keys = Object.keys(localStorage);
      for (const key of keys) {
        // Skip prototype properties
        if (!Object.prototype.hasOwnProperty.call(localStorage, key)) continue;
        
        try {
          const value = localStorage.getItem(key);
          if (value) {
            totalSize += value.length * 2; // UTF-16 characters = 2 bytes each
          }
        } catch {
          // Skip inaccessible items
        }
      }
    } catch (e) {
      console.warn('[Security] localStorage size calculation error:', e);
    }
    
    if (totalSize > 1024 * 1024) {
      setStorageSize(`${(totalSize / (1024 * 1024)).toFixed(2)} MB`);
    } else if (totalSize > 1024) {
      setStorageSize(`${(totalSize / 1024).toFixed(2)} KB`);
    } else {
      setStorageSize(`${totalSize} bytes`);
    }

    setTraceCount(getTraceCount());
  }, [getTraceCount]);

  const handleClearAll = () => {
    if (confirm("Are you sure you want to clear all data? This includes traces and settings. This cannot be undone.")) {
      clearTraces();
      resetSettings();
      try {
        localStorage.clear();
      } catch (e) {
        console.warn('[Security] localStorage clear error:', e);
      }
      setStorageSize("0 KB");
      setTraceCount(0);
    }
  };

  const getSpeedBadge = (speed: string) => {
    const colors: Record<string, string> = {
      "ultra-fast": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      fast: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
      medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      slow: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    };
    return colors[speed] || "";
  };

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <SettingsIcon className="w-5 h-5 text-[var(--accent-violet)]" />
          <h1 className="text-xl font-semibold">Settings</h1>
        </div>

        {/* Model Selection */}
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] overflow-hidden">
          <div className="p-4 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[var(--accent-violet)]" />
              <h2 className="font-medium">Model Selection</h2>
            </div>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Choose the default model for agent execution
            </p>
          </div>
          
          <div className="p-4 space-y-3">
            {AVAILABLE_MODELS.map((model) => (
              <button
                key={model.id}
                onClick={() => setSelectedModel(model.id)}
                className={`
                  w-full flex items-start gap-4 p-4 rounded-xl border transition-all
                  ${model.id === selectedModel
                    ? "border-[var(--accent-violet)] bg-[var(--accent-violet-muted)]"
                    : "border-[var(--border-subtle)] hover:border-[var(--border-default)] bg-[var(--bg-tertiary)]"
                  }
                `}
              >
                <div className={`
                  w-10 h-10 rounded-lg flex items-center justify-center
                  ${model.id === selectedModel ? "bg-[var(--accent-violet)]" : "bg-[var(--bg-primary)]"}
                `}>
                  <Zap className={`w-5 h-5 ${model.id === selectedModel ? "text-white" : "text-[var(--text-muted)]"}`} />
                </div>
                
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[var(--text-primary)]">{model.name}</span>
                    <span className={`px-2 py-0.5 text-xs rounded border capitalize ${getSpeedBadge(model.speed)}`}>
                      {model.speed}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--text-muted)] mt-0.5">{model.description}</p>
                </div>

                <div className={`
                  w-5 h-5 rounded-full border-2 flex items-center justify-center
                  ${model.id === selectedModel 
                    ? "border-[var(--accent-violet)] bg-[var(--accent-violet)]"
                    : "border-[var(--border-default)]"
                  }
                `}>
                  {model.id === selectedModel && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
              </button>
            ))}

            <div className="flex items-center gap-2 p-3 rounded-lg bg-[var(--bg-primary)] text-xs text-[var(--text-muted)]">
              <Info className="w-4 h-4" />
              <span>Pull models with: <code className="text-[var(--accent-cyan)]">ollama pull mistral:7b</code></span>
            </div>
          </div>
        </div>

        {/* Storage */}
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] overflow-hidden">
          <div className="p-4 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-[var(--accent-cyan)]" />
              <h2 className="font-medium">Local Storage</h2>
            </div>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              All data is stored locally in your browser
            </p>
          </div>
          
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-3 rounded-lg bg-[var(--bg-tertiary)]">
                <div className="text-2xl font-semibold text-[var(--text-primary)]">{storageSize}</div>
                <div className="text-xs text-[var(--text-muted)]">Total Storage Used</div>
              </div>
              <div className="p-3 rounded-lg bg-[var(--bg-tertiary)]">
                <div className="text-2xl font-semibold text-[var(--text-primary)]">{traceCount}</div>
                <div className="text-xs text-[var(--text-muted)]">Saved Traces</div>
              </div>
            </div>

            <button
              onClick={handleClearAll}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg border border-[var(--error)] text-[var(--error)] hover:bg-[var(--error-muted)] transition-colors text-sm font-medium"
            >
              <Trash2 className="w-4 h-4" />
              Clear All Data
            </button>
          </div>
        </div>

        {/* About */}
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4">
          <h2 className="font-medium text-[var(--text-primary)] mb-2">About SR Nexus</h2>
          <p className="text-sm text-[var(--text-muted)]">
            Advanced MCP Agent Debugging Platform for visualizing, debugging, and evaluating AI agent behavior in real-time.
          </p>
          <div className="mt-3 flex items-center gap-4 text-xs text-[var(--text-muted)]">
            <span>Version 1.0.0</span>
            <span>•</span>
            <span>Built with Next.js 16</span>
            <span>•</span>
            <span>Powered by Ollama</span>
          </div>
        </div>
      </div>
    </div>
  );
}
