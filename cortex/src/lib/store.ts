// Zustand Store for CORTEX Council State

import { create } from 'zustand';
import { AgentMessage, Finding, CouncilSession } from '@/lib/agents/types';

interface CouncilState {
  // Connection
  isConnected: boolean;
  availableModels: string[];
  
  // Session
  session: CouncilSession | null;
  code: string;
  
  // UI State
  activePanel: 'editor' | 'chat' | 'verdict';
  isRunning: boolean;
  
  // Actions
  setConnected: (connected: boolean, models: string[]) => void;
  setCode: (code: string) => void;
  setActivePanel: (panel: 'editor' | 'chat' | 'verdict') => void;
  setRunning: (running: boolean) => void;
  updateSession: (update: Partial<CouncilSession>) => void;
  addMessage: (message: AgentMessage) => void;
  addFinding: (finding: Finding) => void;
  resetSession: () => void;
}

export const useCouncilStore = create<CouncilState>((set) => ({
  // Initial state
  isConnected: false,
  availableModels: [],
  session: null,
  code: '',
  activePanel: 'editor',
  isRunning: false,

  // Actions
  setConnected: (connected, models) => set({ isConnected: connected, availableModels: models }),
  
  setCode: (code) => set({ code }),
  
  setActivePanel: (panel) => set({ activePanel: panel }),
  
  setRunning: (running) => set({ isRunning: running }),
  
  updateSession: (update) => set((state) => ({
    session: state.session 
      ? { ...state.session, ...update }
      : { 
          id: `session-${Date.now()}`,
          code: state.code,
          findings: [],
          messages: [],
          status: 'idle',
          startedAt: Date.now(),
          ...update 
        } as CouncilSession
  })),
  
  addMessage: (message) => set((state) => ({
    session: state.session 
      ? { ...state.session, messages: [...state.session.messages, message] }
      : null
  })),
  
  addFinding: (finding) => set((state) => ({
    session: state.session 
      ? { ...state.session, findings: [...state.session.findings, finding] }
      : null
  })),
  
  resetSession: () => set({
    session: null,
    isRunning: false,
    activePanel: 'editor'
  })
}));
