// Code Preprocessor - Symbol extraction and chunking for large files

interface CodeSymbol {
  name: string;
  type: 'function' | 'class' | 'variable' | 'import' | 'export';
  line: number;
  signature?: string;
}

interface CodeChunk {
  content: string;
  startLine: number;
  endLine: number;
  symbols: string[];
}

interface PreprocessedCode {
  symbolMap: CodeSymbol[];
  chunks: CodeChunk[];
  summary: string;
  language: string;
  totalLines: number;
}

const MAX_CHUNK_SIZE = 2000; // ~2000 chars per chunk for context efficiency
const CHUNK_OVERLAP = 200;   // Overlap to maintain context between chunks

/**
 * Detect the programming language from code content
 */
function detectLanguage(code: string): string {
  if (code.includes('import React') || code.includes('tsx') || code.includes('jsx')) return 'typescript/react';
  if (code.includes('from typing import') || code.includes('def ')) return 'python';
  if (code.includes('package main') || code.includes('func ')) return 'go';
  if (code.includes('fn ') && code.includes('let ')) return 'rust';
  if (code.includes('public class') || code.includes('private void')) return 'java';
  if (code.includes('const ') || code.includes('function ') || code.includes('=>')) return 'javascript';
  return 'unknown';
}

/**
 * Extract symbols (functions, classes, etc.) from code
 */
function extractSymbols(code: string): CodeSymbol[] {
  const symbols: CodeSymbol[] = [];
  const lines = code.split('\n');

  // Regex patterns for common symbol types
  const patterns = [
    { type: 'function' as const, regex: /^(?:export\s+)?(?:async\s+)?function\s+(\w+)/m },
    { type: 'function' as const, regex: /(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*=>/m },
    { type: 'function' as const, regex: /(?:const|let|var)\s+(\w+)\s*=\s*function/m },
    { type: 'class' as const, regex: /^(?:export\s+)?class\s+(\w+)/m },
    { type: 'function' as const, regex: /^\s*(?:public|private|protected)?\s*(?:async\s+)?(\w+)\s*\([^)]*\)\s*[:{]/m },
    { type: 'import' as const, regex: /^import\s+.*from\s+['"]([^'"]+)['"]/m },
    { type: 'export' as const, regex: /^export\s+(?:default\s+)?(?:const|let|var|function|class)\s+(\w+)/m },
  ];

  lines.forEach((line, idx) => {
    for (const { type, regex } of patterns) {
      const match = line.match(regex);
      if (match) {
        symbols.push({
          name: match[1],
          type,
          line: idx + 1,
          signature: line.trim().slice(0, 80) + (line.trim().length > 80 ? '...' : '')
        });
        break;
      }
    }
  });

  return symbols;
}

/**
 * Split code into manageable chunks with overlap
 */
function chunkCode(code: string, symbols: CodeSymbol[]): CodeChunk[] {
  const lines = code.split('\n');
  const chunks: CodeChunk[] = [];
  
  // If code is small enough, return as single chunk
  if (code.length <= MAX_CHUNK_SIZE) {
    return [{
      content: code,
      startLine: 1,
      endLine: lines.length,
      symbols: symbols.map(s => s.name)
    }];
  }

  // Split by logical boundaries (functions, classes) or by size
  let currentChunk = '';
  let startLine = 1;
  let chunkSymbols: string[] = [];

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    
    // Check if this line starts a new symbol
    const symbolAtLine = symbols.find(s => s.line === lineNum);
    
    // If adding this line exceeds chunk size and we're at a symbol boundary, start new chunk
    if (currentChunk.length > MAX_CHUNK_SIZE && symbolAtLine) {
      chunks.push({
        content: currentChunk,
        startLine,
        endLine: lineNum - 1,
        symbols: [...new Set(chunkSymbols)]
      });
      
      // Start new chunk with overlap
      const overlapLines = currentChunk.split('\n').slice(-5).join('\n');
      currentChunk = overlapLines + '\n' + line + '\n';
      startLine = lineNum - 5;
      chunkSymbols = [];
    } else {
      currentChunk += line + '\n';
    }
    
    if (symbolAtLine) {
      chunkSymbols.push(symbolAtLine.name);
    }
  });

  // Push remaining content
  if (currentChunk.trim()) {
    chunks.push({
      content: currentChunk,
      startLine,
      endLine: lines.length,
      symbols: [...new Set(chunkSymbols)]
    });
  }

  return chunks;
}

/**
 * Generate a code summary for the moderator's code map
 */
function generateSummary(symbols: CodeSymbol[], language: string, totalLines: number): string {
  const functions = symbols.filter(s => s.type === 'function');
  const classes = symbols.filter(s => s.type === 'class');
  const imports = symbols.filter(s => s.type === 'import');

  let summary = `Language: ${language}\n`;
  summary += `Total Lines: ${totalLines}\n`;
  summary += `Functions: ${functions.length}\n`;
  summary += `Classes: ${classes.length}\n`;
  summary += `Imports: ${imports.length}\n\n`;

  if (classes.length > 0) {
    summary += `Classes: ${classes.map(c => c.name).join(', ')}\n`;
  }
  
  if (functions.length > 0) {
    summary += `Key Functions: ${functions.slice(0, 10).map(f => f.name).join(', ')}`;
    if (functions.length > 10) summary += ` (+${functions.length - 10} more)`;
  }

  return summary;
}

/**
 * Main preprocessing function
 */
export function preprocessCode(code: string): PreprocessedCode {
  const language = detectLanguage(code);
  const symbols = extractSymbols(code);
  const chunks = chunkCode(code, symbols);
  const totalLines = code.split('\n').length;
  const summary = generateSummary(symbols, language, totalLines);

  return {
    symbolMap: symbols,
    chunks,
    summary,
    language,
    totalLines
  };
}

/**
 * Get the most relevant chunk for a specific finding
 */
export function getChunkForLines(preprocessed: PreprocessedCode, startLine: number, endLine: number): string {
  const chunk = preprocessed.chunks.find(
    c => c.startLine <= startLine && c.endLine >= endLine
  );
  return chunk?.content || '';
}
