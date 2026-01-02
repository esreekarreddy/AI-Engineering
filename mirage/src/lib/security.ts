/**
 * Security Utilities
 * Safe parsing, validation, and sanitization functions for Mirage
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

// Type guard for Access Data
export interface AccessData {
  code: string;
  timestamp: number;
}

export function isAccessData(data: unknown): data is AccessData {
  if (!data || typeof data !== 'object') return false;
  const obj = data as Record<string, unknown>;
  
  return (
    typeof obj.code === 'string' &&
    obj.code.length > 0 &&
    obj.code.length < 256 && // Reasonable length limit
    typeof obj.timestamp === 'number' &&
    obj.timestamp > 0 &&
    obj.timestamp <= Date.now() + 60000 // Not in future (with 1 min tolerance)
  );
}

// Timing-safe string comparison (for access codes)
export function timingSafeCompare(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  
  // Pad to same length to prevent length-based timing leaks
  const maxLen = Math.max(a.length, b.length, 1);
  const paddedA = a.padEnd(maxLen, '\0');
  const paddedB = b.padEnd(maxLen, '\0');
  
  let result = 0;
  for (let i = 0; i < maxLen; i++) {
    result |= paddedA.charCodeAt(i) ^ paddedB.charCodeAt(i);
  }
  
  // Return false if lengths differ OR if any characters differ
  return result === 0 && a.length === b.length;
}

// Sanitize string input (basic XSS prevention)
export function sanitizeInput(input: string, maxLength: number = 10000): string {
  if (typeof input !== 'string') return '';
  
  return input
    .slice(0, maxLength)
    .replace(/[<>]/g, '')
    .trim();
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
  // Model names should be alphanumeric with allowed special chars
  return /^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,255}$/.test(model);
}

// Request body size check
export const MAX_REQUEST_SIZE = 10 * 1024 * 1024; // 10MB

export function isRequestBodySizeValid(body: string): boolean {
  return body.length <= MAX_REQUEST_SIZE;
}
