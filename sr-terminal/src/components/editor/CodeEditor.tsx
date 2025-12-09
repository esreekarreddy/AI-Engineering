import Editor, { OnMount } from '@monaco-editor/react';
import { useFileStore } from '@/lib/file-store';

export default function CodeEditor() {
  const { selectedFile, fileContents, updateFileContent, saveFile, isDirty } = useFileStore();

  // When selectedFile changes, we want to reset the editor content.
  // Using key={selectedFile} on the Editor component is the cleanest way to force a reset.
  
  // Keyboard shortcut to save
  const handleEditorMount: OnMount = (editor, monaco) => {
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      if (selectedFile) {
        saveFile(selectedFile);
      }
    });
  };

  if (!selectedFile) {
    return (
      <div className="h-full w-full flex items-center justify-center text-[var(--text-secondary)] bg-[var(--bg-primary)]">
        <div className="text-center">
            <p className="mb-2">⌘</p>
            <p className="text-sm">Select a file to edit</p>
        </div>
      </div>
    );
  }

  // We use the file content from store as initial value
  const initialValue = fileContents[selectedFile] || '';

  return (
    <div className="relative h-full w-full">
      <Editor
        key={selectedFile} // Forces remount when file changes
        height="100%"
        defaultLanguage="javascript"
        path={selectedFile} 
        defaultValue={initialValue} // Use defaultValue since we want to manage loose state in Monaco until we sync back
        onChange={(value) => updateFileContent(selectedFile, value || '')}
        onMount={handleEditorMount}
        theme="vs-dark" 
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: '"JetBrains Mono", monospace',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 16 }
        }}
      />
      {isDirty[selectedFile] && (
        <div className="absolute top-2 right-4 text-xs text-[var(--accent-orange)] bg-[var(--bg-secondary)] px-2 py-1 rounded shadow-sm z-10 font-bold">
            UNSAVED • ⌘S
        </div>
      )}
    </div>
  );
}
