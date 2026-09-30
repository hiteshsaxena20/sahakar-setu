import { ReactNode } from 'react';
import { clsx } from 'clsx';

interface BadgeProps {
  children: ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'gray' | 'primary' | 'secondary';
  className?: string;
  size?: 'sm' | 'md';
}

const variantClasses = {
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  danger: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
  gray: 'bg-gray-100 text-gray-800',
  primary: 'bg-primary-100 text-primary-800',
  secondary: 'bg-secondary-100 text-secondary-800',
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-0.5 text-xs',
};

export function Badge({ children, variant = 'gray', className = '', size = 'md' }: BadgeProps) {
  return (
    <span className={clsx('inline-flex items-center rounded-full font-medium', variantClasses[variant], sizeClasses[size], className)}>
      {children}
    </span>
  );
}