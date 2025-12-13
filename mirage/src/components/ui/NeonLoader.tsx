import { ComponentProps } from 'react';
import clsx from 'clsx';

export function NeonLoader({ className, ...props }: ComponentProps<'div'>) {
    return (
        <div className={clsx("flex items-center gap-1", className)} {...props}>
             <div className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
             <div className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
             <div className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce" />
        </div>
    );
}
