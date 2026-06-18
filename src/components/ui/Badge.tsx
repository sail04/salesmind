import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'gray';
  glow?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'gray',
  glow = false,
  className = '',
  ...props
}) => {
  let styleClass = '';
  switch (variant) {
    case 'primary':
      styleClass = glow 
        ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/30 shadow-[0_0_12px_rgba(95,90,246,0.2)]'
        : 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20';
      break;
    case 'secondary':
      styleClass = glow
        ? 'bg-brand-secondary/10 text-brand-secondary border border-brand-secondary/30 shadow-[0_0_12px_rgba(139,92,246,0.2)]'
        : 'bg-brand-secondary/10 text-brand-secondary border border-brand-secondary/20';
      break;
    case 'success':
      styleClass = glow
        ? 'bg-brand-success/10 text-brand-success border border-brand-success/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
        : 'bg-brand-success/10 text-brand-success border border-brand-success/20';
      break;
    case 'warning':
      styleClass = glow
        ? 'bg-brand-warning/10 text-brand-warning border border-brand-warning/30 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
        : 'bg-brand-warning/10 text-brand-warning border border-brand-warning/20';
      break;
    case 'error':
      styleClass = glow
        ? 'bg-brand-error/10 text-brand-error border border-brand-error/30 shadow-[0_0_12px_rgba(239,68,68,0.2)]'
        : 'bg-brand-error/10 text-brand-error border border-brand-error/20';
      break;
    case 'info':
      styleClass = glow
        ? 'bg-brand-accent/10 text-brand-accent border border-brand-accent/30 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
        : 'bg-brand-accent/10 text-brand-accent border border-brand-accent/20';
      break;
    case 'gray':
    default:
      styleClass = 'bg-border-color text-text-secondary border border-border-color/50';
      break;
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xxs font-semibold leading-none tracking-wide select-none ${styleClass} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
