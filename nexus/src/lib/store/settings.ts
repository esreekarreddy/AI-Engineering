/**
 * Settings Store
 * Manages user preferences and model selection
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { OllamaStatus } from "../ollama/types";

interface SettingsState {
  // Model selection
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  
  // Ollama connection
  ollamaStatus: OllamaStatus;
  setOllamaStatus: (status: OllamaStatus) => void;
  
  // Available models (detected from Ollama)
  availableModels: string[];
  setAvailableModels: (models: string[]) => void;
  
  // Reset all settings
  reset: () => void;
}

const defaultSettings = {
  selectedModel: "mistral:7b",
  ollamaStatus: "checking" as OllamaStatus,
  availableModels: [] as string[],
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,

      setSelectedModel: (model) => set({ selectedModel: model }),
      
      setOllamaStatus: (status) => set({ ollamaStatus: status }),
      
      setAvailableModels: (models) => set({ availableModels: models }),
      
      reset: () => set(defaultSettings),
    }),
    {
      name: "nexus_settings",
      partialize: (state) => ({
        selectedModel: state.selectedModel,
      }),
    }
  )
);
