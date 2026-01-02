"use client";

import { useState, useEffect } from "react";
import { Send, Sparkles, Play, Square, Clock, Zap, Hash, AlertCircle, GitBranch } from "lucide-react";
import { useAgentStore, useSettingsStore, useTraceStore } from "@/lib/store";
import { runAgent } from "@/lib/agent";
import { DecisionTree } from "@/components/flow";
import type { TraceStep } from "@/lib/mcp/types";

// Step type colors and icons
const stepTypeConfig: Record<TraceStep["type"], { color: string; bgColor: string; label: string }> = {
  user: { color: "text-blue-400", bgColor: "bg-blue-400/20", label: "Query" },
  planning: { color: "text-purple-400", bgColor: "bg-purple-400/20", label: "Thinking" },
  tool_call: { color: "text-cyan-400", bgColor: "bg-cyan-400/20", label: "Tool Call" },
  tool_result: { color: "text-emerald-400", bgColor: "bg-emerald-400/20", label: "Result" },
  response: { color: "text-white", bgColor: "bg-white/20", label: "Response" },
  error: { color: "text-red-400", bgColor: "bg-red-400/20", label: "Error" },
};

function StepDetails({ step }: { step: TraceStep | null }) {
  if (!step) {
    return (
      <div className="h-full flex items-center justify-center text-[var(--text-muted)] text-sm">
        Select a step to view details
      </div>
    );
  }

  const config = stepTypeConfig[step.type];

  return (
    <div className="h-full overflow-auto">
      <div className="flex items-center gap-2 mb-3">
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${config.bgColor} ${config.color}`}>
          {config.label}
        </span>
        {step.toolName && (
          <code className="text-sm font-mono text-[var(--accent-cyan)]">{step.toolName}</code>
        )}
      </div>

      {step.type === "tool_call" && step.toolArgs && (
        <div className="mb-3">
          <h4 className="text-xs font-medium text-[var(--text-muted)] mb-1">Arguments</h4>
          <pre className="p-2 rounded bg-[var(--bg-primary)] text-xs overflow-x-auto">
            {JSON.stringify(step.toolArgs, null, 2)}
          </pre>
        </div>
      )}

      {step.type === "tool_result" && step.toolResult !== undefined && step.toolResult !== null ? (
        <div className="mb-3">
          <h4 className="text-xs font-medium text-[var(--text-muted)] mb-1">Result</h4>
          <pre className="p-2 rounded bg-[var(--bg-primary)] text-xs overflow-x-auto max-h-48">
            {JSON.stringify(step.toolResult, null, 2)}
          </pre>
        </div>
      ) : null}

      {step.type === "response" && (
        <div className="prose prose-invert prose-sm max-w-none">
          <div className="whitespace-pre-wrap text-sm text-[var(--text-primary)]">
            {step.content}
          </div>
        </div>
      )}

      {step.type !== "response" && step.type !== "tool_call" && step.type !== "tool_result" && (
        <p className="text-sm text-[var(--text-secondary)]">{step.content}</p>
      )}

      {step.tokens && (
        <div className="mt-3 text-xs text-[var(--text-muted)]">
          Tokens: {step.tokens}
        </div>
      )}
    </div>
  );
}

export default function AgentPage() {
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState<"tree" | "list">("tree");
  const { isRunning, steps, currentQuery, totalTokens, startTime, selectedStepId, startExecution, addStep, incrementTokens, stopExecution, selectStep, reset } = useAgentStore();
  const { selectedModel, ollamaStatus } = useSettingsStore();
  const { addTrace } = useTraceStore();

  const selectedStep = steps.find((s) => s.id === selectedStepId) || null;
  
  // Use state for duration to avoid hydration mismatch and impurity
  const [duration, setDuration] = useState(0);

  // Update duration periodically if running

  useEffect(() => {
    if (!startTime) {
      setDuration(0);
      return;
    }

    // Set initial duration
    setDuration(Date.now() - startTime);

    if (!isRunning) return;

    const interval = setInterval(() => {
      setDuration(Date.now() - startTime);
    }, 100);

    return () => clearInterval(interval);
  }, [startTime, isRunning]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isRunning) return;
    if (ollamaStatus !== "connected") {
      alert("Ollama is not connected. Please start Ollama and refresh.");
      return;
    }
    
    startExecution(query);

    try {
      await runAgent(query, selectedModel, {
        onStepAdded: (step) => addStep(step),
        onTokensUsed: (count) => incrementTokens(count),
        onComplete: (trace) => {
          addTrace(trace);
          stopExecution();
        },
        onError: (error) => {
          console.error("Agent error:", error);
          stopExecution();
        },
      });
    } catch (error) {
      console.error("Failed to run agent:", error);
      stopExecution();
    }
  };

  const handleStop = () => {
    stopExecution();
  };

  const handleReset = () => {
    reset();
    setQuery("");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-var(--header-height))]">
      {/* Top Section - Query Input */}
      <div className="p-6 border-b border-[var(--border-subtle)]">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[var(--accent-violet)]" />
              <h1 className="text-xl font-semibold">Agent Runner</h1>
              {isRunning && (
                <span className="px-2 py-0.5 rounded-full text-xs bg-[var(--accent-violet-muted)] text-[var(--accent-violet)] animate-pulse">
                  Running
                </span>
              )}
            </div>
            
            {steps.length > 0 && (
              <div className="flex items-center gap-1 p-1 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
                <button
                  onClick={() => setViewMode("tree")}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                    viewMode === "tree" 
                      ? "bg-[var(--accent-violet)] text-white" 
                      : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  <GitBranch className="w-3.5 h-3.5 inline mr-1" />
                  Tree
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                    viewMode === "list" 
                      ? "bg-[var(--accent-violet)] text-white" 
                      : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  List
                </button>
              </div>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Give the agent a task... e.g. 'Find all critical bugs and list open P0 tickets'"
              className="
                w-full px-4 py-4 pr-36 rounded-xl
                bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]
                text-[var(--text-primary)] placeholder:text-[var(--text-muted)]
                focus:border-[var(--accent-violet)] focus:ring-1 focus:ring-[var(--accent-violet)]
                transition-all text-sm
              "
              disabled={isRunning}
            />
            
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {steps.length > 0 && !isRunning && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
                >
                  Clear
                </button>
              )}
              
              {isRunning ? (
                <button
                  type="button"
                  onClick={handleStop}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--error)] text-white text-sm font-medium hover:bg-[var(--error)]/90 transition-colors"
                >
                  <Square className="w-4 h-4" />
                  Stop
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!query.trim() || ollamaStatus !== "connected"}
                  className="
                    flex items-center gap-2 px-4 py-2 rounded-lg
                    bg-[var(--accent-violet)] text-white text-sm font-medium
                    hover:bg-[var(--accent-violet-hover)] transition-colors
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                >
                  <Play className="w-4 h-4" />
                  Run
                </button>
              )}
            </div>
          </form>

          {ollamaStatus !== "connected" && (
            <div className="mt-3 flex items-center gap-2 text-sm text-[var(--warning)]">
              <AlertCircle className="w-4 h-4" />
              <span>Ollama is not connected. Run <code className="text-[var(--accent-cyan)]">ollama serve</code> to start.</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {steps.length > 0 ? (
          <>
            {/* Decision Tree / List View */}
            <div className={`${viewMode === "tree" ? "flex-1" : "w-80"} border-r border-[var(--border-subtle)] overflow-hidden`}>
              {viewMode === "tree" ? (
                <DecisionTree
                  steps={steps}
                  isRunning={isRunning}
                  onNodeClick={selectStep}
                  selectedStepId={selectedStepId}
                />
              ) : (
                <div className="p-4 overflow-y-auto h-full space-y-2">
                  {steps.map((step) => {
                    const config = stepTypeConfig[step.type];
                    return (
                      <button
                        key={step.id}
                        onClick={() => selectStep(step.id)}
                        className={`
                          w-full text-left p-3 rounded-lg border transition-all
                          ${step.id === selectedStepId 
                            ? "border-[var(--accent-violet)] bg-[var(--accent-violet-muted)]" 
                            : "border-[var(--border-subtle)] hover:border-[var(--border-default)] bg-[var(--bg-tertiary)]"
                          }
                        `}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${config.bgColor} ${config.color}`}>
                            {config.label}
                          </span>
                          {step.toolName && (
                            <code className="text-xs text-[var(--accent-cyan)]">{step.toolName}</code>
                          )}
                        </div>
                        <p className="text-sm text-[var(--text-secondary)] line-clamp-2">
                          {step.content}
                        </p>
                      </button>
                    );
                  })}
                  {isRunning && (
                    <div className="flex items-center gap-2 p-3 text-sm text-[var(--text-muted)]">
                      <div className="w-2 h-2 rounded-full bg-[var(--accent-violet)] animate-pulse" />
                      Processing...
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Step Details Panel */}
            <div className={`${viewMode === "tree" ? "w-96" : "flex-1"} p-4 overflow-hidden`}>
              <div className="h-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4">
                <StepDetails step={selectedStep} />
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 p-6">
            <div className="h-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[var(--accent-violet)] to-[var(--accent-cyan)] flex items-center justify-center opacity-40">
                  <Send className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-lg font-medium text-[var(--text-secondary)] mb-2">
                  Ready to Run
                </h2>
                <p className="text-sm text-[var(--text-muted)] max-w-md">
                  Enter a task above and click &quot;Run&quot; to see the agent&apos;s decision tree visualized in real-time.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Panel - Metrics */}
      <div className="h-14 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-6 flex items-center justify-between">
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2 text-[var(--text-muted)]">
            <Hash className="w-4 h-4" />
            <span>Steps: <span className="text-[var(--text-primary)]">{steps.length}</span></span>
          </div>
          <div className="flex items-center gap-2 text-[var(--text-muted)]">
            <Zap className="w-4 h-4" />
            <span>Tokens: <span className="text-[var(--text-primary)]">{totalTokens}</span></span>
          </div>
          <div className="flex items-center gap-2 text-[var(--text-muted)]">
            <Clock className="w-4 h-4" />
            <span>Duration: <span className="text-[var(--text-primary)]">{(duration / 1000).toFixed(1)}s</span></span>
          </div>
        </div>
        
        {currentQuery && !isRunning && (
          <div className="text-sm text-[var(--text-muted)] truncate max-w-md">
            Last query: {currentQuery}
          </div>
        )}
      </div>
    </div>
  );
}
