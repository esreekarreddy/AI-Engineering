import { expect, test, describe } from 'vitest'
import { cosineSimilarity } from './db'

describe('Vector Math', () => {
  test('cosineSimilarity calculates correct logic', () => {
    const v1 = [1, 0, 0];
    const v2 = [1, 0, 0];
    const v3 = [0, 1, 0];
    const v4 = [0.5, 0.5, 0];

    // Identical vectors = 1
    expect(cosineSimilarity(v1, v2)).toBeCloseTo(1);

    // Orthogonal vectors = 0
    expect(cosineSimilarity(v1, v3)).toBeCloseTo(0);

    // 45 degree angle
    expect(cosineSimilarity(v1, v4)).toBeCloseTo(0.707);
  })

  test('handles empty or zero vectors gracefully', () => {
    const v1 = [0, 0, 0];
    const v2 = [1, 1, 1];
    // v2.0: Returns 0 for zero-norm vectors (safer than NaN)
    expect(cosineSimilarity(v1, v2)).toBe(0);
  })
})
