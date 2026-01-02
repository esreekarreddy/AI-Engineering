/**
 * Agent Store
 * Manages agent execution state
 */

import { create } from "zustand";
import type { TraceStep } from "../mcp/types";

interface AgentState {
  // Current execution state
  isRunning: boolean;
  currentQuery: string;
  steps: TraceStep[];
  
  // Execution metrics
  startTime: number | null;
  totalTokens: number;
  
  // Actions
  startExecution: (query: string) => void;
  addStep: (step: TraceStep) => void;
  incrementTokens: (count: number) => void;
  stopExecution: () => void;
  reset: () => void;
  
  // Selected step for details view
  selectedStepId: string | null;
  selectStep: (id: string | null) => void;
}

export const useAgentStore = create<AgentState>()((set) => ({
  isRunning: false,
  currentQuery: "",
  steps: [],
  startTime: null,
  totalTokens: 0,
  selectedStepId: null,

  startExecution: (query) =>
    set({
      isRunning: true,
      currentQuery: query,
      steps: [],
      startTime: Date.now(),
      totalTokens: 0,
      selectedStepId: null,
    }),

  addStep: (step) =>
    set((state) => ({
      steps: [...state.steps, step],
    })),

  incrementTokens: (count) =>
    set((state) => ({
      totalTokens: state.totalTokens + count,
    })),

  stopExecution: () =>
    set({
      isRunning: false,
    }),

  reset: () =>
    set({
      isRunning: false,
      currentQuery: "",
      steps: [],
      startTime: null,
      totalTokens: 0,
      selectedStepId: null,
    }),

  selectStep: (id) => set({ selectedStepId: id }),
}));

// Utility to generate step IDs
let stepCounter = 0;
export function generateStepId(): string {
  return `step_${++stepCounter}_${Date.now()}`;
}
