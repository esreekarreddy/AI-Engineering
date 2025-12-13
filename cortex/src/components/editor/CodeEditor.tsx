'use client';

import Editor from '@monaco-editor/react';
import { useCouncilStore } from '@/lib/store';

export function CodeEditor() {
  const { code, setCode, isRunning } = useCouncilStore();

  return (
    <div className="h-full w-full relative panel-inset">
      <Editor
        height="100%"
        language="typescript"
        theme="vs-dark"
        value={code}
        onChange={(value) => setCode(value || '')}
        options={{
          minimap: { enabled: false },
          fontSize: 13,
          fontFamily: "var(--font-mono)",
          lineNumbers: 'on',
          glyphMargin: false,
          folding: true,
          lineDecorationsWidth: 8,
          lineNumbersMinChars: 3,
          renderLineHighlight: 'line',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: 'on',
          padding: { top: 16, bottom: 16 },
          readOnly: isRunning,
          cursorBlinking: 'smooth',
          smoothScrolling: true,
          scrollbar: {
            vertical: 'auto',
            horizontal: 'auto',
            verticalScrollbarSize: 6,
            horizontalScrollbarSize: 6,
          },
        }}
      />
      
      {/* Running Overlay */}
      {isRunning && (
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
          <div className="text-[12px] text-[rgb(var(--text-muted))] font-mono">
            Council in session...
          </div>
        </div>
      )}
    </div>
  );
}
