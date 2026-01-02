"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Zap, Clock, TrendingUp, AlertTriangle } from "lucide-react";
import type { TraceStep } from "@/lib/mcp/types";

interface PerformanceProfilerProps {
  steps: TraceStep[];
  totalTokens: number;
  startTime: number | null;
  endTime?: number;
}

const STEP_COLORS: Record<TraceStep["type"], string> = {
  user: "#3b82f6",
  planning: "#8b5cf6",
  tool_call: "#06b6d4",
  tool_result: "#10b981",
  response: "#f8fafc",
  error: "#ef4444",
};

export function PerformanceProfiler({ steps, totalTokens, startTime, endTime }: PerformanceProfilerProps) {
  const metrics = useMemo(() => {
    const duration = startTime && endTime ? endTime - startTime : 0;
    
    // Count steps by type
    const stepCounts: Record<string, number> = {};
    steps.forEach((step) => {
      stepCounts[step.type] = (stepCounts[step.type] || 0) + 1;
    });

    // Calculate tool calls
    const toolCalls = steps.filter((s) => s.type === "tool_call");
    const uniqueTools = new Set(toolCalls.map((t) => t.toolName)).size;

    // Create breakdown data for pie chart
    const breakdownData = Object.entries(stepCounts).map(([type, count]) => ({
      name: type,
      value: count,
      color: STEP_COLORS[type as TraceStep["type"]] || "#7c3aed",
    }));

    // Create timeline data for bar chart
    const timelineData = steps.map((step, index) => ({
      name: `Step ${index + 1}`,
      type: step.type,
      tokens: step.tokens || 0,
      duration: step.duration || 0,
    }));

    // Token per step average
    const avgTokensPerStep = steps.length > 0 ? Math.round(totalTokens / steps.length) : 0;

    // Tokens per second
    const tokensPerSecond = duration > 0 ? Math.round((totalTokens / duration) * 1000) : 0;

    return {
      duration,
      stepCounts,
      toolCalls: toolCalls.length,
      uniqueTools,
      breakdownData,
      timelineData,
      avgTokensPerStep,
      tokensPerSecond,
    };
  }, [steps, totalTokens, startTime, endTime]);

  if (steps.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-[var(--text-muted)]">
        Run an agent to see performance metrics
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-4 space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-3">
        <div className="p-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
          <div className="flex items-center gap-2 text-[var(--text-muted)] text-xs mb-1">
            <Clock className="w-3.5 h-3.5" />
            Total Duration
          </div>
          <div className="text-xl font-semibold text-[var(--text-primary)]">
            {(metrics.duration / 1000).toFixed(2)}s
          </div>
        </div>

        <div className="p-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
          <div className="flex items-center gap-2 text-[var(--text-muted)] text-xs mb-1">
            <Zap className="w-3.5 h-3.5" />
            Total Tokens
          </div>
          <div className="text-xl font-semibold text-[var(--text-primary)]">
            {totalTokens.toLocaleString()}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
          <div className="flex items-center gap-2 text-[var(--text-muted)] text-xs mb-1">
            <TrendingUp className="w-3.5 h-3.5" />
            Tokens/Second
          </div>
          <div className="text-xl font-semibold text-[var(--text-primary)]">
            {metrics.tokensPerSecond}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
          <div className="flex items-center gap-2 text-[var(--text-muted)] text-xs mb-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            Tool Calls
          </div>
          <div className="text-xl font-semibold text-[var(--text-primary)]">
            {metrics.toolCalls} <span className="text-sm text-[var(--text-muted)]">({metrics.uniqueTools} unique)</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Step Type Breakdown */}
        <div className="p-4 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
          <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3">Step Breakdown</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.breakdownData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                >
                  {metrics.breakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--bg-elevated)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 justify-center mt-2">
            {metrics.breakdownData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-xs">
                <div className="w-2.5 h-2.5 rounded" style={{ backgroundColor: entry.color }} />
                <span className="text-[var(--text-muted)] capitalize">{entry.name}</span>
                <span className="text-[var(--text-primary)]">({entry.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Token Usage Timeline */}
        <div className="p-4 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
          <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3">Token Usage per Step</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.timelineData}>
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: "var(--text-muted)", fontSize: 10 }}
                  axisLine={{ stroke: "var(--border-subtle)" }}
                />
                <YAxis 
                  tick={{ fill: "var(--text-muted)", fontSize: 10 }}
                  axisLine={{ stroke: "var(--border-subtle)" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--bg-elevated)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar 
                  dataKey="tokens" 
                  fill="#7c3aed" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Step List */}
      <div className="p-4 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
        <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3">Step Details</h3>
        <div className="space-y-1">
          <div className="grid grid-cols-5 gap-2 text-xs text-[var(--text-muted)] pb-2 border-b border-[var(--border-subtle)]">
            <span>Step</span>
            <span>Type</span>
            <span>Tool</span>
            <span>Tokens</span>
            <span>Duration</span>
          </div>
          {steps.map((step, index) => (
            <div key={step.id} className="grid grid-cols-5 gap-2 text-xs py-1.5 border-b border-[var(--border-subtle)]/50">
              <span className="text-[var(--text-primary)]">#{index + 1}</span>
              <span className="capitalize" style={{ color: STEP_COLORS[step.type] }}>{step.type}</span>
              <span className="text-[var(--accent-cyan)] font-mono">{step.toolName || "—"}</span>
              <span className="text-[var(--text-secondary)]">{step.tokens || 0}</span>
              <span className="text-[var(--text-secondary)]">{step.duration ? `${step.duration.toFixed(0)}ms` : "—"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
