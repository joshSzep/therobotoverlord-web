import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'danger';
}

export function Badge({ children, className = '', variant = 'default' }: BadgeProps) {
  const baseClasses = 'inline-flex items-center px-2 py-1 text-xs font-medium rounded-full';
  
  const variantClasses = {
    default: 'bg-muted text-light-text',
    secondary: 'bg-muted/50 text-muted-light',
    success: 'bg-approved-green/20 text-approved-green',
    warning: 'bg-pending-yellow/20 text-pending-yellow',
    danger: 'bg-rejected-red/20 text-rejected-red',
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${className}`;

  return (
    <span className={classes}>
      {children}
    </span>
  );
}
