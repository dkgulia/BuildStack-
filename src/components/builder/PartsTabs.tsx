'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Category, Build, CATEGORIES } from './types';

interface PartsTabsProps {
  activeTab: Category;
  onTabChange: (tab: Category) => void;
  build: Build;
}

export function PartsTabs({ activeTab, onTabChange, build }: PartsTabsProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="relative">
      <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
        {CATEGORIES.map((cat) => {
          const isActive = activeTab === cat.id;
          const isSelected = build[cat.id] !== null;

          return (
            <button
              key={cat.id}
              onClick={() => onTabChange(cat.id)}
              className="relative px-4 py-2 text-sm font-medium whitespace-nowrap rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white/20"
            >
              {isActive && (
                <motion.div
                  layoutId={prefersReducedMotion ? undefined : 'active-tab'}
                  className="absolute inset-0 bg-white rounded-lg"
                  transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 35,
                  }}
                />
              )}
              <span
                className={`relative z-10 flex items-center gap-2 ${
                  isActive ? 'text-black' : 'text-white/70 hover:text-white'
                }`}
              >
                {cat.label}
                {isSelected && !isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
