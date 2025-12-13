'use client';

import { useEffect } from 'react';
import { X, Code, MessageCircle, CheckCircle, Brain, Shield, Zap, Wrench, Eye } from 'lucide-react';
import clsx from 'clsx';

interface HelpModalProps {
  onClose: () => void;
}

export function HelpModal({ onClose }: HelpModalProps) {
  // Close on ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const steps = [
    { icon: Code, title: 'Paste Code', desc: 'Drop any code snippet into the editor' },
    { icon: MessageCircle, title: 'Run Review', desc: 'Click "Review Code" to start the council' },
    { icon: CheckCircle, title: 'Get Feedback', desc: 'Receive ranked findings with fixes' },
  ];

  const agents = [
    { icon: Eye, name: 'Moderator', desc: 'Orchestrates and produces verdict', color: 'var(--agent-moderator)' },
    { icon: Brain, name: 'Architect', desc: 'Reviews structure and patterns', color: 'var(--agent-architect)' },
    { icon: Shield, name: 'Sentinel', desc: 'Finds bugs and security issues', color: 'var(--agent-sentinel)' },
    { icon: Zap, name: 'Optimizer', desc: 'Spots performance bottlenecks', color: 'var(--agent-optimizer)' },
    { icon: Wrench, name: 'Maintainer', desc: 'Suggests tests and refactoring', color: 'var(--agent-maintainer)' },
    { icon: CheckCircle, name: 'Verifier', desc: 'Validates claims against code', color: 'var(--agent-verifier)' },
  ];

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" 
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md z-50 animate-fade-in">
        <div className="p-6 rounded-2xl bg-[rgb(var(--bg-surface-1))] border border-[var(--border-subtle)] shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-title text-white">How CORTEX Works</h2>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-[rgb(var(--bg-elevated))] transition-colors focus-ring"
            >
              <X size={16} className="text-[rgb(var(--text-muted))]" />
            </button>
          </div>

          {/* Steps */}
          <div className="space-y-3 mb-6">
            {steps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[rgb(var(--accent)/0.1)] flex items-center justify-center shrink-0">
                  <span className="text-[12px] font-semibold text-[rgb(var(--accent))]">{idx + 1}</span>
                </div>
                <div>
                  <div className="text-[13px] font-medium text-white">{step.title}</div>
                  <div className="text-[12px] text-[rgb(var(--text-muted))]">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Agents */}
          <div className="mb-6">
            <h3 className="text-section mb-3">The Council</h3>
            <div className="grid grid-cols-2 gap-2">
              {agents.map(agent => (
                <div key={agent.name} className="flex items-center gap-2 p-2 rounded-lg bg-[rgb(var(--bg-surface-2))]">
                  <div 
                    className="w-6 h-6 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `rgb(${agent.color} / 0.15)`, color: `rgb(${agent.color})` }}
                  >
                    <agent.icon size={12} />
                  </div>
                  <div>
                    <div className="text-[11px] font-medium text-white">{agent.name}</div>
                    <div className="text-[10px] text-[rgb(var(--text-muted))] leading-tight">{agent.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className={clsx(
                "px-4 py-2 rounded-xl text-[13px] font-semibold",
                "bg-[rgb(var(--accent))] text-white",
                "hover:brightness-110 transition-all focus-ring"
              )}
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
