import { getAllNotes, saveNote, searchSimilarNotes } from './db';
import { classifyText } from './textClassifier';
import { kMeansClustering } from './clustering';
import { safeJsonParse, isExportData, isValidNote, sanitizeNoteContent, isFileSizeValid, type ExportData } from './security';

// ExportData type is now imported from security.ts for validation

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
    // Validate file size first
    if (!isFileSizeValid(file.size)) {
      reject(new Error('File too large. Maximum size is 10MB.'));
      return;
    }

    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        
        // Safe parsing with comprehensive validation
        const data = safeJsonParse<ExportData>(
          content,
          isExportData,
          { version: '', exportedAt: '', notes: [] }
        );

        // Check if parsing/validation failed
        if (!data.version || !data.notes.length) {
          throw new Error('Invalid backup file format or corrupted data');
        }

        // Import notes (skip duplicates by ID)
        let imported = 0;
        for (const note of data.notes) {
          // Extra validation (defense in depth)
          if (!isValidNote(note)) {
            console.warn('[Security] Skipping invalid note during import');
            continue;
          }

          // Sanitize content before saving
          const sanitizedNote = {
            ...note,
            content: sanitizeNoteContent(note.content),
            tags: note.tags?.map(tag => tag.slice(0, 100)) // Limit tag length
          };

          await saveNote(sanitizedNote);
          imported++;
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
