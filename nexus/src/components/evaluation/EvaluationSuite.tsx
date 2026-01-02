"use client";

import { useState } from "react";
import { ClipboardCheck, Play, CheckCircle, XCircle, Timer, Zap } from "lucide-react";
import type { Trace } from "@/lib/mcp/types";

interface EvaluationCriteria {
  id: string;
  name: string;
  description: string;
  check: (trace: Trace) => { passed: boolean; score: number; message: string };
}

const EVALUATION_CRITERIA: EvaluationCriteria[] = [
  {
    id: "goal_achieved",
    name: "Goal Achievement",
    description: "Did the agent successfully complete the task?",
    check: (trace) => {
      const hasResponse = trace.steps.some((s) => s.type === "response");
      const hasError = trace.steps.some((s) => s.type === "error");
      return {
        passed: hasResponse && !hasError,
        score: hasResponse && !hasError ? 100 : 0,
        message: hasResponse && !hasError ? "Completed successfully" : "Failed with errors",
      };
    },
  },
  {
    id: "tool_efficiency",
    name: "Tool Efficiency",
    description: "Were tools used efficiently without redundant calls?",
    check: (trace) => {
      const toolCalls = trace.steps.filter((s) => s.type === "tool_call");
      const toolNames = toolCalls.map((s) => s.toolName);
      const uniqueTools = new Set(toolNames).size;
      const redundancy = toolCalls.length > 0 ? uniqueTools / toolCalls.length : 1;
      const score = Math.round(redundancy * 100);
      return {
        passed: score >= 70,
        score,
        message: `${toolCalls.length} calls, ${uniqueTools} unique tools`,
      };
    },
  },
  {
    id: "response_quality",
    name: "Response Quality",
    description: "Was the final response comprehensive and helpful?",
    check: (trace) => {
      const response = trace.steps.find((s) => s.type === "response");
      if (!response) return { passed: false, score: 0, message: "No response generated" };
      const length = response.content.length;
      // Simple heuristic: longer responses tend to be more detailed
      const score = Math.min(100, Math.round((length / 500) * 100));
      return {
        passed: score >= 50,
        score,
        message: `${length} characters`,
      };
    },
  },
  {
    id: "token_efficiency",
    name: "Token Efficiency",
    description: "Were tokens used efficiently?",
    check: (trace) => {
      const tokensPerStep = trace.steps.length > 0 ? trace.totalTokens / trace.steps.length : 0;
      // Lower is better, target ~200 tokens per step
      const efficiency = Math.max(0, 100 - Math.abs(tokensPerStep - 200) / 10);
      const score = Math.round(efficiency);
      return {
        passed: score >= 50,
        score,
        message: `${Math.round(tokensPerStep)} tokens/step avg`,
      };
    },
  },
  {
    id: "error_handling",
    name: "Error Handling",
    description: "Were errors handled gracefully?",
    check: (trace) => {
      const errors = trace.steps.filter((s) => s.type === "error");
      const hasRecovery = errors.length > 0 && trace.steps.some((s) => s.type === "response");
      if (errors.length === 0) {
        return { passed: true, score: 100, message: "No errors encountered" };
      }
      return {
        passed: hasRecovery,
        score: hasRecovery ? 70 : 30,
        message: hasRecovery ? "Recovered from errors" : `${errors.length} unhandled errors`,
      };
    },
  },
];

interface EvaluationSuiteProps {
  trace: Trace | null;
}

export function EvaluationSuite({ trace }: EvaluationSuiteProps) {
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [results, setResults] = useState<{ id: string; passed: boolean; score: number; message: string }[] | null>(null);

  const runEvaluation = () => {
    if (!trace) return;
    
    setIsEvaluating(true);
    
    // Simulate async evaluation
    setTimeout(() => {
      const evalResults = EVALUATION_CRITERIA.map((criteria) => ({
        id: criteria.id,
        ...criteria.check(trace),
      }));
      setResults(evalResults);
      setIsEvaluating(false);
    }, 500);
  };

  const overallScore = results 
    ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length)
    : null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-[var(--success)]";
    if (score >= 50) return "text-[var(--warning)]";
    return "text-[var(--error)]";
  };

  if (!trace) {
    return (
      <div className="flex items-center justify-center h-full text-[var(--text-muted)]">
        Select a trace to evaluate
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="w-5 h-5 text-[var(--accent-violet)]" />
          <h2 className="text-lg font-semibold">Evaluation Suite</h2>
        </div>
        
        <button
          onClick={runEvaluation}
          disabled={isEvaluating}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent-violet)] text-white font-medium hover:bg-[var(--accent-violet-hover)] disabled:opacity-50"
        >
          {isEvaluating ? (
            <>
              <Timer className="w-4 h-4 animate-spin" />
              Evaluating...
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Run Evaluation
            </>
          )}
        </button>
      </div>

      {/* Overall Score */}
      {overallScore !== null && (
        <div className="p-6 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-center">
          <div className="text-sm text-[var(--text-muted)] mb-2">Overall Score</div>
          <div className={`text-5xl font-bold ${getScoreColor(overallScore)}`}>
            {overallScore}
          </div>
          <div className="text-sm text-[var(--text-muted)] mt-2">
            {overallScore >= 80 ? "Excellent" : overallScore >= 50 ? "Good" : "Needs Improvement"}
          </div>
        </div>
      )}

      {/* Criteria Results */}
      {results && (
        <div className="space-y-3">
          {EVALUATION_CRITERIA.map((criteria, index) => {
            const result = results.find((r) => r.id === criteria.id);
            if (!result) return null;

            return (
              <div
                key={criteria.id}
                className="p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 ${result.passed ? "text-[var(--success)]" : "text-[var(--error)]"}`}>
                      {result.passed ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <XCircle className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-[var(--text-primary)]">{criteria.name}</h3>
                      <p className="text-sm text-[var(--text-muted)] mt-0.5">{criteria.description}</p>
                      <p className="text-sm text-[var(--text-secondary)] mt-2">{result.message}</p>
                    </div>
                  </div>
                  
                  <div className={`text-xl font-bold ${getScoreColor(result.score)}`}>
                    {result.score}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3 h-1.5 bg-[var(--bg-primary)] rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      result.score >= 80 ? "bg-[var(--success)]" :
                      result.score >= 50 ? "bg-[var(--warning)]" :
                      "bg-[var(--error)]"
                    }`}
                    style={{ width: `${result.score}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* No Results State */}
      {!results && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <ClipboardCheck className="w-12 h-12 text-[var(--text-muted)] mb-4" />
          <h3 className="text-lg font-medium text-[var(--text-secondary)] mb-2">
            Ready to Evaluate
          </h3>
          <p className="text-sm text-[var(--text-muted)] max-w-md">
            Click &quot;Run Evaluation&quot; to analyze the trace against quality criteria.
          </p>
        </div>
      )}
    </div>
  );
}
