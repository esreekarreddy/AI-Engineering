/**
 * Security Utilities
 * Safe parsing, validation, and sanitization functions for Cortex
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

// Timing-safe string comparison (for access codes)
export function timingSafeCompare(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  
  const maxLen = Math.max(a.length, b.length, 1);
  const paddedA = a.padEnd(maxLen, '\0');
  const paddedB = b.padEnd(maxLen, '\0');
  
  let result = 0;
  for (let i = 0; i < maxLen; i++) {
    result |= paddedA.charCodeAt(i) ^ paddedB.charCodeAt(i);
  }
  
  return result === 0 && a.length === b.length;
}

// Validate request action type
export function isValidAction(action: unknown): action is string {
  if (typeof action !== 'string') return false;
  const validActions = ['verify-access', 'list', 'chat'];
  return validActions.includes(action);
}

// Validate model name format
export function isValidModelName(model: unknown): model is string {
  if (typeof model !== 'string') return false;
  return /^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,255}$/.test(model);
}

// Request body size check
export const MAX_REQUEST_SIZE = 10 * 1024 * 1024; // 10MB

// Sanitize string input
export function sanitizeInput(input: string, maxLength: number = 10000): string {
  if (typeof input !== 'string') return '';
  return input.slice(0, maxLength).replace(/[<>]/g, '').trim();
}
