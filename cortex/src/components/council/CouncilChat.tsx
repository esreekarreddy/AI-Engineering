'use client';

import { useRef, useEffect } from 'react';
import { useCouncilStore } from '@/lib/store';
import { AgentAvatar } from './AgentCard';
import { AGENTS, AgentRole } from '@/lib/agents/types';
import { Code, Sparkles } from 'lucide-react';

export function CouncilChat() {
  const { session, isRunning } = useCouncilStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [session?.messages]);

  const messages = session?.messages || [];

  if (messages.length === 0 && !isRunning) {
    return <EmptyState />;
  }

  return (
    <div 
      ref={scrollRef} 
      className="h-full overflow-y-auto p-4 space-y-4"
    >
      {messages.map((msg, idx) => {
        const agent = AGENTS[msg.agentRole as AgentRole];
        return (
          <div key={`${msg.id}-${idx}`} className="flex gap-3 animate-fade-in-up">
            <AgentAvatar role={msg.agentRole as AgentRole} size="sm" />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 mb-1">
                <span 
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {agent.name}
                </span>
                <span 
                  className="text-xs"
                  style={{ color: 'var(--text-disabled)' }}
                >
                  {formatTime(msg.timestamp)}
                </span>
              </div>
              <div 
                className="text-sm leading-relaxed whitespace-pre-wrap"
                style={{ color: 'var(--text-secondary)' }}
              >
                {msg.content}
              </div>
            </div>
          </div>
        );
      })}

      {isRunning && (
        <div className="flex gap-3 animate-fade-in">
          <div 
            className="w-6 h-6 rounded-md flex items-center justify-center"
            style={{ background: 'var(--accent-muted)' }}
          >
            <Sparkles size={12} style={{ color: 'var(--accent)' }} className="animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Analyzing code
            </span>
            <div className="flex gap-1">
              <span className="w-1 h-1 rounded-full bg-[var(--text-muted)] animate-pulse" />
              <span className="w-1 h-1 rounded-full bg-[var(--text-muted)] animate-pulse" style={{ animationDelay: '150ms' }} />
              <span className="w-1 h-1 rounded-full bg-[var(--text-muted)] animate-pulse" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  const steps = [
    { num: '1', text: 'Paste your code in the editor' },
    { num: '2', text: 'Click "Run Review" to start' },
    { num: '3', text: 'Review findings and apply fixes' },
  ];

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 text-center">
      <div 
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
        style={{ background: 'var(--bg-elevated)' }}
      >
        <Code size={24} style={{ color: 'var(--text-muted)' }} />
      </div>
      
      <h3 
        className="text-base font-semibold mb-1"
        style={{ color: 'var(--text-primary)' }}
      >
        Ready for Review
      </h3>
      <p 
        className="text-sm mb-6 max-w-[240px]"
        style={{ color: 'var(--text-muted)' }}
      >
        Six AI agents will analyze your code for security, performance, and best practices.
      </p>

      <div className="space-y-3 w-full max-w-[220px] text-left">
        {steps.map((step) => (
          <div key={step.num} className="flex items-center gap-3">
            <div 
              className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-medium shrink-0"
              style={{ 
                background: 'var(--bg-elevated)',
                color: 'var(--text-muted)'
              }}
            >
              {step.num}
            </div>
            <span 
              className="text-sm"
              style={{ color: 'var(--text-secondary)' }}
            >
              {step.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

