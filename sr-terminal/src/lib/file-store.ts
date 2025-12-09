import { create } from 'zustand';
import { WebContainer } from '@webcontainer/api';
import { getWebContainerInstance } from './webcontainer';

interface FileNode {
  name: string;
  kind: 'file' | 'directory';
  path: string;
  children?: FileNode[];
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
  getVSFStats: () => Promise<{ fileCount: number; totalSize: number }>;
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
    const { fileContents } = get();
    const content = fileContents[path];
    const webcontainer = await getWebContainerInstance();
    
    await webcontainer.fs.writeFile(path, content);
    
    set((state) => ({
      isDirty: { ...state.isDirty, [path]: false }
    }));
  },

  createFile: async (name) => {
    const webcontainer = await getWebContainerInstance();
    await webcontainer.fs.writeFile(name, ''); // Create empty file
    await get().refreshFileTree();
    await get().selectFile(name);
  },

  deleteFile: async (path) => {
    const webcontainer = await getWebContainerInstance();
    await webcontainer.fs.rm(path);
    await get().refreshFileTree();
    set((state) => ({
      selectedFile: state.selectedFile === path ? null : state.selectedFile
    }));
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
