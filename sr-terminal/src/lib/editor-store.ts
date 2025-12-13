import { create } from 'zustand';

interface EditorState {
  cursorPosition: { lineNumber: number; column: number } | null;
  selection: string | null; // Selected text
  
  setCursorPosition: (pos: { lineNumber: number; column: number } | null) => void;
  setSelection: (text: string | null) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  cursorPosition: null,
  selection: null,
  
  setCursorPosition: (pos) => set({ cursorPosition: pos }),
  setSelection: (text) => set({ selection: text }),
}));
