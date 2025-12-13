import clsx from 'clsx';
import { Severity } from '@/lib/agents/types';

interface BadgeProps {
  severity: Severity;
  className?: string;
}

const SEVERITY_STYLES: Record<Severity, string> = {
  P0: 'bg-red-500/20 text-red-400 border-red-500/30',
  P1: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  P2: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  P3: 'bg-green-500/20 text-green-400 border-green-500/30',
};

export function SeverityBadge({ severity, className }: BadgeProps) {
  return (
    <span className={clsx(
      'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider border',
      SEVERITY_STYLES[severity],
      className
    )}>
      {severity}
    </span>
  );
}

interface StatusBadgeProps {
  status: 'connected' | 'disconnected' | 'running';
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span className={clsx(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border',
      status === 'connected' && 'bg-green-500/10 text-green-400 border-green-500/20',
      status === 'disconnected' && 'bg-red-500/10 text-red-400 border-red-500/20',
      status === 'running' && 'bg-violet-500/10 text-violet-400 border-violet-500/20',
      className
    )}>
      <span className={clsx(
        'w-1.5 h-1.5 rounded-full',
        status === 'connected' && 'bg-green-500',
        status === 'disconnected' && 'bg-red-500',
        status === 'running' && 'bg-violet-500 animate-pulse'
      )} />
      {status}
    </span>
  );
}
