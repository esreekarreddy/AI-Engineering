import { ReactNode } from 'react';
import clsx from 'clsx';

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
  glow?: 'violet' | 'red' | 'green' | 'none';
}

export function GlassPanel({ children, className, glow = 'none' }: GlassPanelProps) {
  return (
    <div className={clsx(
      'glass rounded-xl',
      glow === 'violet' && 'glow-violet',
      glow === 'red' && 'glow-red',
      glow === 'green' && 'glow-green',
      className
    )}>
      {children}
    </div>
  );
}
