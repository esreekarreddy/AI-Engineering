"use client";

import { useState, useMemo } from "react";
import { Clock, GitBranch, RotateCcw, Play, ChevronLeft, ChevronRight } from "lucide-react";
import type { TraceStep, Trace } from "@/lib/mcp/types";

interface TimelineControlsProps {
  steps: TraceStep[];
  currentStepIndex: number;
  onStepChange: (index: number) => void;
  isPlaying: boolean;
  onPlayPause: () => void;
  playbackSpeed: number;
  onSpeedChange: (speed: number) => void;
}

export function TimelineControls({
  steps,
  currentStepIndex,
  onStepChange,
  isPlaying,
  onPlayPause,
  playbackSpeed,
  onSpeedChange,
}: TimelineControlsProps) {
  const progress = steps.length > 0 ? ((currentStepIndex + 1) / steps.length) * 100 : 0;

  return (
    <div className="flex flex-col gap-3 p-4 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
          <Clock className="w-4 h-4" />
          <span>Step {currentStepIndex + 1} of {steps.length}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <select
            value={playbackSpeed}
            onChange={(e) => onSpeedChange(Number(e.target.value))}
            className="px-2 py-1 text-xs bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded text-[var(--text-secondary)]"
          >
            <option value={0.5}>0.5x</option>
            <option value={1}>1x</option>
            <option value={2}>2x</option>
            <option value={4}>4x</option>
          </select>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative h-2 bg-[var(--bg-primary)] rounded-full overflow-hidden">
        <div 
          className="absolute left-0 top-0 h-full bg-[var(--accent-violet)] transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
        {/* Step markers */}
        {steps.map((_, index) => (
          <button
            key={index}
            onClick={() => onStepChange(index)}
            className="absolute top-0 w-2 h-2 -translate-x-1/2 rounded-full bg-[var(--border-subtle)] hover:bg-[var(--accent-cyan)] transition-colors"
            style={{ left: `${((index + 0.5) / steps.length) * 100}%` }}
          />
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => onStepChange(0)}
          disabled={currentStepIndex === 0}
          className="p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-muted)] disabled:opacity-50"
          title="Go to start"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        
        <button
          onClick={() => onStepChange(Math.max(0, currentStepIndex - 1))}
          disabled={currentStepIndex === 0}
          className="p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-muted)] disabled:opacity-50"
          title="Previous step"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={onPlayPause}
          className="p-3 rounded-lg bg-[var(--accent-violet)] text-white hover:bg-[var(--accent-violet-hover)] transition-colors"
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <div className="w-4 h-4 flex items-center justify-center gap-0.5">
              <div className="w-1 h-3 bg-white rounded-sm" />
              <div className="w-1 h-3 bg-white rounded-sm" />
            </div>
          ) : (
            <Play className="w-4 h-4" />
          )}
        </button>

        <button
          onClick={() => onStepChange(Math.min(steps.length - 1, currentStepIndex + 1))}
          disabled={currentStepIndex === steps.length - 1}
          className="p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-muted)] disabled:opacity-50"
          title="Next step"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <button
          onClick={() => onStepChange(steps.length - 1)}
          disabled={currentStepIndex === steps.length - 1}
          className="p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-muted)] disabled:opacity-50"
          title="Go to end"
        >
          <GitBranch className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

interface TimeTravelDebuggerProps {
  trace: Trace | null;
  onBranchFrom?: (stepIndex: number, newQuery: string) => void;
}

export function TimeTravelDebugger({ trace, onBranchFrom }: TimeTravelDebuggerProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [branchQuery, setBranchQuery] = useState("");
  const [showBranchInput, setShowBranchInput] = useState(false);

  const visibleSteps = useMemo(() => {
    if (!trace) return [];
    return trace.steps.slice(0, currentStepIndex + 1);
  }, [trace, currentStepIndex]);

  if (!trace) {
    return (
      <div className="flex items-center justify-center h-full text-[var(--text-muted)]">
        Select a trace to debug
      </div>
    );
  }

  const handleBranch = () => {
    if (branchQuery.trim() && onBranchFrom) {
      onBranchFrom(currentStepIndex, branchQuery);
      setBranchQuery("");
      setShowBranchInput(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Timeline Controls */}
      <TimelineControls
        steps={trace.steps}
        currentStepIndex={currentStepIndex}
        onStepChange={setCurrentStepIndex}
        isPlaying={isPlaying}
        onPlayPause={() => setIsPlaying(!isPlaying)}
        playbackSpeed={playbackSpeed}
        onSpeedChange={setPlaybackSpeed}
      />

      {/* Current State View */}
      <div className="flex-1 overflow-auto mt-4">
        <div className="space-y-2">
          {visibleSteps.map((step, index) => (
            <div
              key={step.id}
              className={`
                p-3 rounded-lg border transition-all
                ${index === currentStepIndex 
                  ? "border-[var(--accent-violet)] bg-[var(--accent-violet-muted)]"
                  : "border-[var(--border-subtle)] bg-[var(--bg-tertiary)]"
                }
              `}
            >
              <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <span>#{index + 1}</span>
                <span className="capitalize">{step.type}</span>
                {step.toolName && (
                  <code className="text-[var(--accent-cyan)]">{step.toolName}</code>
                )}
              </div>
              <p className="text-sm text-[var(--text-secondary)] mt-1 line-clamp-2">
                {step.content}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Branch Controls */}
      <div className="mt-4 p-4 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl">
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--text-muted)]">
            Branch from step {currentStepIndex + 1}
          </span>
          <button
            onClick={() => setShowBranchInput(!showBranchInput)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-[var(--accent-cyan)] text-black font-medium hover:opacity-90 transition-opacity"
          >
            <GitBranch className="w-4 h-4" />
            {showBranchInput ? "Cancel" : "Branch"}
          </button>
        </div>
        
        {showBranchInput && (
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={branchQuery}
              onChange={(e) => setBranchQuery(e.target.value)}
              placeholder="Enter new query to branch with..."
              className="flex-1 px-3 py-2 text-sm rounded-lg bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
            />
            <button
              onClick={handleBranch}
              disabled={!branchQuery.trim()}
              className="px-4 py-2 text-sm rounded-lg bg-[var(--accent-violet)] text-white font-medium disabled:opacity-50"
            >
              Run Branch
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
