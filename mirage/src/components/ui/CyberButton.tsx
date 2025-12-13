import clsx from 'clsx';
import { ButtonHTMLAttributes, ReactNode } from 'react';

interface CyberButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export function CyberButton({ children, className, variant = 'primary', size = 'md', ...props }: CyberButtonProps) {
  return (
    <button 
        className={clsx(
            "relative group overflow-hidden font-mono font-bold tracking-wide transition-all duration-300 flex items-center justify-center gap-2",
            "border disabled:opacity-50 disabled:cursor-not-allowed",
            {
                // Primary: Neon Violet Glow
                "bg-violet-600/20 border-violet-500/50 text-violet-100 hover:bg-violet-600/40 hover:border-violet-400 hover:shadow-[0_0_20px_rgba(124,58,237,0.3)]": variant === 'primary',
                
                // Ghost: Subtle White
                "bg-transparent border-transparent text-zinc-400 hover:text-white hover:bg-white/5": variant === 'ghost',
                
                // Danger: Red Glow
                "bg-red-500/10 border-red-500/30 text-red-200 hover:bg-red-500/20 hover:border-red-400": variant === 'danger',
                
                // Sizes
                "text-xs px-3 py-1.5 rounded-md": size === 'sm',
                "text-sm px-4 py-2 rounded-lg": size === 'md',
                "text-base px-6 py-3 rounded-xl": size === 'lg',
            },
            className
        )}
        {...props}
    >
        {/* Internal Glow for Primary */}
        {variant === 'primary' && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
        )}
        <span className="relative z-10 flex items-center gap-2">{children}</span>
    </button>
  );
}
