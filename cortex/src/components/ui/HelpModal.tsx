'use client';

import { X, Brain, Shield, Cpu, Zap, Wrench, CheckCircle, Sparkles } from 'lucide-react';
import { AGENTS, AgentRole } from '@/lib/agents/types';

interface HelpModalProps {
  onClose: () => void;
}

const AGENT_ICONS: Record<AgentRole, React.ReactNode> = {
  moderator: <Brain size={18} />,
  architect: <Cpu size={18} />,
  sentinel: <Shield size={18} />,
  optimizer: <Zap size={18} />,
  maintainer: <Wrench size={18} />,
  verifier: <CheckCircle size={18} />,
};

const AGENT_COLORS: Record<AgentRole, string> = {
  moderator: 'var(--agent-moderator)',
  architect: 'var(--agent-architect)',
  sentinel: 'var(--agent-sentinel)',
  optimizer: 'var(--agent-optimizer)',
  maintainer: 'var(--agent-maintainer)',
  verifier: 'var(--agent-verifier)',
};

export function HelpModal({ onClose }: HelpModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 animate-fade-in"
        style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div 
        className="relative w-full max-w-3xl max-h-[85vh] flex flex-col rounded-2xl animate-scale-in overflow-hidden"
        style={{ 
          background: 'var(--bg-surface)', 
          border: '1px solid var(--border-default)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)'
        }}
      >
        {/* Header - Fixed */}
        <div 
          className="flex items-center justify-between p-6 border-b shrink-0"
          style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
        >
          <div className="flex items-center gap-4">
            <div 
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--accent)', boxShadow: '0 4px 12px var(--accent-glow)' }}
            >
              <Sparkles size={22} style={{ color: 'white' }} />
            </div>
            <div>
              <h2 
                className="text-xl font-bold tracking-tight"
                style={{ color: 'var(--text-primary)' }}
              >
                About Cortex
              </h2>
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
                AI-Powered Code Review Council
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2.5 rounded-lg transition-colors"
            style={{ background: 'var(--bg-hover)' }}
          >
            <X size={18} style={{ color: 'var(--text-secondary)' }} />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* What is Cortex */}
          <section className="space-y-3">
            <h3 
              className="text-base font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              What is Cortex?
            </h3>
            <p 
              className="text-sm leading-relaxed"
              style={{ color: 'var(--text-secondary)' }}
            >
              Cortex is an AI-powered code review platform that uses a council of six specialized AI agents 
              to analyze your code for security vulnerabilities, performance issues, bugs, and best practices. 
              Each agent brings unique expertise to provide comprehensive, actionable feedback.
            </p>
          </section>

          {/* How it Works */}
          <section className="space-y-4">
            <h3 
              className="text-base font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              How It Works
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { num: '1', title: 'Paste Code', desc: 'Add your code to the editor' },
                { num: '2', title: 'Run Review', desc: 'Start the AI council analysis' },
                { num: '3', title: 'Get Results', desc: 'Review findings with fixes' },
              ].map((step) => (
                <div 
                  key={step.num}
                  className="p-4 rounded-xl text-center"
                  style={{ background: 'var(--bg-base)', border: '1px solid var(--border-subtle)' }}
                >
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold mx-auto mb-3"
                    style={{ background: 'var(--accent)', color: 'white' }}
                  >
                    {step.num}
                  </div>
                  <h4 
                    className="text-sm font-semibold mb-1"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {step.title}
                  </h4>
                  <p 
                    className="text-xs"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* AI Agents */}
          <section className="space-y-4">
            <h3 
              className="text-base font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              The AI Council
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {(Object.entries(AGENTS) as [AgentRole, typeof AGENTS[AgentRole]][]).map(([role, agent]) => {
                const color = AGENT_COLORS[role];
                const icon = AGENT_ICONS[role];
                return (
                  <div 
                    key={role}
                    className="flex items-start gap-3 p-4 rounded-xl"
                    style={{ background: 'var(--bg-base)', border: '1px solid var(--border-subtle)' }}
                  >
                    <div 
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: color, color: 'white' }}
                    >
                      {icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 
                        className="text-sm font-semibold mb-0.5"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {agent.name}
                      </h4>
                      <p 
                        className="text-xs leading-relaxed"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {agent.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Tech Stack */}
          <section 
            className="flex items-center gap-4 p-4 rounded-xl"
            style={{ background: 'var(--bg-base)', border: '1px solid var(--border-subtle)' }}
          >
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Built with:</span>
            <div className="flex items-center gap-3 flex-wrap">
              {['Next.js', 'TypeScript', 'OpenRouter', 'Multi-LLM'].map((tech) => (
                <span 
                  key={tech}
                  className="px-2.5 py-1 rounded-md text-xs font-medium"
                  style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}
                >
                  {tech}
                </span>
              ))}
            </div>
          </section>
        </div>

        {/* Footer - Fixed */}
        <div 
          className="flex justify-end p-5 border-t shrink-0"
          style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
        >
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg text-sm font-semibold transition-all"
            style={{ 
              background: 'var(--accent)',
              color: 'white',
              boxShadow: '0 2px 8px var(--accent-glow)'
            }}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
