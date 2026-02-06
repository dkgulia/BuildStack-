'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion, PanInfo } from 'framer-motion';
import { Build, Category, CompatibilityIssue, CATEGORIES } from './types';

interface MobileBuildSheetProps {
  isOpen: boolean;
  onClose: () => void;
  build: Build;
  totalPrice?: number;
  estimatedWattage: number;
  issues: CompatibilityIssue[];
  onCategoryClick: (category: Category) => void;
  onRemove: (category: Category) => void;
  onReview?: () => void;
  onShare?: () => void;
}

export function MobileBuildSheet({
  isOpen,
  onClose,
  build,
  estimatedWattage,
  issues,
  onCategoryClick,
  onRemove,
  onReview,
  onShare,
}: MobileBuildSheetProps) {
  const prefersReducedMotion = useReducedMotion();
  const selectedCount = Object.values(build).filter(Boolean).length;
  const hasErrors = issues.some((i) => i.type === 'error');
  const corePartsSelected = build.cpu && build.gpu && build.motherboard && build.ram;

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.velocity.y > 500 || info.offset.y > 200) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 35,
            }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={handleDragEnd}
            className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a] rounded-t-3xl max-h-[85vh] overflow-hidden"
          >
            {/* Drag handle */}
            <div className="flex justify-center py-3">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            {/* Content */}
            <div className="px-5 pb-8 overflow-y-auto max-h-[calc(85vh-50px)]">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Your Build</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-white/50"
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
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-center">
                  <div className="text-xs text-white/50">Parts</div>
                  <div className="text-sm font-medium text-white">{selectedCount}/8</div>
                </div>
                <div className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-center">
                  <div className="text-xs text-white/50">Wattage</div>
                  <div className="text-sm font-medium text-white">{estimatedWattage}W</div>
                </div>
                <div className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-center">
                  <div className="text-xs text-white/50">Status</div>
                  <div className="text-sm font-medium">
                    {hasErrors ? (
                      <span className="text-red-400">⚠️</span>
                    ) : issues.length > 0 ? (
                      <span className="text-amber-400">⚠️</span>
                    ) : selectedCount > 1 ? (
                      <span className="text-green-400">✓</span>
                    ) : (
                      <span className="text-white/30">—</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Parts list */}
              <div className="space-y-2 mb-4">
                {CATEGORIES.map((cat) => {
                  const part = build[cat.id];
                  const hasIssue = issues.some((i) => i.categories.includes(cat.id));

                  return (
                    <div
                      key={cat.id}
                      onClick={() => {
                        onCategoryClick(cat.id);
                        onClose();
                      }}
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all ${
                        part
                          ? 'bg-white/5 border border-white/10'
                          : 'border border-dashed border-white/10'
                      } ${hasIssue ? 'border-amber-500/30' : ''}`}
                    >
                      <div
                        className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                          part
                            ? hasIssue
                              ? 'bg-amber-500'
                              : 'bg-green-500'
                            : 'bg-white/20'
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-white/50">{cat.label}</div>
                        {part ? (
                          <div className="text-sm text-white truncate">
                            {part.brand} {part.name}
                          </div>
                        ) : (
                          <div className="text-sm text-white/30">Tap to select</div>
                        )}
                      </div>
                      {part && (
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemove(cat.id);
                            }}
                            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                          >
                            <svg
                              className="w-4 h-4 text-white/50"
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
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Issues */}
              {issues.length > 0 && (
                <div className="mb-4 space-y-1.5">
                  {issues.map((issue, i) => (
                    <div
                      key={i}
                      className={`text-xs px-3 py-2 rounded-lg ${
                        issue.type === 'error'
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {issue.message}
                    </div>
                  ))}
                </div>
              )}

              {/* Divider */}
              <div className="border-t border-white/10 mb-4" />

              {/* Actions */}
              <div className="space-y-2">
                <button
                  disabled={!corePartsSelected || hasErrors}
                  onClick={() => {
                    onClose();
                    onReview?.();
                  }}
                  className={`w-full py-3 rounded-xl font-medium transition-all ${
                    corePartsSelected && !hasErrors
                      ? 'bg-white text-black'
                      : 'bg-white/10 text-white/30 cursor-not-allowed'
                  }`}
                >
                  Review Build
                </button>
                <button
                  disabled={selectedCount === 0}
                  onClick={() => {
                    onClose();
                    onShare?.();
                  }}
                  className={`w-full py-3 rounded-xl font-medium border transition-all ${
                    selectedCount > 0
                      ? 'border-white/20 text-white'
                      : 'border-white/10 text-white/30 cursor-not-allowed'
                  }`}
                >
                  Share Build Link
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
