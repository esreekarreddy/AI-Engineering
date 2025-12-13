'use client';

import { useCouncilStore } from '@/lib/store';
import { AgentAvatar } from './AgentCard';
import { AgentRole, Severity, Finding } from '@/lib/agents/types';
import { AlertTriangle, AlertCircle, Info, CheckCircle, ChevronDown, ChevronUp, Copy } from 'lucide-react';
import { useState } from 'react';

export function VerdictPanel() {
  const { session } = useCouncilStore();
  const findings = session?.findings || [];
  
  if (findings.length === 0) {
    return <EmptyVerdictState />;
  }

  // Group by severity
  const grouped = {
    P0: findings.filter(f => f.severity === 'P0'),
    P1: findings.filter(f => f.severity === 'P1'),
    P2: findings.filter(f => f.severity === 'P2'),
    P3: findings.filter(f => f.severity === 'P3'),
  };

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {/* Summary Bar */}
      <div className="flex items-center gap-4 px-3 py-2.5 rounded-xl surface-2 border border-white/5">
        <SeverityCount severity="P0" count={grouped.P0.length} />
        <SeverityCount severity="P1" count={grouped.P1.length} />
        <SeverityCount severity="P2" count={grouped.P2.length} />
        <SeverityCount severity="P3" count={grouped.P3.length} />
      </div>

      {/* Findings by Section */}
      {(['P0', 'P1', 'P2', 'P3'] as Severity[]).map(sev => 
        grouped[sev].length > 0 && (
          <FindingSection key={sev} severity={sev} findings={grouped[sev]} />
        )
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Subcomponents
// ═══════════════════════════════════════════════════════════════════════════

function SeverityCount({ severity, count }: { severity: Severity; count: number }) {
  const config = SEVERITY_CONFIG[severity];
  return (
    <div className="flex items-center gap-1.5">
      <config.icon size={12} className={config.textClass} />
      <span className="text-[11px] text-[rgb(var(--text-muted))]">{count} {severity}</span>
    </div>
  );
}

function FindingSection({ severity, findings }: { severity: Severity; findings: Finding[] }) {
  const [expanded, setExpanded] = useState(severity === 'P0' || severity === 'P1');
  const config = SEVERITY_CONFIG[severity];

  return (
    <div className="space-y-2">
      <button 
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 w-full text-left group"
      >
        <config.icon size={14} className={config.textClass} />
        <span className="text-section flex-1 group-hover:text-white transition-colors">{config.label}</span>
        <span className="text-meta">{findings.length}</span>
        {expanded ? (
          <ChevronUp size={14} className="text-[rgb(var(--text-muted))]" />
        ) : (
          <ChevronDown size={14} className="text-[rgb(var(--text-muted))]" />
        )}
      </button>

      {expanded && (
        <div className="space-y-2 pl-5">
          {findings.map(finding => (
            <FindingCard key={finding.id} finding={finding} />
          ))}
        </div>
      )}
    </div>
  );
}

function FindingCard({ finding }: { finding: Finding }) {
  const [showPatch, setShowPatch] = useState(false);

  return (
    <div className="p-3 rounded-xl surface-2 border border-white/5 animate-fade-in hover:border-white/10 transition-colors">
      <div className="flex items-start gap-2.5">
        <AgentAvatar role={finding.agentRole as AgentRole} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono text-[rgb(var(--text-muted))]">{finding.id}</span>
            <span className="text-[10px] text-[rgb(var(--text-muted))] capitalize">{finding.category}</span>
          </div>
          <p className="text-[13px] text-white font-medium mb-2">{finding.claim}</p>
          
          {finding.where?.lines && (
            <div className="text-[11px] text-[rgb(var(--text-muted))] mb-2">
              📍 Lines {finding.where.lines}
            </div>
          )}
          
          {finding.fix && (
            <div className="p-2.5 rounded-lg surface-base border border-white/5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-semibold text-emerald-400">FIX</span>
                {finding.patchSnippet && (
                  <button 
                    onClick={() => setShowPatch(!showPatch)}
                    className="text-[10px] text-[rgb(var(--accent))] hover:underline"
                  >
                    {showPatch ? 'Hide patch' : 'Show patch'}
                  </button>
                )}
              </div>
              <p className="text-[12px] text-[rgb(var(--text-secondary))]">{finding.fix}</p>
              
              {showPatch && finding.patchSnippet && (
                <div className="mt-2 relative">
                  <pre className="p-2 rounded surface-2 text-[11px] font-mono text-[rgb(var(--text-secondary))] overflow-x-auto">
                    {finding.patchSnippet}
                  </pre>
                  <button 
                    onClick={() => navigator.clipboard.writeText(finding.patchSnippet || '')}
                    className="absolute top-1 right-1 p-1 rounded hover:bg-white/5 transition-colors"
                  >
                    <Copy size={12} className="text-[rgb(var(--text-muted))]" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyVerdictState() {
  return (
    <div className="h-full flex flex-col items-center justify-center p-6 text-center">
      <div className="w-14 h-14 rounded-2xl surface-2 flex items-center justify-center mb-4 glow-subtle">
        <CheckCircle size={28} className="text-[rgb(var(--text-muted))]" />
      </div>
      <h3 className="text-title mb-1">No Findings Yet</h3>
      <p className="text-meta max-w-[200px]">
        Run a review to see structured findings here.
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Config
// ═══════════════════════════════════════════════════════════════════════════

const SEVERITY_CONFIG: Record<Severity, { icon: typeof AlertTriangle; label: string; textClass: string }> = {
  P0: { icon: AlertTriangle, label: 'Critical', textClass: 'text-red-400' },
  P1: { icon: AlertCircle, label: 'High', textClass: 'text-orange-400' },
  P2: { icon: Info, label: 'Medium', textClass: 'text-amber-400' },
  P3: { icon: CheckCircle, label: 'Low', textClass: 'text-emerald-400' },
};
