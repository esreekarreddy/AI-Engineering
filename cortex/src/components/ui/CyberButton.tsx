import { ReactNode, ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

interface CyberButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export function CyberButton({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className,
  disabled,
  ...props 
}: CyberButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black',
        // Size variants
        size === 'sm' && 'px-3 py-1.5 text-xs',
        size === 'md' && 'px-4 py-2 text-sm',
        size === 'lg' && 'px-6 py-3 text-base',
        // Color variants
        variant === 'primary' && [
          'bg-violet-600 text-white',
          'hover:bg-violet-500 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]',
          'focus:ring-violet-500',
          'disabled:bg-violet-600/50 disabled:cursor-not-allowed'
        ],
        variant === 'ghost' && [
          'bg-transparent text-zinc-400 border border-zinc-700',
          'hover:bg-zinc-800 hover:text-white hover:border-zinc-600',
          'focus:ring-zinc-500'
        ],
        variant === 'danger' && [
          'bg-red-600/20 text-red-400 border border-red-600/30',
          'hover:bg-red-600/30 hover:text-red-300 hover:shadow-[0_0_20px_rgba(239,68,68,0.2)]',
          'focus:ring-red-500'
        ],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
