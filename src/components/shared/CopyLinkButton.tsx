'use client';

import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Link2, Check } from 'lucide-react';

interface CopyLinkButtonProps {
  className?: string;
}

export function CopyLinkButton({ className = '' }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = window.location.href;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.button
      onClick={handleCopy}
      whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
      whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
      className={`relative flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-white/20 text-white font-medium transition-colors hover:bg-white/5 ${className}`}
    >
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.span
            key="copied"
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? {} : { opacity: 0, y: -10 }}
            className="flex items-center gap-2"
          >
            <Check className="w-4 h-4 text-green-400" />
            Copied!
          </motion.span>
        ) : (
          <motion.span
            key="copy"
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? {} : { opacity: 0, y: -10 }}
            className="flex items-center gap-2"
          >
            <Link2 className="w-4 h-4" />
            Copy Link
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
