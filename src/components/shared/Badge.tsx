'use client';

import { motion } from 'framer-motion';

type BadgeVariant = 'pass' | 'warn' | 'fail' | 'info' | 'default';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  pass: 'bg-green-500/10 text-green-400 border-green-500/20',
  warn: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  fail: 'bg-red-500/10 text-red-400 border-red-500/20',
  info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  default: 'bg-white/5 text-white/70 border-white/10',
};

const sizeStyles: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-base',
};

export function Badge({
  variant = 'default',
  children,
  size = 'md',
  animate = false,
}: BadgeProps) {
  const baseStyles = 'inline-flex items-center gap-1.5 rounded-full border font-medium';

  if (animate) {
    return (
      <motion.span
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]}`}
      >
        {children}
      </motion.span>
    );
  }

  return (
    <span className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]}`}>
      {children}
    </span>
  );
}
