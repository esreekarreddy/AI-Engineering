import { useFileStore } from '@/lib/file-store';
import { useEffect, useState } from 'react';
import { Cpu, HardDrive, Trash, Brain, Database, AlertTriangle } from 'lucide-react';
import { aiEngine } from '@/lib/ai/engine';
import { useModalStore } from '@/lib/modal-store';

export default function ResourceMonitor() {
  const { getVSFStats, clearLocalStorage } = useFileStore();
  const { openModal } = useModalStore();
  const [stats, setStats] = useState<{ fileCount: number; totalSize: number } | null>(null);
  const [memory, setMemory] = useState<string>('N/A');
  const [aiCacheSize, setAiCacheSize] = useState<number>(0);
  const [isLoadingCache, setIsLoadingCache] = useState(true);

  const checkAiCache = async () => {
    try {
        if ('caches' in window) {
            const keys = await caches.keys();
            let hasModel = false;
            for (const key of keys) {
                if (key.includes('webllm')) {
                    hasModel = true;
                    break;
                }
            }
            // Precise size is hard with opaque responses, but we know Phi-3 is ~1.8GB
            setAiCacheSize(hasModel ? 1.8 * 1024 * 1024 * 1024 : 0); 
        }
    } catch (e) {
        console.error("Failed to check cache", e);
    } finally {
        setIsLoadingCache(false);
    }
  };

  useEffect(() => {
    // 1. Get VFS Stats
    getVSFStats().then(setStats);

    // 2. Get Memory Stats (Chrome only)
    const updateMemory = () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const perf = performance as any;
        if (perf.memory) {
            const used = perf.memory.usedJSHeapSize;
            setMemory(`${(used / 1024 / 1024).toFixed(1)} MB`);
        }
    };
    updateMemory();

    // 3. Initial Cache Check
    checkAiCache();

    const interval = setInterval(updateMemory, 2000);
    return () => clearInterval(interval);
  }, [getVSFStats]);

  const handleDeleteModel = async () => {
      openModal('confirm', {
          title: 'DELETE AI MODEL?',
          message: 'Are you sure you want to delete the cached AI model? This will start a 1.8GB download next time you initialize the engine.',
          onConfirm: async () => {
            setIsLoadingCache(true);
            await aiEngine.deleteCache();
            // Re-check cache to confirm deletion
            await checkAiCache();
          }
      });
  };

  const handleResetWorkspace = () => {
      openModal('confirm', {
          title: 'RESET WORKSPACE?',
          message: 'This will DELETE all your files and reset the workspace. The AI Model will NOT be deleted. Continue?',
          onConfirm: () => {
              clearLocalStorage();
              window.location.reload();
          }
      });
  };

  const formatBytes = (bytes: number) => {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
            {/* RAM USAGE */}
            <div className="p-4 bg-[var(--bg-primary)] border border-[var(--bg-tertiary)] rounded flex flex-col items-center justify-center gap-2">
                <Cpu size={24} className="text-[var(--accent-blue)]" />
                <span className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)]">Heaps Used</span>
                <span className="text-xl font-bold font-mono text-[var(--text-primary)]">{memory}</span>
            </div>

            {/* STORAGE USAGE */}
            <div className="p-4 bg-[var(--bg-primary)] border border-[var(--bg-tertiary)] rounded flex flex-col items-center justify-center gap-2">
                <HardDrive size={24} className="text-[var(--accent-orange)]" />
                <span className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)]">VFS Usage</span>
                <div className="flex flex-col items-center">
                    <span className="text-xl font-bold font-mono text-[var(--text-primary)]">
                        {stats ? (stats.totalSize / 1024).toFixed(2) : '0.00'} KB
                    </span>
                    <span className="text-[10px] text-[var(--text-secondary)]">
                        {stats?.fileCount || 0} Files
                    </span>
                </div>
            </div>

            {/* AI CACHE */}
            <div className="col-span-2 p-4 bg-[var(--bg-primary)] border border-[var(--bg-tertiary)] rounded flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-[var(--bg-secondary)] rounded-lg">
                        <Brain size={24} className="text-emerald-500" />
                    </div>
                    <div>
                        <div className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)]">AI Model Storage</div>
                        <div className="flex items-baseline gap-2">
                             <span className="text-xl font-bold font-mono text-[var(--text-primary)]">
                                {isLoadingCache ? 'Checking...' : formatBytes(aiCacheSize)}
                             </span>
                             {aiCacheSize > 0 && <span className="text-[10px] text-emerald-500 font-bold">CACHED</span>}
                        </div>
                         <p className="text-[10px] text-[var(--text-secondary)] max-w-[200px]">
                            Phi-3 Mini 4k Instruct (WebGPU)
                         </p>
                    </div>
                </div>
                
                {aiCacheSize > 0 && (
                    <button 
                        onClick={handleDeleteModel}
                        className="px-3 py-1.5 flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded text-[10px] font-bold uppercase transition-colors"
                    >
                        <Trash size={12} />
                        Delete Model
                    </button>
                )}
            </div>
        </div>
        
        <div className="text-[10px] text-[var(--text-secondary)] border-l-2 border-[var(--accent-orange)] pl-3 space-y-1">
            <p className="flex items-center gap-1.5 font-bold text-[var(--text-primary)]">
                <AlertTriangle size={12} className="text-[var(--accent-orange)]" />
                <span>Reset Options:</span>
            </p>
            <p>
                • <strong>Reset Workspace</strong>: Deletes all files and clears local storage. <br/>
                • <strong>Delete Model</strong>: Deletes the AI model (~1.8GB) separately.
            </p>
        </div>

        <button 
            onClick={handleResetWorkspace}
            className="w-full py-2 flex items-center justify-center gap-2 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 rounded transition-colors text-xs font-bold uppercase tracking-wider"
        >
            <Database size={14} />
            Reset Workspace (Files Only)
        </button>
    </div>
  );
}
