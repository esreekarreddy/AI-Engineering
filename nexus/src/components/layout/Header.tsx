"use client";

import { useState, useEffect } from "react";
import { ChevronDown, Loader2, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { useSettingsStore } from "@/lib/store";
import { checkConnection, getAvailableModels, AVAILABLE_MODELS } from "@/lib/ollama";

export function Header() {
  const { selectedModel, setSelectedModel, ollamaStatus, setOllamaStatus, availableModels, setAvailableModels } = useSettingsStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    checkOllamaConnection();
  }, []);

  async function checkOllamaConnection() {
    setIsRefreshing(true);
    const status = await checkConnection();
    setOllamaStatus(status);
    
    if (status === "connected") {
      const models = await getAvailableModels();
      setAvailableModels(models);
    }
    setIsRefreshing(false);
  }

  // Get display name for model
  const getModelDisplay = (modelId: string) => {
    const model = AVAILABLE_MODELS.find((m) => m.id === modelId);
    return model ? model.name : modelId;
  };

  const getModelSpeed = (modelId: string) => {
    const model = AVAILABLE_MODELS.find((m) => m.id === modelId);
    return model?.speed || "unknown";
  };

  return (
    <header className="fixed top-0 left-[var(--sidebar-width)] right-0 h-[var(--header-height)] bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)] flex items-center justify-between px-6 z-40">
      {/* Left side - Page title placeholder */}
      <div />

      {/* Right side - Controls */}
      <div className="flex items-center gap-4">
        {/* Ollama Status */}
        <div className="flex items-center gap-2 text-sm">
          {(ollamaStatus === "checking" || isRefreshing) && (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-[var(--text-muted)]" />
              <span className="text-[var(--text-muted)]">Checking Ollama...</span>
            </>
          )}
          {ollamaStatus === "connected" && !isRefreshing && (
            <>
              <CheckCircle2 className="w-4 h-4 text-[var(--success)]" />
              <span className="text-[var(--text-secondary)]">Ollama Connected</span>
            </>
          )}
          {ollamaStatus === "disconnected" && !isRefreshing && (
            <>
              <XCircle className="w-4 h-4 text-[var(--error)]" />
              <span className="text-[var(--error)]">Ollama Disconnected</span>
            </>
          )}
          
          <button
            onClick={checkOllamaConnection}
            disabled={isRefreshing}
            className="p-1 rounded hover:bg-[var(--bg-hover)] transition-colors"
            title="Refresh connection"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[var(--text-muted)] ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-[var(--border-subtle)]" />

        {/* Model Selector */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] hover:border-[var(--border-default)] transition-colors text-sm"
          >
            <div className="w-2 h-2 rounded-full bg-[var(--accent-cyan)]" />
            <span className="text-[var(--text-primary)]">{getModelDisplay(selectedModel)}</span>
            <span className="text-[var(--text-muted)] text-xs capitalize">({getModelSpeed(selectedModel)})</span>
            <ChevronDown className={`w-4 h-4 text-[var(--text-muted)] transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {isDropdownOpen && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsDropdownOpen(false)} 
              />
              
              {/* Dropdown */}
              <div className="absolute right-0 top-full mt-2 w-64 py-1 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] shadow-lg animate-fade-in z-50">
                <div className="px-3 py-2 text-xs text-[var(--text-muted)] border-b border-[var(--border-subtle)]">
                  {availableModels.length > 0 
                    ? `${availableModels.length} models available`
                    : "Pull models with: ollama pull mistral:7b"
                  }
                </div>
                {AVAILABLE_MODELS.map((model) => {
                  const isInstalled = availableModels.some((m) => m.startsWith(model.id.split(":")[0]));
                  return (
                    <button
                      key={model.id}
                      onClick={() => {
                        setSelectedModel(model.id);
                        setIsDropdownOpen(false);
                      }}
                      disabled={!isInstalled && ollamaStatus === "connected"}
                      className={`
                        w-full flex items-center justify-between px-3 py-2 text-sm
                        hover:bg-[var(--bg-hover)] transition-colors
                        disabled:opacity-50 disabled:cursor-not-allowed
                        ${model.id === selectedModel ? "text-[var(--accent-violet)]" : "text-[var(--text-secondary)]"}
                      `}
                    >
                      <div className="flex flex-col items-start">
                        <span className="flex items-center gap-2">
                          {model.name}
                          {isInstalled && <span className="text-xs text-[var(--success)]">✓</span>}
                        </span>
                        <span className="text-xs text-[var(--text-muted)]">{model.description}</span>
                      </div>
                      <span className="text-xs text-[var(--text-muted)] capitalize">{model.speed}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
