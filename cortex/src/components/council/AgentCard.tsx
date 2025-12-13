'use client';

import { AgentRole, AGENTS } from '@/lib/agents/types';
import clsx from 'clsx';

interface AgentCardProps {
  role: AgentRole;
  isActive?: boolean;
  isSpeaking?: boolean;
}

export function AgentCard({ role, isSpeaking = false }: AgentCardProps) {
  const agent = AGENTS[role];
  
  return (
    <div 
      className={clsx(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-default",
        "border border-transparent",
        isSpeaking && "border-[rgb(var(--accent)/0.4)] bg-[rgb(var(--accent)/0.08)]",
        !isSpeaking && "hover:bg-[rgb(var(--bg-elevated))]"
      )}
    >
      {/* Icon */}
      <div 
        className={clsx(
          "w-8 h-8 rounded-lg flex items-center justify-center text-sm",
          isSpeaking ? "opacity-100" : "opacity-70"
        )}
        style={{ 
          backgroundColor: `rgb(${getAgentColorVar(role)} / 0.15)`,
          color: `rgb(${getAgentColorVar(role)})`
        }}
      >
        {agent.icon}
      </div>
      
      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={clsx(
            "text-[12px] font-semibold",
            isSpeaking ? "text-white" : "text-[rgb(var(--text-primary))]"
          )}>
            {agent.name}
          </span>
          {isSpeaking && (
            <span className="flex items-center gap-1 text-[10px] text-[rgb(var(--accent))]">
              <span className="w-1 h-1 rounded-full bg-current animate-pulse-dot" />
              thinking
            </span>
          )}
        </div>
        <p className="text-[11px] text-[rgb(var(--text-muted))] truncate">
          {agent.defaultModel}
        </p>
      </div>
    </div>
  );
}

function getAgentColorVar(role: AgentRole): string {
  const map: Record<AgentRole, string> = {
    moderator: 'var(--agent-moderator)',
    architect: 'var(--agent-architect)',
    sentinel: 'var(--agent-sentinel)',
    optimizer: 'var(--agent-optimizer)',
    maintainer: 'var(--agent-maintainer)',
    verifier: 'var(--agent-verifier)',
  };
  return map[role];
}

// Minimal avatar for inline use
export function AgentAvatar({ role, size = 'md' }: { role: AgentRole; size?: 'sm' | 'md' }) {
  const agent = AGENTS[role];
  
  return (
    <div 
      className={clsx(
        "rounded-lg flex items-center justify-center shrink-0",
        size === 'sm' && "w-6 h-6 text-xs",
        size === 'md' && "w-7 h-7 text-sm"
      )}
      style={{ 
        backgroundColor: `rgb(${getAgentColorVar(role)} / 0.15)`,
        color: `rgb(${getAgentColorVar(role)})`
      }}
    >
      {agent.icon}
    </div>
  );
}
