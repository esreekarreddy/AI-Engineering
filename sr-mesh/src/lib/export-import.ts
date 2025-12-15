import { getAllNotes, saveNote, searchSimilarNotes, type Note } from './db';
import { classifyText } from './textClassifier';
import { kMeansClustering } from './clustering';

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
 * Export notes as Markdown with categories and connections
 */
export async function exportAsMarkdown(): Promise<void> {
  const notes = await getAllNotes();
  
  // Get cluster assignments for all notes
  const clusters = kMeansClustering(notes);
  
  // Build markdown with categories and related notes
  const markdownParts: string[] = [
    `# SR Mesh Knowledge Export`,
    ``,
    `> Exported on ${new Date().toLocaleString()}`,
    `> Total thoughts: ${notes.length}`,
    ``,
    `---`,
    ``
  ];

  for (const note of notes) {
    const category = classifyText(note.content);
    const cluster = clusters.get(note.id);
    const date = new Date(note.createdAt).toLocaleString();
    
    // Find related notes
    const relatedNotes = await searchSimilarNotes(note.embedding, 4);
    const related = relatedNotes
      .filter(r => r.note.id !== note.id && r.score > 0.5)
      .slice(0, 3);

    markdownParts.push(`## 💭 ${category}`);
    markdownParts.push(``);
    markdownParts.push(`${note.content}`);
    markdownParts.push(``);
    
    if (related.length > 0) {
      markdownParts.push(`**🔗 Related Thoughts:**`);
      for (const r of related) {
        const relatedCategory = classifyText(r.note.content);
        const preview = r.note.content.length > 60 ? r.note.content.slice(0, 60) + '...' : r.note.content;
        markdownParts.push(`- _${preview}_ (${relatedCategory}, ${Math.round(r.score * 100)}% match)`);
      }
      markdownParts.push(``);
    }
    
    markdownParts.push(`---`);
    markdownParts.push(`📅 Created: ${date}${cluster ? ` | 🎨 Cluster: ${cluster.clusterId}` : ''}`);
    markdownParts.push(``);
    markdownParts.push(`---`);
    markdownParts.push(``);
  }

  const markdown = markdownParts.join('\n');
  
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
