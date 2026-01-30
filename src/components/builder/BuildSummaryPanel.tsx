'use client';

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Build, Category, CompatibilityIssue, CATEGORIES, getPsuWattage } from './types';

interface BuildSummaryPanelProps {
  build: Build;
  totalPrice: number;
  estimatedWattage: number;
  issues: CompatibilityIssue[];
  onCategoryClick: (category: Category) => void;
  onRemove: (category: Category) => void;
  onReview?: () => void;
  onShare?: () => void;
}

function formatINR(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function BuildSummaryPanel({
  build,
  totalPrice,
  estimatedWattage,
  issues,
  onCategoryClick,
  onRemove,
  onReview,
  onShare,
}: BuildSummaryPanelProps) {
  const prefersReducedMotion = useReducedMotion();
  const selectedCount = Object.values(build).filter(Boolean).length;
  const hasIssues = issues.length > 0;
  const hasErrors = issues.some((i) => i.type === 'error');
  const corePartsSelected = build.cpu && build.gpu && build.motherboard && build.ram;

  const psuWattage = getPsuWattage(build.psu);

  const containerVariants = {
    hidden: { opacity: 0, x: prefersReducedMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: prefersReducedMotion ? 0 : 0.4,
        staggerChildren: prefersReducedMotion ? 0 : 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: prefersReducedMotion ? 0 : 10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: prefersReducedMotion ? 0 : 0.2 },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="sticky top-24 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent p-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Your Build</h2>
        <span className="text-sm text-white/50">{selectedCount}/8</span>
      </div>

      {/* Compatibility status */}
      <motion.div
        variants={itemVariants}
        className={`mb-4 px-3 py-2 rounded-lg text-sm ${
          hasErrors
            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
            : hasIssues
            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            : selectedCount > 1
            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
            : 'bg-white/5 text-white/50 border border-white/10'
        }`}
      >
        {hasErrors ? (
          <span className="flex items-center gap-2">
            <span>⚠️</span>
            <span>Compatibility issues found</span>
          </span>
        ) : hasIssues ? (
          <span className="flex items-center gap-2">
            <span>⚠️</span>
            <span>Warnings detected</span>
          </span>
        ) : selectedCount > 1 ? (
          <span className="flex items-center gap-2">
            <span>✓</span>
            <span>All compatible</span>
          </span>
        ) : (
          'Select parts to check compatibility'
        )}
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3 mb-4">
        <div className="px-3 py-2 rounded-lg bg-white/5 border border-white/10">
          <div className="text-xs text-white/50">Est. Wattage</div>
          <div className="text-sm font-medium text-white">{estimatedWattage}W</div>
        </div>
        <div className="px-3 py-2 rounded-lg bg-white/5 border border-white/10">
          <div className="text-xs text-white/50">PSU Headroom</div>
          <div className="text-sm font-medium text-white">
            {psuWattage
              ? `${Math.round(((psuWattage - estimatedWattage) / psuWattage) * 100)}%`
              : '—'}
          </div>
        </div>
      </motion.div>

      {/* Parts list */}
      <div className="space-y-1.5 mb-4">
        {CATEGORIES.map((cat) => {
          const part = build[cat.id];
          const hasIssue = issues.some((i) => i.categories.includes(cat.id));

          return (
            <motion.div
              key={cat.id}
              variants={itemVariants}
              onClick={() => onCategoryClick(cat.id)}
              className={`group flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all ${
                part
                  ? 'bg-white/5 hover:bg-white/10'
                  : 'bg-transparent hover:bg-white/5'
              } ${hasIssue ? 'ring-1 ring-amber-500/30' : ''}`}
            >
              <div
                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  part ? (hasIssue ? 'bg-amber-500' : 'bg-green-500') : 'bg-white/20'
                }`}
              />
              <div className="flex-1 min-w-0">
                <div className="text-xs text-white/50">{cat.label}</div>
                <AnimatePresence mode="wait">
                  {part ? (
                    <motion.div
                      key={part.id}
                      initial={prefersReducedMotion ? {} : { opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={prefersReducedMotion ? {} : { opacity: 0, y: -5 }}
                      transition={{ duration: 0.15 }}
                      className="text-sm text-white truncate"
                    >
                      {part.brand} {part.name}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      className="text-sm text-white/30"
                    >
                      Not selected
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {part && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-sm text-white/70">
                    {formatINR(part.price)}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(cat.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition-opacity"
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
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Total price */}
      <motion.div
        variants={itemVariants}
        className="flex items-center justify-between py-3 border-t border-white/10"
      >
        <span className="text-white/70">Total</span>
        <AnimatePresence mode="wait">
          <motion.span
            key={totalPrice}
            initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={prefersReducedMotion ? {} : { opacity: 0, scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="text-2xl font-bold text-white"
          >
            {formatINR(totalPrice)}
          </motion.span>
        </AnimatePresence>
      </motion.div>

      {/* Issues list */}
      {issues.length > 0 && (
        <motion.div
          variants={itemVariants}
          className="mt-3 space-y-1.5"
        >
          {issues.slice(0, 2).map((issue, i) => (
            <div
              key={i}
              className={`text-xs px-2 py-1.5 rounded ${
                issue.type === 'error'
                  ? 'bg-red-500/10 text-red-400'
                  : 'bg-amber-500/10 text-amber-400'
              }`}
            >
              {issue.message}
            </div>
          ))}
        </motion.div>
      )}

      {/* Actions */}
      <div className="mt-4 space-y-2">
        <motion.button
          variants={itemVariants}
          whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
          whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
          disabled={!corePartsSelected || hasErrors}
          onClick={onReview}
          className={`w-full py-2.5 rounded-lg font-medium transition-all ${
            corePartsSelected && !hasErrors
              ? 'bg-white text-black hover:bg-white/90'
              : 'bg-white/10 text-white/30 cursor-not-allowed'
          }`}
        >
          Review Build
        </motion.button>
        <motion.button
          variants={itemVariants}
          whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
          whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
          disabled={selectedCount === 0}
          onClick={onShare}
          className={`w-full py-2.5 rounded-lg font-medium border transition-all ${
            selectedCount > 0
              ? 'border-white/20 text-white hover:bg-white/5'
              : 'border-white/10 text-white/30 cursor-not-allowed'
          }`}
        >
          Share Build Link
        </motion.button>
      </div>
    </motion.div>
  );
}
