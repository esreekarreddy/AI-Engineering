import { create } from 'zustand';
import { WebContainer } from '@webcontainer/api';
import { getWebContainerInstance } from './webcontainer';

const STORAGE_KEY = 'sr-terminal-files';

interface FileNode {
  name: string;
  kind: 'file' | 'directory';
  path: string;
  children?: FileNode[];
}

interface StoredProject {
  files: Record<string, string>;
  timestamp: number;
}

interface FileStore {
  fileTree: FileNode[];
  selectedFile: string | null;
  fileContents: Record<string, string>;
  isDirty: Record<string, boolean>;
  
  // Actions
  refreshFileTree: () => Promise<void>;
  selectFile: (path: string) => Promise<void>;
  updateFileContent: (path: string, content: string) => void;
  saveFile: (path: string) => Promise<void>;
  createFile: (name: string) => Promise<void>;
  deleteFile: (path: string) => Promise<void>;
  renameFile: (oldPath: string, newPath: string) => Promise<void>;
  getVSFStats: () => Promise<{ fileCount: number; totalSize: number }>;
  
  // Persistence
  saveToLocalStorage: () => Promise<void>;
  loadFromLocalStorage: () => Promise<boolean>;
  clearLocalStorage: () => void;
  hasUnsavedChanges: () => boolean;
}

