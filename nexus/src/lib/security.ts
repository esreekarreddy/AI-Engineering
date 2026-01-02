/**
 * Security Utilities
 * Safe parsing, validation, and sanitization functions for Nexus
 */

// Safe JSON parsing with validation
export function safeJsonParse<T>(
  json: string,
  validator: (data: unknown) => data is T,
  fallback: T
): T {
  try {
    const parsed = JSON.parse(json);
    
    // Protect against prototype pollution
    if (parsed && typeof parsed === 'object') {
      if ('__proto__' in parsed || 'constructor' in parsed || 'prototype' in parsed) {
        console.warn('[Security] Blocked potential prototype pollution attempt');
        return fallback;
      }
    }
    
    if (validator(parsed)) {
      return parsed;
    }
    
    console.warn('[Security] JSON validation failed');
    return fallback;
  } catch (e) {
    console.warn('[Security] JSON parse error:', e);
    return fallback;
  }
}

// Simple JSON parse with fallback (no validation needed)
export function safeJsonParseSimple<T>(json: string, fallback: T): T {
  try {
    const parsed = JSON.parse(json);
    
    // Protect against prototype pollution
    if (parsed && typeof parsed === 'object') {
      if ('__proto__' in parsed || 'constructor' in parsed || 'prototype' in parsed) {
        console.warn('[Security] Blocked potential prototype pollution attempt');
        return fallback;
      }
    }
    
    return parsed as T;
  } catch {
    return fallback;
  }
}

// Type guard for tool arguments (must be object)
export function isToolArgs(data: unknown): data is Record<string, unknown> {
  return data !== null && typeof data === 'object' && !Array.isArray(data);
}

// Sanitize string input
export function sanitizeInput(input: string, maxLength: number = 10000): string {
  if (typeof input !== 'string') return '';
  return input.slice(0, maxLength).replace(/[<>]/g, '').trim();
}

// Safe localStorage iteration
export function safeLocalStorageSize(): number {
  try {
    let totalSize = 0;
    const keys = Object.keys(localStorage);
    
    for (const key of keys) {
      // Skip prototype properties
      if (!Object.prototype.hasOwnProperty.call(localStorage, key)) continue;
      
      try {
        const value = localStorage.getItem(key);
        if (value) {
          totalSize += value.length * 2; // UTF-16 characters = 2 bytes each
        }
      } catch {
        // Skip inaccessible items
      }
    }
    
    return totalSize;
  } catch (e) {
    console.warn('[Security] localStorage size calculation error:', e);
    return 0;
  }
}

// Clear localStorage safely
export function safeLocalStorageClear(): void {
  try {
    localStorage.clear();
  } catch (e) {
    console.warn('[Security] localStorage clear error:', e);
  }
}
