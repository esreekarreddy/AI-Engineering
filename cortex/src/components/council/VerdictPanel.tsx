'use client';

import { useCouncilStore } from '@/lib/store';
import { AgentAvatar } from './AgentCard';
import { AgentRole, Severity, Finding } from '@/lib/agents/types';
import { AlertTriangle, AlertCircle, Info, CheckCircle, ChevronDown, ChevronUp, Copy, Check, FileText } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

export function VerdictPanel() {
  const { session } = useCouncilStore();
  const findings = session?.findings || [];
  
  if (findings.length === 0) {
    return <EmptyVerdictState />;
  }

  const grouped = {
    P0: findings.filter(f => f.severity === 'P0'),
    P1: findings.filter(f => f.severity === 'P1'),
    P2: findings.filter(f => f.severity === 'P2'),
    P3: findings.filter(f => f.severity === 'P3'),
  };

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {/* Summary */}
      <div 
        className="flex items-center gap-3 p-3 rounded-lg"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
      >
        {(['P0', 'P1', 'P2', 'P3'] as Severity[]).map((sev, i) => (
          <div key={sev} className="flex items-center gap-1.5">
            {i > 0 && <div className="w-px h-4" style={{ background: 'var(--border-subtle)' }} />}
            <SeverityBadge severity={sev} count={grouped[sev].length} />
          </div>
        ))}
      </div>

      {/* Findings */}
      {(['P0', 'P1', 'P2', 'P3'] as Severity[]).map(sev => 
        grouped[sev].length > 0 && (
          <FindingSection key={sev} severity={sev} findings={grouped[sev]} />
        )
      )}
    </div>
  );
}

const SEVERITY_CONFIG: Record<Severity, { icon: typeof AlertTriangle; label: string; color: string; bg: string }> = {
  P0: { icon: AlertTriangle, label: 'Critical', color: 'var(--danger)', bg: 'var(--danger-muted)' },
  P1: { icon: AlertCircle, label: 'High', color: '#f97316', bg: 'rgba(249, 115, 22, 0.15)' },
  P2: { icon: Info, label: 'Medium', color: 'var(--warning)', bg: 'var(--warning-muted)' },
  P3: { icon: CheckCircle, label: 'Low', color: 'var(--success)', bg: 'var(--success-muted)' },
};

function SeverityBadge({ severity, count }: { severity: Severity; count: number }) {
  const config = SEVERITY_CONFIG[severity];
  return (
    <div 
      className={clsx("flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium", count === 0 && "opacity-40")}
      style={{ background: config.bg, color: config.color }}
    >
      <config.icon size={12} />
      <span>{count}</span>
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
        className="flex items-center gap-2 w-full text-left py-1 group"
      >
        <config.icon size={14} style={{ color: config.color }} />
        <span 
          className="flex-1 text-sm font-medium"
          style={{ color: 'var(--text-primary)' }}
        >
          {config.label}
        </span>
        <span 
          className="text-xs px-2 py-0.5 rounded"
          style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}
        >
          {findings.length}
        </span>
        {expanded 
          ? <ChevronUp size={14} style={{ color: 'var(--text-muted)' }} />
          : <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
        }
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
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(finding.patchSnippet || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className="p-4 rounded-lg transition-all animate-fade-in-up"
      style={{ 
        background: 'var(--bg-elevated)', 
        border: '1px solid var(--border-subtle)'
      }}
    >
      <div className="flex items-start gap-3">
        <AgentAvatar role={finding.agentRole as AgentRole} size="sm" />
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <span 
              className="text-[10px] font-mono px-1.5 py-0.5 rounded"
              style={{ background: 'var(--bg-hover)', color: 'var(--text-disabled)' }}
            >
              {finding.id}
            </span>
            <span 
              className="text-[10px] capitalize px-1.5 py-0.5 rounded"
              style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)' }}
            >
              {finding.category}
            </span>
          </div>

          {/* Claim */}
          <p 
            className="text-sm font-medium mb-2 leading-relaxed"
            style={{ color: '#fafafa' }}
          >
            {finding.claim}
          </p>
          
          {finding.where?.lines && (
            <p 
              className="text-xs font-mono mb-3"
              style={{ color: 'var(--text-disabled)' }}
            >
              Lines {finding.where.lines}
            </p>
          )}
          
          {/* Fix */}
          {finding.fix && (
            <div 
              className="p-3 rounded-md"
              style={{ background: 'var(--bg-base)', border: '1px solid var(--border-subtle)' }}
            >
              <div className="flex items-center justify-between mb-2">
                <span 
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: '#22c55e' }}
                >
                  ✓ FIX
                </span>
                {finding.patchSnippet && (
                  <button 
                    onClick={() => setShowPatch(!showPatch)}
                    className="text-xs font-medium transition-colors hover:underline"
                    style={{ color: 'var(--accent)' }}
                  >
                    {showPatch ? 'Hide patch' : 'Show patch'}
                  </button>
                )}
              </div>
              
              <p 
                className="text-sm leading-relaxed"
                style={{ color: '#d4d4d8' }}
              >
                {finding.fix}
              </p>
              
              {showPatch && finding.patchSnippet && (
                <div className="mt-3 relative group">
                  <pre 
                    className="p-3 rounded-md text-xs font-mono overflow-x-auto"
                    style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)' }}
                  >
                    {finding.patchSnippet}
                  </pre>
                  <button 
                    onClick={handleCopy}
                    className="absolute top-2 right-2 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                    style={{ background: 'var(--bg-hover)' }}
                    title="Copy code"
                  >
                    {copied 
                      ? <Check size={12} style={{ color: 'var(--success)' }} />
                      : <Copy size={12} style={{ color: 'var(--text-muted)' }} />
                    }
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
      <div 
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
        style={{ background: 'var(--bg-elevated)' }}
      >
        <FileText size={24} style={{ color: 'var(--text-muted)' }} />
      </div>
      <h3 
        className="text-base font-semibold mb-1"
        style={{ color: 'var(--text-primary)' }}
      >
        No Findings Yet
      </h3>
      <p 
        className="text-sm max-w-[200px]"
        style={{ color: 'var(--text-muted)' }}
      >
        Run a code review to see security issues and recommendations here.
      </p>
    </div>
  );
}
