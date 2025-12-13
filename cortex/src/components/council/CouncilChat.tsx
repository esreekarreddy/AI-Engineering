'use client';

import { useRef, useEffect } from 'react';
import { useCouncilStore } from '@/lib/store';
import { AgentAvatar } from './AgentCard';
import { AGENTS, AgentRole } from '@/lib/agents/types';
import { Sparkles, ArrowRight, Code, MessageCircle, CheckCircle } from 'lucide-react';

export function CouncilChat() {
  const { session, isRunning } = useCouncilStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [session?.messages]);

  const messages = session?.messages || [];

  // Empty State
  if (messages.length === 0 && !isRunning) {
    return <EmptyState />;
  }

  return (
    <div ref={scrollRef} className="h-full overflow-y-auto p-4 space-y-4">
      {messages.map((msg, idx) => {
        const agent = AGENTS[msg.agentRole as AgentRole];
        return (
          <div key={msg.id || idx} className="flex gap-3 animate-fade-in">
            <AgentAvatar role={msg.agentRole as AgentRole} size="sm" />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-[12px] font-semibold text-white">
                  {agent.name}
                </span>
                <span className="text-[10px] text-[rgb(var(--text-muted))]">
                  {formatTime(msg.timestamp)}
                </span>
              </div>
              <div className="text-[13px] text-[rgb(var(--text-secondary))] leading-relaxed whitespace-pre-wrap">
                {msg.content}
              </div>
            </div>
          </div>
        );
      })}

      {/* Typing indicator when running */}
      {isRunning && (
        <div className="flex gap-3 animate-fade-in">
          <div className="w-6 h-6 rounded-lg bg-[rgb(var(--bg-elevated))] flex items-center justify-center">
            <Sparkles size={12} className="text-[rgb(var(--accent))] animate-pulse" />
          </div>
          <div className="flex items-center gap-1 text-[12px] text-[rgb(var(--text-muted))]">
            <span>Agents analyzing</span>
            <span className="flex gap-0.5">
              <span className="w-1 h-1 rounded-full bg-current animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1 h-1 rounded-full bg-current animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1 h-1 rounded-full bg-current animate-bounce" style={{ animationDelay: '300ms' }} />
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Premium Empty State
// ═══════════════════════════════════════════════════════════════════════════

function EmptyState() {
  const steps = [
    { icon: Code, label: 'Paste your code in the editor' },
    { icon: MessageCircle, label: 'Click "Review Code" to start' },
    { icon: CheckCircle, label: 'Get actionable feedback' },
  ];

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 text-center">
      <div className="w-12 h-12 rounded-2xl bg-[rgb(var(--accent)/0.1)] flex items-center justify-center mb-4">
        <Sparkles size={24} className="text-[rgb(var(--accent))]" />
      </div>
      
      <h3 className="text-title text-white mb-1">Council Chamber</h3>
      <p className="text-meta mb-6 max-w-[240px]">
        6 AI agents will review your code from different perspectives.
      </p>

      <div className="space-y-3 w-full max-w-[240px]">
        {steps.map((step, idx) => (
          <div key={idx} className="flex items-center gap-3 text-left">
            <div className="w-7 h-7 rounded-lg bg-[rgb(var(--bg-elevated))] flex items-center justify-center shrink-0">
              <step.icon size={14} className="text-[rgb(var(--text-muted))]" />
            </div>
            <span className="text-[12px] text-[rgb(var(--text-secondary))]">{step.label}</span>
          </div>
        ))}
      </div>

      <button 
        onClick={() => useCouncilStore.getState().setCode(DEMO_CODE)}
        className="mt-6 flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-medium text-[rgb(var(--accent))] bg-[rgb(var(--accent)/0.1)] hover:bg-[rgb(var(--accent)/0.15)] transition-colors"
      >
        Try demo code
        <ArrowRight size={14} />
      </button>
    </div>
  );
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const DEMO_CODE = `async function fetchUserData(userId: string) {
  const response = await fetch('/api/users/' + userId);
  const data = response.json();
  return data;
}`;
