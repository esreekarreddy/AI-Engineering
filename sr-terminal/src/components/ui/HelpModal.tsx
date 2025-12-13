'use client';

import { X, Terminal, FileCode, Cpu, HelpCircle } from 'lucide-react';

interface HelpModalProps {
  onClose: () => void;
}

export default function HelpModal({ onClose }: HelpModalProps) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--bg-secondary)] border border-[var(--bg-tertiary)] rounded-lg shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--bg-tertiary)]">
          <div className="flex items-center gap-2">
            <HelpCircle size={20} className="text-[var(--accent-blue)]" />
            <h2 className="text-lg font-bold tracking-wide">USER MANUAL</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-[var(--bg-tertiary)] rounded transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 text-sm">
          {/* Getting Started */}
          <section>
            <h3 className="font-bold text-[var(--accent-orange)] flex items-center gap-2 mb-2">
              <Terminal size={16} />
              Terminal Commands
            </h3>
            <p className="text-[var(--text-secondary)] mb-2">
              The terminal runs <b>JSH</b> (JavaScript Shell). Use standard shell commands:
            </p>
            <div className="bg-[var(--bg-primary)] rounded p-3 font-mono text-xs space-y-1">
              <p><span className="text-green-400">$</span> node index.js <span className="text-[var(--text-secondary)]"># Run a JS file</span></p>
              <p><span className="text-green-400">$</span> node -e &apos;console.log(&quot;hi&quot;)&apos; <span className="text-[var(--text-secondary)]"># Eval JS</span></p>
              <p><span className="text-green-400">$</span> npm install lodash <span className="text-[var(--text-secondary)]"># Install packages</span></p>
              <p><span className="text-green-400">$</span> ls / cat file.js <span className="text-[var(--text-secondary)]"># List / read files</span></p>
            </div>
          </section>

          {/* File Explorer */}
          <section>
            <h3 className="font-bold text-[var(--accent-orange)] flex items-center gap-2 mb-2">
              <FileCode size={16} />
              File Explorer
            </h3>
            <ul className="text-[var(--text-secondary)] space-y-1 list-disc list-inside">
              <li>Click a file to open in the editor</li>
              <li>Use toolbar buttons to create/delete files</li>
              <li>Files auto-save to browser storage</li>
              <li>Use <b>REFRESH</b> to sync with virtual filesystem</li>
            </ul>
          </section>

          {/* AI Co-Pilot */}
          <section>
            <h3 className="font-bold text-[var(--accent-orange)] flex items-center gap-2 mb-2">
              <Cpu size={16} />
              AI Co-Pilot
            </h3>
            <ul className="text-[var(--text-secondary)] space-y-1 list-disc list-inside">
              <li>Click <b>AI NETLINK</b> to open the AI panel</li>
              <li>Downloads a 1.8GB model (stored in browser)</li>
              <li>Runs 100% locally via WebGPU - no server!</li>
              <li>Ask coding questions about your open file</li>
            </ul>
          </section>

          {/* Tips */}
          <section className="bg-[var(--accent-blue)]/10 border border-[var(--accent-blue)]/20 rounded-lg p-3">
            <h3 className="font-bold text-[var(--accent-blue)] mb-2">💡 Tips</h3>
            <ul className="text-[var(--text-secondary)] text-xs space-y-1">
              <li>• <b>RUN PREVIEW</b> auto-saves and runs <code className="bg-[var(--bg-tertiary)] px-1 rounded">npm run dev</code></li>
              <li>• Files persist across refreshes (localStorage)</li>
              <li>• Click <b>SYSTEM: ONLINE</b> to view memory usage</li>
              <li>• Press <b>+</b> in terminal tabs for multiple shells</li>
            </ul>
          </section>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[var(--bg-tertiary)] bg-[var(--bg-primary)]/50 text-center">
          <p className="text-[10px] text-[var(--text-secondary)]">
            SR Terminal v1.0.0 • Built with WebContainers + WebLLM
          </p>
        </div>
      </div>
    </div>
  );
}
