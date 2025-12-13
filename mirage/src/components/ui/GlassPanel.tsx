import clsx from 'clsx';
import { ReactNode } from 'react';

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
  variant?: 'base' | 'flat' | 'heavy';
}

export function GlassPanel({ children, className, variant = 'base' }: GlassPanelProps) {
  return (
    <div 
        className={clsx(
            "border border-white/5 backdrop-blur-xl relative overflow-hidden",
            {
                'bg-zinc-950/60 shadow-xl': variant === 'base',
                'bg-black/40': variant === 'flat',
                'bg-zinc-900/80 border-white/10': variant === 'heavy'
            },
            className
        )}
    >
        {/* Shine effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
        {children}
    </div>
  );
}
