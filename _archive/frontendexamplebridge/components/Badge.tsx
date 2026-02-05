import { HTMLAttributes } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'info' | 'danger';
}

export function Badge({ children, variant = 'info', className = '', ...props }: BadgeProps) {
  const variants = {
    success: 'bg-acacia-100 text-acacia-800',
    warning: 'bg-clay-100 text-clay-800',
    info: 'bg-savanna-200 text-savanna-800',
    danger: 'bg-clay-200 text-clay-900',
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
