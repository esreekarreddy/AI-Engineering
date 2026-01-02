/**
 * Security Utilities
 * Safe parsing, validation, and sanitization functions
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
      // Only check for dangerous keys if they are OWN properties
      // 'constructor' is on prototype so 'in' check is always true for objects - that was the bug
      const dangerous = ['__proto__', 'constructor', 'prototype'];
      for (const dangerousKey of dangerous) {
        if (Object.prototype.hasOwnProperty.call(parsed, dangerousKey)) {
          console.warn('[Security] Blocked potential prototype pollution attempt');
          return fallback;
        }
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

// Type guard for StoredProject
export interface StoredProject {
  files: Record<string, string>;
  timestamp: number;
}

export function isStoredProject(data: unknown): data is StoredProject {
  if (!data || typeof data !== 'object') return false;
  const obj = data as Record<string, unknown>;
  
  if (typeof obj.timestamp !== 'number') return false;
  if (!obj.files || typeof obj.files !== 'object') return false;
  
  // Validate file entries structure - path safety is checked during load
  const files = obj.files as Record<string, unknown>;
  for (const [, content] of Object.entries(files)) {
    if (typeof content !== 'string') return false;
  }
  
  return true;
}

// Timing-safe string comparison (for access codes)
export function timingSafeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // Even with different lengths, we still compare to maintain constant time appearance
    // but we know the result will be false
    const maxLen = Math.max(a.length, b.length);
    for (let i = 0; i < maxLen; i++) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _ = (a.charCodeAt(i % a.length) || 0) ^ (b.charCodeAt(i % b.length) || 0);
    }
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

// Sanitize string input (basic XSS prevention)
export function sanitizeInput(input: string, maxLength: number = 10000): string {
  if (typeof input !== 'string') return '';
  
  return input
    .slice(0, maxLength)
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .trim();
}

// Safe localStorage read with validation
export function safeLocalStorageRead<T>(
  key: string,
  validator: (data: unknown) => data is T,
  fallback: T
): T {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return fallback;
    
    return safeJsonParse(stored, validator, fallback);
  } catch (e) {
    console.warn('[Security] localStorage read error:', e);
    return fallback;
  }
}

// Safe localStorage write
export function safeLocalStorageWrite(key: string, data: unknown): boolean {
  try {
    const json = JSON.stringify(data);
    
    // Check size limit (5MB typical localStorage limit)
    if (json.length > 4 * 1024 * 1024) {
      console.warn('[Security] Data too large for localStorage');
      return false;
    }
    
    localStorage.setItem(key, json);
    return true;
  } catch (e) {
    console.warn('[Security] localStorage write error:', e);
    return false;
  }
}
