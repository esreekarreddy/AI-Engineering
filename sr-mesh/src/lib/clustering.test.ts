import { describe, test, expect } from 'vitest';
import { kMeansClustering, determineOptimalK } from './clustering';
import type { Note } from './db';

// Helper to create mock notes with random embeddings
function createMockNote(id: string, content: string): Note {
  // Create a 384-dim embedding with some pattern based on content
  const embedding = new Array(384).fill(0).map((_, i) => 
    Math.sin(content.charCodeAt(i % content.length) * (i + 1) * 0.01)
  );
  
  return {
    id,
    content,
    embedding,
    createdAt: Date.now()
  };
}

describe('Clustering', () => {
  describe('determineOptimalK', () => {
    test('returns count for very few notes', () => {
      expect(determineOptimalK(1)).toBe(1);
      expect(determineOptimalK(2)).toBe(2);
    });

    test('returns 3 for small collections', () => {
      expect(determineOptimalK(3)).toBe(3);
      expect(determineOptimalK(4)).toBe(3);
      expect(determineOptimalK(5)).toBe(3);
    });

    test('returns 4 for medium collections', () => {
      expect(determineOptimalK(6)).toBe(4);
      expect(determineOptimalK(10)).toBe(4);
    });

    test('returns 5 for larger collections', () => {
      expect(determineOptimalK(15)).toBe(5);
      expect(determineOptimalK(20)).toBe(5);
    });

    test('caps at 8 for very large collections', () => {
      expect(determineOptimalK(100)).toBeLessThanOrEqual(8);
    });
  });

  describe('kMeansClustering', () => {
    test('returns empty map for empty notes', () => {
      const result = kMeansClustering([], 3);
      expect(result.size).toBe(0);
    });

    test('assigns each note to a cluster', () => {
      const notes = [
        createMockNote('1', 'machine learning is great'),
        createMockNote('2', 'artificial intelligence rocks'),
        createMockNote('3', 'deep learning neural networks'),
        createMockNote('4', 'cooking recipes are fun'),
        createMockNote('5', 'baking bread at home'),
      ];
      
      const result = kMeansClustering(notes, 3);
      
      // Each note should have a cluster assignment
      expect(result.size).toBe(5);
      
      // Each result should have color and label
      notes.forEach(note => {
        const cluster = result.get(note.id);
        expect(cluster).toBeDefined();
        expect(cluster?.color).toMatch(/^#[0-9a-f]{6}$/i);
        expect(cluster?.label).toBeTruthy();
      });
    });

    test('assigns distinct colors for few notes', () => {
      const notes = [
        createMockNote('1', 'first note'),
        createMockNote('2', 'second note'),
      ];
      
      const result = kMeansClustering(notes, 3);
      
      const color1 = result.get('1')?.color;
      const color2 = result.get('2')?.color;
      
      // With only 2 notes and k=3, each should get its own cluster
      expect(color1).not.toBe(color2);
    });

    test('cluster IDs are within valid range', () => {
      const notes = Array.from({ length: 10 }, (_, i) => 
        createMockNote(String(i), `note number ${i}`)
      );
      
      const k = 4;
      const result = kMeansClustering(notes, k);
      
      result.forEach(cluster => {
        expect(cluster.clusterId).toBeGreaterThanOrEqual(0);
        expect(cluster.clusterId).toBeLessThan(k);
      });
    });
  });
});
