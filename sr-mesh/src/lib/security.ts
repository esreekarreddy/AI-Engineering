/**
 * Security Utilities
 * Safe parsing, validation, and sanitization functions for SR Mesh
 */

import type { Note } from './db';

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

// Type guard for ExportData
export interface ExportData {
  version: string;
  exportedAt: string;
  notes: Note[];
}

export function isExportData(data: unknown): data is ExportData {
  if (!data || typeof data !== 'object') return false;
  const obj = data as Record<string, unknown>;
  
  // Validate required fields
  if (typeof obj.version !== 'string') return false;
  if (typeof obj.exportedAt !== 'string') return false;
  if (!Array.isArray(obj.notes)) return false;
  
  // Validate each note
  for (const note of obj.notes) {
    if (!isValidNote(note)) return false;
  }
  
  return true;
}

// Validate individual note structure
export function isValidNote(data: unknown): data is Note {
  if (!data || typeof data !== 'object') return false;
  const obj = data as Record<string, unknown>;
  
  // Required fields
  if (typeof obj.id !== 'string' || obj.id.length === 0) return false;
  if (typeof obj.content !== 'string') return false;
  if (!Array.isArray(obj.embedding)) return false;
  if (typeof obj.createdAt !== 'number') return false;
  
  // Validate embedding dimensions (should be consistent)
  if (obj.embedding.length < 1 || obj.embedding.length > 4096) return false;
  for (const val of obj.embedding) {
    if (typeof val !== 'number' || !isFinite(val)) return false;
  }
  
  // Optional fields
  if (obj.updatedAt !== undefined && typeof obj.updatedAt !== 'number') return false;
  if (obj.tags !== undefined && !Array.isArray(obj.tags)) return false;
  
  // Validate tags if present
  if (Array.isArray(obj.tags)) {
    for (const tag of obj.tags) {
      if (typeof tag !== 'string') return false;
    }
  }
  
  return true;
}

// Sanitize note content
export function sanitizeNoteContent(content: string, maxLength: number = 50000): string {
  if (typeof content !== 'string') return '';
  
  return content
    .slice(0, maxLength)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control chars except newline/tab
    .trim();
}

// File size limit for imports (10MB)
export const MAX_IMPORT_FILE_SIZE = 10 * 1024 * 1024;

export function isFileSizeValid(size: number): boolean {
  return size > 0 && size <= MAX_IMPORT_FILE_SIZE;
}