export const useFileStore = create<FileStore>((set, get) => ({
  fileTree: [],
  selectedFile: null,
  fileContents: {},
  isDirty: {},

  getVSFStats: async () => {
      const webcontainer = await getWebContainerInstance();
      let fileCount = 0;
      let totalSize = 0;

      async function traverse(dir: string) {
          const entries = await webcontainer.fs.readdir(dir, { withFileTypes: true });
          for (const entry of entries) {
              const fullPath = dir === '.' ? entry.name : `${dir}/${entry.name}`;
              if (entry.isDirectory()) {
                  await traverse(fullPath);
              } else {
                  fileCount++;
                  const content = await webcontainer.fs.readFile(fullPath, 'utf-8');
                  totalSize += content.length;
              }
          }
      }

      await traverse('.');
      return { fileCount, totalSize };
  },

  refreshFileTree: async () => {
    const webcontainer = await getWebContainerInstance();
    const tree = await readFileTree(webcontainer, '.');
    set({ fileTree: tree });
  },

  selectFile: async (path) => {
    const { fileContents } = get();
    if (fileContents[path]) {
      set({ selectedFile: path });
      return;
    }

    const webcontainer = await getWebContainerInstance();
    try {
      const content = await webcontainer.fs.readFile(path, 'utf-8');
      set((state) => ({
        selectedFile: path,
        fileContents: { ...state.fileContents, [path]: content },
      }));
    } catch (e) {
      console.error('Failed to read file', path, e);
    }
  },

  updateFileContent: (path, content) => {
    set((state) => ({
      fileContents: { ...state.fileContents, [path]: content },
      isDirty: { ...state.isDirty, [path]: true },
    }));
  },

  saveFile: async (path) => {
    const { fileContents, saveToLocalStorage } = get();
    const content = fileContents[path];
    const webcontainer = await getWebContainerInstance();
    
    await webcontainer.fs.writeFile(path, content);
    
    set((state) => ({
      isDirty: { ...state.isDirty, [path]: false }
    }));

    // Also persist to localStorage
    await saveToLocalStorage();
  },

  createFile: async (name) => {
    const webcontainer = await getWebContainerInstance();
    await webcontainer.fs.writeFile(name, ''); // Create empty file
    await get().refreshFileTree();
    await get().selectFile(name);
    await get().saveToLocalStorage();
  },

  deleteFile: async (path) => {
    const webcontainer = await getWebContainerInstance();
    await webcontainer.fs.rm(path, { recursive: true });
    await get().refreshFileTree();
    set((state) => ({
      selectedFile: state.selectedFile === path ? null : state.selectedFile,
      fileContents: (() => {
        const newContents = { ...state.fileContents };
        delete newContents[path];
        return newContents;
      })(),
      isDirty: (() => {
        const newDirty = { ...state.isDirty };
        delete newDirty[path];
        return newDirty;
      })()
    }));
    await get().saveToLocalStorage();
  },

  renameFile: async (oldPath, newPath) => {
    const webcontainer = await getWebContainerInstance();
    try {
        await webcontainer.fs.rename(oldPath, newPath);
        
        set((state) => {
            const newContents = { ...state.fileContents };
            const newDirty = { ...state.isDirty };
            
            // Move content in memory if exists
            if (newContents[oldPath]) {
                newContents[newPath] = newContents[oldPath];
                delete newContents[oldPath];
            }

            // Move dirty state
            if (newDirty[oldPath] !== undefined) {
                newDirty[newPath] = newDirty[oldPath];
                delete newDirty[oldPath];
            }

            return {
                fileContents: newContents,
                isDirty: newDirty,
                selectedFile: state.selectedFile === oldPath ? newPath : state.selectedFile
            };
        });

        await get().refreshFileTree();
        await get().saveToLocalStorage();
    } catch (error) {
        console.error("Failed to rename file:", error);
        throw error;
    }
  },

  // === Persistence Methods ===

  saveToLocalStorage: async () => {
    const webcontainer = await getWebContainerInstance();
    const files: Record<string, string> = {};

    async function collectFiles(dir: string) {
      const entries = await webcontainer.fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = dir === '.' ? entry.name : `${dir}/${entry.name}`;
        if (entry.isDirectory()) {
          await collectFiles(fullPath);
        } else {
          try {
            files[fullPath] = await webcontainer.fs.readFile(fullPath, 'utf-8');
          } catch {
            // Skip binary files
          }
        }
      }
    }

    await collectFiles('.');
    
    const project: StoredProject = {
      files,
      timestamp: Date.now()
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
    console.log('[SR Terminal] Project saved to localStorage');
  },

  loadFromLocalStorage: async () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return false;

    try {
      const project: StoredProject = JSON.parse(stored);
      const webcontainer = await getWebContainerInstance();

      for (const [path, content] of Object.entries(project.files)) {
        // Ensure parent directories exist
        const dir = path.split('/').slice(0, -1).join('/');
        if (dir) {
          await webcontainer.fs.mkdir(dir, { recursive: true });
        }
        await webcontainer.fs.writeFile(path, content);
      }

      await get().refreshFileTree();
      console.log('[SR Terminal] Project restored from localStorage');
      return true;
    } catch (e) {
      console.error('[SR Terminal] Failed to restore project:', e);
      return false;
    }
  },

  clearLocalStorage: () => {
    localStorage.removeItem(STORAGE_KEY);
    console.log('[SR Terminal] Project cleared from localStorage');
  },

  hasUnsavedChanges: () => {
    const { isDirty } = get();
    return Object.values(isDirty).some(Boolean);
  }
}));

// Helper recursive function to read directory
async function readFileTree(webcontainer: WebContainer, path: string): Promise<FileNode[]> {
  const entries = await webcontainer.fs.readdir(path, { withFileTypes: true });
  
  const nodes: FileNode[] = await Promise.all(entries.map(async (entry) => {
    const fullPath = path === '.' ? entry.name : `${path}/${entry.name}`;
    
    if (entry.isDirectory()) {
      return {
        name: entry.name,
        kind: 'directory',
        path: fullPath,
        children: await readFileTree(webcontainer, fullPath)
      };
    } else {
      return {
        name: entry.name,
        kind: 'file',
        path: fullPath
      };
    }
  }));

  // Sort: Directories first, then files
  return nodes.sort((a, b) => {
    if (a.kind === b.kind) return a.name.localeCompare(b.name);
    return a.kind === 'directory' ? -1 : 1;
  });
}
