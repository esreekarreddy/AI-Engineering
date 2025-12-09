// Re-export types from db.ts for convenience
import type { Note, Edge } from './db';
export type { Note, Edge };

export interface SimilarNote {
  note: Note;
  score: number;
}

export interface NodePoint extends Note {
  position: [number, number, number];
}

// Worker message types
export interface WorkerProgressData {
  status: string;
  loaded?: number;
  total?: number;
}

export interface WorkerMessage {
  type: 'embed' | 'progress' | 'complete' | 'error';
  text?: string;
  data?: WorkerProgressData;
  embedding?: number[];
  error?: string;
}
