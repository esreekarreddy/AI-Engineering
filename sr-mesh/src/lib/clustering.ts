import { cosineSimilarity } from './db';
import type { Note } from './db';

export interface ClusterResult {
  clusterId: number;
  color: string;
  label: string;
}

// Predefined cluster colors (vibrant for 3D visualization)
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

const CLUSTER_LABELS = [
  'Ideas', 'Insights', 'Questions', 'Projects',
  'Learning', 'Personal', 'Work', 'Creative'
];

/**
 * Simple K-means clustering for notes based on embeddings
 * Uses K-means++ initialization for better centroid selection
 */
export function kMeansClustering(
  notes: Note[], 
  k: number = 4, 
  maxIterations: number = 15
): Map<string, ClusterResult> {
  if (notes.length === 0) return new Map();
  
  // For very few notes, assign distinct colors directly
  if (notes.length <= k) {
    const result = new Map<string, ClusterResult>();
    notes.forEach((note, i) => {
      result.set(note.id, {
        clusterId: i,
        color: CLUSTER_COLORS[i % CLUSTER_COLORS.length],
        label: CLUSTER_LABELS[i % CLUSTER_LABELS.length]
      });
    });
    return result;
  }

  const embeddings = notes.map(n => n.embedding);
  const dim = embeddings[0].length;

  // K-means++ initialization: choose centroids spread apart
  const centroids: number[][] = [];
  // First centroid: random
  centroids.push([...embeddings[Math.floor(Math.random() * notes.length)]]);
  
  // Remaining centroids: choose points far from existing centroids
  while (centroids.length < k) {
    const distances = embeddings.map(emb => {
      // Min distance to any existing centroid (1 - similarity)
      const minDist = Math.min(...centroids.map(c => 1 - cosineSimilarity(emb, c)));
      return minDist * minDist; // Square for probability weighting
    });
    
    const totalDist = distances.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalDist;
    
    for (let i = 0; i < distances.length; i++) {
      random -= distances[i];
      if (random <= 0) {
        centroids.push([...embeddings[i]]);
        break;
      }
    }
    
    // Fallback if loop doesn't pick
    if (centroids.length < k) {
      centroids.push([...embeddings[Math.floor(Math.random() * notes.length)]]);
    }
  }

  // Cluster assignments
  let assignments = new Array(notes.length).fill(0);

  for (let iter = 0; iter < maxIterations; iter++) {
    // Assign each point to nearest centroid
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
    if (JSON.stringify(newAssignments) === JSON.stringify(assignments)) {
      break;
    }
    assignments = newAssignments;

    // Update centroids
    for (let clusterIdx = 0; clusterIdx < k; clusterIdx++) {
      const clusterPoints = embeddings.filter((_, i) => assignments[i] === clusterIdx);
      if (clusterPoints.length === 0) continue;
      
      // Average of all points in cluster
      const newCentroid = new Array(dim).fill(0);
      clusterPoints.forEach(point => {
        point.forEach((val, d) => {
          newCentroid[d] += val / clusterPoints.length;
        });
      });
      centroids[clusterIdx] = newCentroid;
    }
  }

  // Build result map
  const result = new Map<string, ClusterResult>();
  notes.forEach((note, i) => {
    const clusterId = assignments[i];
    result.set(note.id, {
      clusterId,
      color: CLUSTER_COLORS[clusterId % CLUSTER_COLORS.length],
      label: CLUSTER_LABELS[clusterId % CLUSTER_LABELS.length]
    });
  });

  return result;
}

/**
 * Determine optimal k - use more clusters for better color variety
 */
export function determineOptimalK(notesCount: number): number {
  if (notesCount <= 2) return notesCount;
  if (notesCount <= 5) return 3;
  if (notesCount <= 10) return 4;
  if (notesCount <= 20) return 5;
  return Math.min(8, Math.ceil(Math.sqrt(notesCount)));
}
