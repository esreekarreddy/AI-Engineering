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
  onContextMenu: (e: React.MouseEvent, path: string, type: 'file' | 'directory') => void;
}

function FileTreeNode({ node, level, onContextMenu }: FileNodeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { selectFile, selectedFile } = useFileStore();
  
  const isSelected = selectedFile === node.path;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
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
            "flex items-center gap-1.5 py-1 px-2 cursor-pointer select-none transition-colors",
            // FIXED: Better hover contrast - sets text to white/primary when hovering on non-selected items
            !isSelected && "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]",
            isSelected && "bg-[var(--accent-blue)] text-white"
        )}
        style={{ paddingLeft: `${level * 12 + 12}px` }}
        onClick={handleClick}
        onContextMenu={(e) => onContextMenu(e, node.path, node.kind)}
      >
        <Icon size={14} className={clsx("opacity-70", isSelected && "opacity-100")} />
        <span className="truncate">{node.name}</span>
      </div>
      
      {isOpen && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeNode key={child.path} node={child} level={level + 1} onContextMenu={onContextMenu} />
          ))}
        </div>
      )}
    </div>
  );
}

import { useModalStore } from '@/lib/modal-store';
import { useRef, useEffect } from 'react';

export default function FileTree() {
  const { fileTree, createFile, deleteFile, renameFile, selectedFile, fileContents, selectFile } = useFileStore();
  const { openModal } = useModalStore();
  
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; path: string; type: 'file' | 'directory' } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

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

  const handleDelete = async (path: string | null = null) => {
    const target = path || selectedFile;
    if (!target) return;
    
    openModal('confirm', {
      title: 'Delete Item',
      message: `Are you sure you want to permanently delete "${target}"?`,
      onConfirm: async () => {
        await deleteFile(target);
      }
    });
  };
  
  const handleRename = async (path: string) => {
      const currentName = path.split('/').pop() || '';
      openModal('prompt', {
          title: 'Rename Item',
          message: `Enter new name for "${currentName}"`,
          defaultValue: currentName,
          onConfirm: async (newName) => {
              if (newName && newName !== currentName) {
                  const newPath = path.substring(0, path.lastIndexOf('/') + 1) + newName;
                  await renameFile(path, newPath);
              }
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

  const onNodeContextMenu = (e: React.MouseEvent, path: string, type: 'file' | 'directory') => {
      e.preventDefault();
      e.stopPropagation();
      setContextMenu({ x: e.clientX, y: e.clientY, path, type });
  };

  return (
    <div className="flex flex-col h-full relative" onContextMenu={(e) => e.preventDefault()}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 border-b border-[var(--bg-tertiary)] bg-[var(--bg-secondary)] shrink-0">
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Explorer</span>
        <div className="flex items-center gap-1">
            <button onClick={handleNewFile} className="p-1 hover:bg-[var(--bg-tertiary)] rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors" title="New File">
                <FilePlus size={14} />
            </button>
            <button onClick={() => handleDelete()} disabled={!selectedFile} className="p-1 hover:bg-[var(--bg-tertiary)] rounded text-[var(--text-secondary)] hover:text-red-400 disabled:opacity-30 transition-colors" title="Delete Selected">
                <Trash2 size={14} />
            </button>
            <button onClick={handleDownload} disabled={!selectedFile} className="p-1 hover:bg-[var(--bg-tertiary)] rounded text-[var(--text-secondary)] hover:text-[var(--accent-green)] disabled:opacity-30 transition-colors" title="Download Selected">
                <Download size={14} />
            </button>
        </div>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto font-mono text-sm py-2" onClick={() => selectFile(null!)}>
        {fileTree.map((node) => (
            <FileTreeNode 
                key={node.path} 
                node={node} 
                level={0} 
                onContextMenu={onNodeContextMenu} 
            />
        ))}
      </div>

      {/* Context Menu */}
      {contextMenu && (
          <div 
            ref={menuRef}
            className="fixed z-50 bg-[var(--bg-secondary)] border border-[var(--bg-tertiary)] rounded shadow-xl py-1 min-w-[120px] animate-in fade-in zoom-in-95 duration-100"
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
              <button 
                onClick={() => { handleRename(contextMenu.path); setContextMenu(null); }}
                className="w-full text-left px-4 py-1.5 text-xs hover:bg-[var(--accent-blue)] hover:text-white transition-colors flex items-center gap-2"
              >
                  <span>Rename...</span>
              </button>
              <button 
                onClick={() => { handleDelete(contextMenu.path); setContextMenu(null); }}
                className="w-full text-left px-4 py-1.5 text-xs hover:bg-red-500 hover:text-white text-red-400 transition-colors flex items-center gap-2"
              >
                  <span>Delete</span>
              </button>
          </div>
      )}
    </div>
  );
}
