import { useFileStore } from '@/lib/file-store';
import { useEffect, useState } from 'react';
import { Cpu, HardDrive, Trash } from 'lucide-react';

export default function ResourceMonitor() {
  const { getVSFStats } = useFileStore();
  const [stats, setStats] = useState<{ fileCount: number; totalSize: number } | null>(null);
  const [memory, setMemory] = useState<string>('N/A');

  useEffect(() => {
    // 1. Get VFS Stats
    getVSFStats().then(setStats);

    // 2. Get Memory Stats (Chrome only)
    if ((performance as any).memory) {
        const used = (performance as any).memory.usedJSHeapSize;
        setMemory(`${(used / 1024 / 1024).toFixed(1)} MB`);
    }

    const interval = setInterval(() => {
        if ((performance as any).memory) {
            const used = (performance as any).memory.usedJSHeapSize;
            setMemory(`${(used / 1024 / 1024).toFixed(1)} MB`);
        }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
            {/* RAM USAGE */}
            <div className="p-4 bg-[var(--bg-primary)] border border-[var(--bg-tertiary)] rounded flex flex-col items-center justify-center gap-2">
                <Cpu size={24} className="text-[var(--accent-blue)]" />
                <span className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)]">Heaps Used</span>
                <span className="text-xl font-bold font-mono">{memory}</span>
            </div>

            {/* STORAGE USAGE */}
            <div className="p-4 bg-[var(--bg-primary)] border border-[var(--bg-tertiary)] rounded flex flex-col items-center justify-center gap-2">
                <HardDrive size={24} className="text-[var(--accent-orange)]" />
                <span className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)]">VFS Usage</span>
                <div className="flex flex-col items-center">
                    <span className="text-xl font-bold font-mono">
                        {stats ? (stats.totalSize / 1024).toFixed(2) : '0.00'} KB
                    </span>
                    <span className="text-[10px] text-[var(--text-secondary)]">
                        {stats?.fileCount || 0} Files
                    </span>
                </div>
            </div>
        </div>
        
        <div className="text-[10px] text-[var(--text-secondary)] border-l-2 border-[var(--accent-orange)] pl-3">
            <p><strong>NOTE:</strong> The file system is In-Memory. Reloading the page will clear all files and reset the state.</p>
        </div>

        <button 
            onClick={() => window.location.reload()} 
            className="w-full py-2 flex items-center justify-center gap-2 bg-red-900/20 text-red-400 border border-red-900/30 hover:bg-red-900/40 rounded transition-colors text-xs font-bold uppercase tracking-wider"
        >
            <Trash size={14} />
            Force Clear Memory (Reload)
        </button>
    </div>
  );
}
