import { getAllNotes, saveNote, type Note } from './db';

export interface ExportData {
  version: string;
  exportedAt: string;
  notes: Note[];
}

/**
 * Export all notes to a downloadable JSON file
 */
export async function exportData(): Promise<void> {
  const notes = await getAllNotes();
  
  const data: ExportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    notes
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `sr-mesh-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Import notes from a JSON file
 * @returns Number of notes imported
 */
export async function importData(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const data: ExportData = JSON.parse(content);
        
        // Validate format
        if (!data.version || !data.notes || !Array.isArray(data.notes)) {
          throw new Error('Invalid backup file format');
        }

        // Import notes (skip duplicates by ID)
        let imported = 0;
        for (const note of data.notes) {
          if (note.id && note.content && note.embedding) {
            await saveNote({
              id: note.id,
              content: note.content,
              embedding: note.embedding,
              createdAt: note.createdAt || Date.now(),
              updatedAt: note.updatedAt,
              tags: note.tags
            });
            imported++;
          }
        }
        
        resolve(imported);
      } catch (err) {
        reject(err);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

/**
 * Export notes as Markdown files (creates a zip-like download)
 */
export async function exportAsMarkdown(): Promise<void> {
  const notes = await getAllNotes();
  
  const markdown = notes.map(note => {
    const date = new Date(note.createdAt).toLocaleString();
    return `# Thought\n\n${note.content}\n\n---\n_Created: ${date}_\n\n`;
  }).join('\n---\n\n');

  const blob = new Blob([markdown], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `sr-mesh-export-${new Date().toISOString().split('T')[0]}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
