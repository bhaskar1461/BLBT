import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'bull' | 'bear' | 'ghost' | 'outline' | 'icon';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 select-none text-xs font-sans',
          // Variants using Tailwind tokens
          variant === 'default' && 'bg-card text-main hover:bg-hover border border-subtle hover:border-cardborder',
          variant === 'primary' && 'bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20',
          variant === 'bull' && 'bg-bull text-canvas font-semibold hover:bg-bull/90 shadow-lg shadow-bull/20',
          variant === 'bear' && 'bg-bear text-white font-semibold hover:bg-bear/90 shadow-lg shadow-bear/20',
          variant === 'ghost' && 'bg-transparent text-muted hover:bg-hover hover:text-main',
          variant === 'outline' && 'bg-transparent border border-subtle text-muted hover:bg-hover hover:text-main',
          variant === 'icon' && 'p-1.5 bg-card hover:bg-hover border border-subtle text-muted hover:text-main',
          // Sizes
          size === 'default' && 'h-8 px-3 py-1.5',
          size === 'sm' && 'h-7 px-2 text-[11px]',
          size === 'lg' && 'h-10 px-4 text-sm',
          size === 'icon' && 'h-7 w-7 p-0',
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
