import { openDB, DBSchema, IDBPDatabase } from 'idb';

/**
 * Represents a note stored in the vector database
 */
export interface Note {
  /** Unique identifier (UUID) */
  id: string;
  /** Text content of the note */
  content: string;
  /** 384-dimensional embedding vector from AI model */
  embedding: number[];
  /** Unix timestamp when note was created */
  createdAt: number;
  /** Unix timestamp when note was last updated */
  updatedAt?: number;
  /** Optional tags for categorization */
  tags?: string[];
}

/**
 * Represents a connection between two similar notes
 */
export interface Edge {
  /** ID of the source note */
  source: string;
  /** ID of the target note */
  target: string;
  /** Cosine similarity score (0-1) */
  weight: number;
}

interface VectorDB extends DBSchema {
  notes: {
    key: string;
    value: Note;
    indexes: { 'by-date': number };
  };
  settings: {
    key: string;
    value: unknown;
  };
}

const DB_NAME = 'sr-mesh-db';
const DB_VERSION = 2;

let dbPromise: Promise<IDBPDatabase<VectorDB>> | null = null;

/**
 * Get or create the IndexedDB database instance
 * @returns Promise resolving to the database instance
 */
export const getDB = async () => {
    if (!dbPromise) {
        dbPromise = openDB<VectorDB>(DB_NAME, DB_VERSION, {
            upgrade(db, oldVersion) {
                if (oldVersion < 1) {
                    const store = db.createObjectStore('notes', { keyPath: 'id' });
                    store.createIndex('by-date', 'createdAt');
                }
                if (oldVersion < 2) {
                    if (!db.objectStoreNames.contains('settings')) {
                        db.createObjectStore('settings');
                    }
                }
            },
        });
    }
    return dbPromise;
};

// === CRUD Operations ===

/**
 * Save or update a note in the database
 * @param note - The note object to save
 */
export const saveNote = async (note: Note) => {
    // Validation - allow empty strings, block undefined/null and overly long content
    if (note.content === undefined || note.content === null || note.content.length > 20000) {
        throw new Error('Note content invalid or too long');
    }
    const db = await getDB();
    await db.put('notes', note);
};

/**
 * Get a single note by ID
 * @param id - The note ID to retrieve
 * @returns The note if found, undefined otherwise
 */
export const getNote = async (id: string): Promise<Note | undefined> => {
    const db = await getDB();
    return await db.get('notes', id);
};

/**
 * Get all notes from the database
 * @returns Array of all notes
 */
export const getAllNotes = async (): Promise<Note[]> => {
    const db = await getDB();
    return await db.getAll('notes');
};

/**
 * Count the total number of notes
 * @returns The note count
 */
export const countNotes = async (): Promise<number> => {
    const db = await getDB();
    return await db.count('notes');
};

/**
 * Delete a note by ID
 * @param id - The note ID to delete
 */
export const deleteNote = async (id: string): Promise<void> => {
    const db = await getDB();
    await db.delete('notes', id);
};

/**
 * Update an existing note's content and embedding
 * @param id - The note ID to update
 * @param content - New text content
 * @param embedding - New embedding vector
 */
export const updateNote = async (id: string, content: string, embedding: number[]): Promise<void> => {
    if (content === undefined || content === null || content.length > 20000) throw new Error('Content invalid or too long');
    const db = await getDB();
    const existing = await db.get('notes', id);
    if (existing) {
        existing.content = content;
        existing.embedding = embedding;
        existing.updatedAt = Date.now();
        await db.put('notes', existing);
    }
};

/**
 * Delete all notes from the database
 */
export const clearAllNotes = async (): Promise<void> => {
    const db = await getDB();
    await db.clear('notes');
};

// === Vector Search ===

/**
 * Search for notes similar to a given vector
 * @param vector - The query embedding vector
 * @param limit - Maximum number of results (default: 5)
 * @returns Array of notes with similarity scores, sorted by relevance
 */
export const searchSimilarNotes = async (vector: number[], limit = 5) => {
    const db = await getDB();
    const notes = await db.getAll('notes');
    
    const similar = notes.map(note => ({
        note,
        score: cosineSimilarity(vector, note.embedding)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

    return similar;
};

// === Graph Edges ===

/**
 * Calculate edges between similar notes for graph visualization
 * @param threshold - Minimum similarity score to create an edge (default: 0.6)
 * @returns Array of edges connecting similar notes
 */
export const calculateEdges = async (threshold = 0.6): Promise<Edge[]> => {
    const notes = await getAllNotes();
    const edges: Edge[] = [];
    
    for (let i = 0; i < notes.length; i++) {
        for (let j = i + 1; j < notes.length; j++) {
            const similarity = cosineSimilarity(notes[i].embedding, notes[j].embedding);
            if (similarity >= threshold) {
                edges.push({
                    source: notes[i].id,
                    target: notes[j].id,
                    weight: similarity
                });
            }
        }
    }
    
    return edges;
};

// === Math ===

/**
 * Calculate cosine similarity between two vectors
 * @param a - First vector
 * @param b - Second vector
 * @returns Similarity score between 0 (dissimilar) and 1 (identical)
 * @example
 * cosineSimilarity([1, 0, 0], [1, 0, 0]) // Returns 1
 * cosineSimilarity([1, 0, 0], [0, 1, 0]) // Returns 0
 */
export function cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length || a.length === 0) return 0;
    
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    
    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    if (denominator === 0) return 0;
    
    return dot / denominator;
}
