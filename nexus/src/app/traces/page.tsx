"use client";

import { useState } from "react";
import { History, Trash2, Clock, Cpu, Zap, CheckCircle, XCircle, GitBranch, BarChart2, ClipboardCheck } from "lucide-react";
import { useTraceStore } from "@/lib/store";
import { TimeTravelDebugger } from "@/components/debugger";
import { PerformanceProfiler } from "@/components/profiler";
import { EvaluationSuite } from "@/components/evaluation";
import type { Trace } from "@/lib/mcp/types";

type TabType = "debugger" | "profiler" | "evaluation";

export default function TracesPage() {
  const { traces, deleteTrace, clearTraces } = useTraceStore();
  const [selectedTraceId, setSelectedTraceId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("debugger");

  const selectedTrace = traces.find((t) => t.id === selectedTraceId) || null;

  const handleClearAll = () => {
    if (confirm("Are you sure you want to delete all traces? This cannot be undone.")) {
      clearTraces();
      setSelectedTraceId(null);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatDuration = (trace: { startTime: number; endTime?: number }) => {
    if (!trace.endTime) return "—";
    return `${((trace.endTime - trace.startTime) / 1000).toFixed(1)}s`;
  };

  const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
    { id: "debugger", label: "Time-Travel Debugger", icon: GitBranch },
    { id: "profiler", label: "Performance Profiler", icon: BarChart2 },
    { id: "evaluation", label: "Evaluation Suite", icon: ClipboardCheck },
  ];

  return (
    <div className="flex h-[calc(100vh-var(--header-height))]">
      {/* Trace List Sidebar */}
      <div className="w-80 border-r border-[var(--border-subtle)] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-[var(--accent-violet)]" />
              <h1 className="text-lg font-semibold">Traces</h1>
              {traces.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs bg-[var(--bg-tertiary)] text-[var(--text-muted)]">
                  {traces.length}
                </span>
              )}
            </div>
            
            {traces.length > 0 && (
              <button
                onClick={handleClearAll}
                className="p-1.5 rounded hover:bg-[var(--error-muted)] text-[var(--text-muted)] hover:text-[var(--error)] transition-colors"
                title="Clear all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            Select a trace to debug, profile, or evaluate
          </p>
        </div>

        {/* Trace List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {traces.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <History className="w-10 h-10 text-[var(--text-muted)] mb-3" />
              <p className="text-sm text-[var(--text-muted)]">
                No traces yet. Run an agent to start collecting.
              </p>
            </div>
          ) : (
            traces.map((trace) => (
              <button
                key={trace.id}
                onClick={() => setSelectedTraceId(trace.id)}
                className={`
                  w-full text-left p-3 rounded-lg border transition-all
                  ${trace.id === selectedTraceId
                    ? "border-[var(--accent-violet)] bg-[var(--accent-violet-muted)]"
                    : "border-[var(--border-subtle)] hover:border-[var(--border-default)] bg-[var(--bg-tertiary)]"
                  }
                `}
              >
                <div className="flex items-start gap-2">
                  <div className={`mt-0.5 ${trace.success ? "text-[var(--success)]" : "text-[var(--error)]"}`}>
                    {trace.success ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                      {trace.query}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-[var(--text-muted)]">
                      <span className="flex items-center gap-1">
                        <Cpu className="w-3 h-3" />
                        {trace.steps.length}
                      </span>
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        {trace.totalTokens}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDuration(trace)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTrace(trace.id);
                      if (selectedTraceId === trace.id) {
                        setSelectedTraceId(null);
                      }
                    }}
                    className="p-1 rounded hover:bg-[var(--error-muted)] text-[var(--text-muted)] hover:text-[var(--error)] transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedTrace ? (
          <>
            {/* Tab Navigation */}
            <div className="flex items-center gap-1 p-2 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                    ${activeTab === tab.id
                      ? "bg-[var(--accent-violet)] text-white"
                      : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                    }
                  `}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-hidden">
              {activeTab === "debugger" && (
                <div className="h-full p-4">
                  <TimeTravelDebugger trace={selectedTrace} />
                </div>
              )}
              {activeTab === "profiler" && (
                <div className="h-full">
                  <PerformanceProfiler
                    steps={selectedTrace.steps}
                    totalTokens={selectedTrace.totalTokens}
                    startTime={selectedTrace.startTime}
                    endTime={selectedTrace.endTime}
                  />
                </div>
              )}
              {activeTab === "evaluation" && (
                <div className="h-full">
                  <EvaluationSuite trace={selectedTrace} />
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] flex items-center justify-center">
                <History className="w-10 h-10 text-[var(--text-muted)]" />
              </div>
              <h2 className="text-xl font-medium text-[var(--text-secondary)] mb-2">
                Select a Trace
              </h2>
              <p className="text-sm text-[var(--text-muted)] max-w-md">
                Choose a trace from the list to analyze with the debugger, profiler, or evaluation suite.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
