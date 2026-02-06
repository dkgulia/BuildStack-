'use client';

import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { GitCompareArrows } from 'lucide-react';
import { Part, getSpecsDisplay, Category } from './types';

interface CompareDrawerProps {
  parts: Part[];
  activeCategory?: Category;
  onRemove: (partId: string) => void;
  onClear: () => void;
  onSelect: (part: Part) => void;
}

export function CompareDrawer({ parts, activeCategory, onRemove, onClear, onSelect }: CompareDrawerProps) {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();

  if (parts.length === 0) return null;

  return (
    <motion.div
      initial={{ y: prefersReducedMotion ? 0 : 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: prefersReducedMotion ? 0 : 100, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#0a0a0a] border-t border-white/10 lg:bottom-4 lg:left-4 lg:right-4 lg:rounded-2xl lg:border"
    >
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white">
              Comparing {parts.length} items
            </span>
            <span className="text-xs text-white/50">(max 3)</span>
          </div>
          <div className="flex items-center gap-3">
            {parts.length >= 2 && (
              <button
                onClick={() => {
                  const ids = parts.map((p) => p.id).join(',');
                  const type = activeCategory || parts[0]?.type || 'cpu';
                  router.push(`/compare?ids=${ids}&type=${type}`);
                }}
                className="flex items-center gap-1 text-xs font-medium text-white/70 hover:text-white transition-colors"
              >
                <GitCompareArrows className="w-3.5 h-3.5" />
                Compare Details
              </button>
            )}
            <button
              onClick={onClear}
              className="text-xs text-white/50 hover:text-white transition-colors"
            >
              Clear all
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <AnimatePresence mode="popLayout">
            {parts.map((part) => {
              const specs = getSpecsDisplay(part);
              return (
                <motion.div
                  key={part.id}
                  layout
                  initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={prefersReducedMotion ? {} : { opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.15 }}
                  className="relative p-3 rounded-xl bg-white/5 border border-white/10"
                >
                  <button
                    onClick={() => onRemove(part.id)}
                    className="absolute top-2 right-2 p-1 hover:bg-white/10 rounded transition-colors"
                  >
                    <svg
                      className="w-3.5 h-3.5 text-white/50"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>

                  <div className="text-xs text-white/50 uppercase tracking-wide">
                    {part.brand}
                  </div>
                  <div className="text-sm font-medium text-white mt-0.5 pr-6 truncate">
                    {part.name}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {specs.slice(0, 2).map((spec, i) => (
                      <span
                        key={i}
                        className="px-1.5 py-0.5 text-[10px] rounded bg-white/10 text-white/70"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-end mt-3">
                    <button
                      onClick={() => onSelect(part)}
                      className="px-3 py-1 text-xs font-medium rounded-lg bg-white text-black hover:bg-white/90 transition-colors"
                    >
                      Select
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Empty slots */}
          {Array.from({ length: 3 - parts.length }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="p-3 rounded-xl border border-dashed border-white/10 flex items-center justify-center min-h-[100px]"
            >
              <span className="text-xs text-white/30">Add to compare</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
