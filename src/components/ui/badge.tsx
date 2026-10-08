import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bull' | 'bear' | 'gold' | 'neutral' | 'outline';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium font-mono border transition-colors',
        variant === 'default' && 'bg-elevated text-main border-subtle',
        variant === 'bull' && 'bg-bull-bg text-bull border-bull/30',
        variant === 'bear' && 'bg-bear-bg text-bear border-bear/30',
        variant === 'gold' && 'bg-gold-bg text-gold border-gold/30',
        variant === 'neutral' && 'bg-card text-muted border-subtle',
        variant === 'outline' && 'text-muted border-subtle',
        className
      )}
      {...props}
    />
  );
}
