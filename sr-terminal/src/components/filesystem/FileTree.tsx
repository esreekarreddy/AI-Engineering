'use client';

import { useFileStore } from '@/lib/file-store';
import { FileCode, ChevronRight, ChevronDown, File, FilePlus, Trash2, Download } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

interface FileNode {
  name: string;
  kind: 'file' | 'directory';
  path: string;
  children?: FileNode[];
}

interface FileNodeProps {
  node: FileNode;
  level: number;
}

function FileTreeNode({ node, level }: FileNodeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { selectFile, selectedFile } = useFileStore();
  
  const isSelected = selectedFile === node.path;

  const handleClick = () => {
    if (node.kind === 'directory') {
      setIsOpen(!isOpen);
    } else {
      selectFile(node.path);
    }
  };

  const Icon = node.kind === 'directory' 
    ? (isOpen ? ChevronDown : ChevronRight) 
    : (node.name.endsWith('.js') || node.name.endsWith('.ts') ? FileCode : File);

  return (
    <div>
      <div 
        className={clsx(
            "flex items-center gap-1.5 py-1 px-2 cursor-pointer hover:bg-[var(--bg-tertiary)] select-none transition-colors",
            isSelected && "bg-[var(--accent-blue)] text-white hover:bg-[var(--accent-blue)]"
        )}
        style={{ paddingLeft: `${level * 12 + 12}px` }}
        onClick={handleClick}
      >
        <Icon size={14} className={clsx("opacity-70", isSelected && "opacity-100")} />
        <span className="truncate">{node.name}</span>
      </div>
      
      {isOpen && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeNode key={child.path} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

import { useModalStore } from '@/lib/modal-store';

export default function FileTree() {
  const { fileTree, refreshFileTree, createFile, deleteFile, selectedFile, fileContents } = useFileStore();
  const { openModal } = useModalStore();

  const handleNewFile = async () => {
    openModal('prompt', {
      title: 'New File',
      message: 'Enter the name for your new file (e.g., script.js)',
      defaultValue: '',
      onConfirm: async (name) => {
        if (name) await createFile(name);
      }
    });
  };

  const handleDelete = async () => {
    if (!selectedFile) return;
    openModal('confirm', {
      title: 'Delete File',
      message: `Are you sure you want to permanently delete "${selectedFile}"? This action cannot be undone.`,
      onConfirm: async () => {
        await deleteFile(selectedFile);
      }
    });
  };

  const handleDownload = () => {
    if (!selectedFile || !fileContents[selectedFile]) return;
    const blob = new Blob([fileContents[selectedFile]], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile.split('/').pop() || 'download.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-2 border-b border-[var(--bg-tertiary)] bg-[var(--bg-secondary)]">
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Explorer</span>
        <div className="flex items-center gap-1">
            <button onClick={handleNewFile} className="p-1 hover:bg-[var(--bg-tertiary)] rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)]" title="New File">
                <FilePlus size={14} />
            </button>
            <button onClick={handleDelete} disabled={!selectedFile} className="p-1 hover:bg-[var(--bg-tertiary)] rounded text-[var(--text-secondary)] hover:text-red-400 disabled:opacity-30" title="Delete Selected">
                <Trash2 size={14} />
            </button>
            <button onClick={handleDownload} disabled={!selectedFile} className="p-1 hover:bg-[var(--bg-tertiary)] rounded text-[var(--text-secondary)] hover:text-[var(--accent-green)] disabled:opacity-30" title="Download Selected">
                <Download size={14} />
            </button>
            <button onClick={() => refreshFileTree()} className="text-[10px] ml-2 hover:text-[var(--text-primary)] uppercase tracking-wide">
                Refresh
            </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto font-mono text-sm py-2">
        {fileTree.map((node) => (
            <FileTreeNode key={node.path} node={node} level={0} />
        ))}
      </div>
    </div>
  );
}
