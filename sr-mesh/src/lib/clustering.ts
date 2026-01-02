import { cosineSimilarity } from './db';
import type { Note } from './db';
import { classifyText } from './textClassifier';

export interface ClusterResult {
  clusterId: number;
  color: string;
  label: string;
}

// Vibrant cluster colors for 3D visualization
const CLUSTER_COLORS = [
  '#3b82f6', // Blue
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#f97316', // Orange
  '#22c55e', // Green
  '#06b6d4', // Cyan
  '#eab308', // Yellow
  '#ef4444', // Red
];

/**
 * K-means++ clustering for notes based on embedding vectors
 * Groups semantically similar notes together using cosine similarity
 * 
 * @param notes - Array of notes with embeddings
 * @param k - Number of clusters (default: auto-determined)
 * @param maxIterations - Maximum iterations for convergence
 * @returns Map of note ID to cluster result (color + label)
 */
export function kMeansClustering(
  notes: Note[], 
  k: number = 4, 
  maxIterations: number = 20
): Map<string, ClusterResult> {
  if (notes.length === 0) return new Map();
  
  // For very few notes, assign distinct clusters directly
  if (notes.length <= k) {
    const result = new Map<string, ClusterResult>();
    notes.forEach((note, i) => {
      result.set(note.id, {
        clusterId: i,
        color: CLUSTER_COLORS[i % CLUSTER_COLORS.length],
        label: classifyText(note.content)  // Use intelligent classification
      });
    });
    return result;
  }

  const embeddings = notes.map(n => n.embedding);
  const dim = embeddings[0]?.length || 384;

  // === K-means++ Initialization ===
  // Choose initial centroids that are spread apart for better clustering
  const centroids: number[][] = [];
  
  // First centroid: random selection
  const firstIdx = Math.floor(Math.random() * notes.length);
  centroids.push([...embeddings[firstIdx]]);
  
  // Remaining centroids: probability proportional to distance squared
  while (centroids.length < k) {
    const distances = embeddings.map(emb => {
      // Find minimum distance to any existing centroid
      const minDist = Math.min(
        ...centroids.map(c => 1 - cosineSimilarity(emb, c))
      );
      return minDist * minDist; // Square for weighted probability
    });
    
    const totalDist = distances.reduce((a, b) => a + b, 0);
    
    if (totalDist === 0) {
      // All points are identical, pick random
      centroids.push([...embeddings[Math.floor(Math.random() * notes.length)]]);
      continue;
    }
    
    // Weighted random selection
    let random = Math.random() * totalDist;
    let selected = false;
    
    for (let i = 0; i < distances.length; i++) {
      random -= distances[i];
      if (random <= 0) {
        centroids.push([...embeddings[i]]);
        selected = true;
        break;
      }
    }
    
    // Fallback if loop didn't select
    if (!selected) {
      centroids.push([...embeddings[Math.floor(Math.random() * notes.length)]]);
    }
  }

  // === K-means Iteration ===
  let assignments = new Array(notes.length).fill(0);

  for (let iter = 0; iter < maxIterations; iter++) {
    // Assignment step: assign each point to nearest centroid
    const newAssignments = embeddings.map(emb => {
      let bestCluster = 0;
      let bestSimilarity = -Infinity;
      
      centroids.forEach((centroid, clusterIdx) => {
        const similarity = cosineSimilarity(emb, centroid);
        if (similarity > bestSimilarity) {
          bestSimilarity = similarity;
          bestCluster = clusterIdx;
        }
      });
      
      return bestCluster;
    });

    // Check for convergence
    const converged = newAssignments.every((a, i) => a === assignments[i]);
    if (converged) break;
    
    assignments = newAssignments;

    // Update step: recalculate centroids as mean of assigned points
    for (let clusterIdx = 0; clusterIdx < k; clusterIdx++) {
      const clusterPoints = embeddings.filter((_, i) => assignments[i] === clusterIdx);
      
      if (clusterPoints.length === 0) continue;
      
      // Calculate mean vector
      const newCentroid = new Array(dim).fill(0);
      clusterPoints.forEach(point => {
        point.forEach((val, d) => {
          newCentroid[d] += val / clusterPoints.length;
        });
      });
      
      centroids[clusterIdx] = newCentroid;
    }
  }

  // === Build Result Map ===
  // K-means determines CLUSTER (color grouping)
  // textClassifier determines LABEL (semantic meaning)
  const result = new Map<string, ClusterResult>();
  
  notes.forEach((note, i) => {
    const clusterId = assignments[i];
    result.set(note.id, {
      clusterId,
      color: CLUSTER_COLORS[clusterId % CLUSTER_COLORS.length],
      label: classifyText(note.content)  // Intelligent classification for labels
    });
  });

  return result;
}

/**
 * Determine optimal number of clusters based on dataset size
 * Uses elbow method heuristic for automatic k selection
 */
export function determineOptimalK(notesCount: number): number {
  if (notesCount <= 2) return notesCount;
  if (notesCount <= 5) return 3;
  if (notesCount <= 10) return 4;
  if (notesCount <= 20) return 5;
  if (notesCount <= 50) return 6;
  return Math.min(8, Math.ceil(Math.sqrt(notesCount)));
}
