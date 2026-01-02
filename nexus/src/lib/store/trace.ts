/**
 * Trace Store
 * Manages trace history with localStorage persistence
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Trace } from "../mcp/types";

const MAX_TRACES = 50;

interface TraceState {
  // Trace history
  traces: Trace[];
  
  // Add a new trace
  addTrace: (trace: Trace) => void;
  
  // Get trace by ID
  getTrace: (id: string) => Trace | undefined;
  
  // Delete a trace
  deleteTrace: (id: string) => void;
  
  // Clear all traces
  clearTraces: () => void;
  
  // Get trace count
  getTraceCount: () => number;
}

export const useTraceStore = create<TraceState>()(
  persist(
    (set, get) => ({
      traces: [],

      addTrace: (trace) =>
        set((state) => {
          const newTraces = [trace, ...state.traces];
          // Limit to MAX_TRACES
          if (newTraces.length > MAX_TRACES) {
            newTraces.pop();
          }
          return { traces: newTraces };
        }),

      getTrace: (id) => {
        return get().traces.find((t) => t.id === id);
      },

      deleteTrace: (id) =>
        set((state) => ({
          traces: state.traces.filter((t) => t.id !== id),
        })),

      clearTraces: () => set({ traces: [] }),

      getTraceCount: () => get().traces.length,
    }),
    {
      name: "nexus_traces",
    }
  )
);
