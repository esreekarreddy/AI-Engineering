'use client';

import Editor from '@monaco-editor/react';
import { useCouncilStore } from '@/lib/store';
import { Loader2 } from 'lucide-react';

export function CodeEditor() {
  const { code, setCode, isRunning } = useCouncilStore();

  return (
    <div className="h-full w-full relative">
      <Editor
        height="100%"
        language="typescript"
        theme="vs-dark"
        value={code}
        onChange={(value) => setCode(value || '')}
        loading={
          <div className="h-full flex items-center justify-center" style={{ background: 'var(--bg-surface)' }}>
            <Loader2 size={20} className="animate-spin" style={{ color: 'var(--text-muted)' }} />
          </div>
        }
        options={{
          minimap: { enabled: false },
          fontSize: 13,
          lineHeight: 22,
          fontFamily: "var(--font-mono)",
          fontLigatures: true,
          lineNumbers: 'on',
          glyphMargin: false,
          folding: true,
          lineDecorationsWidth: 12,
          lineNumbersMinChars: 4,
          renderLineHighlight: 'line',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: 'on',
          padding: { top: 16, bottom: 16 },
          readOnly: isRunning,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          smoothScrolling: true,
          bracketPairColorization: { enabled: true },
          scrollbar: {
            vertical: 'auto',
            horizontal: 'auto',
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
          },
        }}
        onMount={(editor, monaco) => {
          monaco.editor.defineTheme('cortex', {
            base: 'vs-dark',
            inherit: true,
            rules: [
              { token: 'comment', foreground: '6b7280', fontStyle: 'italic' },
              { token: 'keyword', foreground: 'c084fc' },
              { token: 'string', foreground: 'a5f3fc' },
              { token: 'number', foreground: 'fbbf24' },
              { token: 'type', foreground: '60a5fa' },
              { token: 'function', foreground: 'f472b6' },
            ],
            colors: {
              'editor.background': '#0f0f12',
              'editor.foreground': '#e4e4e7',
              'editor.lineHighlightBackground': '#18181b',
              'editor.selectionBackground': '#3f3f46',
              'editorCursor.foreground': '#6366f1',
              'editorLineNumber.foreground': '#52525b',
              'editorLineNumber.activeForeground': '#a1a1aa',
              'editor.inactiveSelectionBackground': '#27272a',
            }
          });
          monaco.editor.setTheme('cortex');
        }}
      />
      
      {isRunning && (
        <div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ background: 'rgba(0,0,0,0.5)' }}
        >
          <div 
            className="flex items-center gap-2 px-4 py-2 rounded-lg"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
          >
            <Loader2 size={14} className="animate-spin" style={{ color: 'var(--accent)' }} />
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Council in session…
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
