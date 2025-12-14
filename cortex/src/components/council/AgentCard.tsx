'use client';

import { AgentRole, AGENTS } from '@/lib/agents/types';
import clsx from 'clsx';

interface AgentCardProps {
  role: AgentRole;
  isActive?: boolean;
  isSpeaking?: boolean;
}

const AGENT_COLORS: Record<AgentRole, string> = {
  moderator: 'var(--agent-moderator)',
  architect: 'var(--agent-architect)',
  sentinel: 'var(--agent-sentinel)',
  optimizer: 'var(--agent-optimizer)',
  maintainer: 'var(--agent-maintainer)',
  verifier: 'var(--agent-verifier)',
};

export function AgentCard({ role, isSpeaking = false }: AgentCardProps) {
  const agent = AGENTS[role];
  const color = AGENT_COLORS[role];
  
  return (
    <div 
      className={clsx(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
        isSpeaking && "ring-1 ring-[var(--accent)]"
      )}
      style={{
        background: isSpeaking ? 'var(--accent-muted)' : 'transparent',
      }}
    >
      {/* Icon */}
      <div 
        className="w-8 h-8 rounded-md flex items-center justify-center text-sm shrink-0"
        style={{ background: `${color}20`, color }}
      >
        {agent.icon}
      </div>
      
      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span 
            className="text-sm font-medium"
            style={{ color: isSpeaking ? 'var(--text-primary)' : 'var(--text-secondary)' }}
          >
            {agent.name}
          </span>
          {isSpeaking && (
            <div className="flex gap-0.5">
              <span className="w-1 h-1 rounded-full bg-[var(--accent)] animate-pulse" />
              <span className="w-1 h-1 rounded-full bg-[var(--accent)] animate-pulse" style={{ animationDelay: '150ms' }} />
              <span className="w-1 h-1 rounded-full bg-[var(--accent)] animate-pulse" style={{ animationDelay: '300ms' }} />
            </div>
          )}
        </div>
        <p 
          className="text-xs truncate font-mono"
          style={{ color: 'var(--text-muted)' }}
        >
          {agent.model}
        </p>
      </div>
    </div>
  );
}

export function AgentAvatar({ role, size = 'md' }: { role: AgentRole; size?: 'sm' | 'md' }) {
  const agent = AGENTS[role];
  const color = AGENT_COLORS[role];
  
  return (
    <div 
      className={clsx(
        "rounded-md flex items-center justify-center shrink-0",
        size === 'sm' && "w-6 h-6 text-xs",
        size === 'md' && "w-8 h-8 text-sm"
      )}
      style={{ background: `${color}20`, color }}
    >
      {agent.icon}
    </div>
  );
}
