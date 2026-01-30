'use client';

import { motion, useReducedMotion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Check, X } from 'lucide-react';

const COMPARISON_ROWS = [
  {
    feature: 'Compatibility errors',
    buildstack: 'Prevented automatically',
    manual: 'Discovered after purchase',
    buildstackPositive: true,
    manualPositive: false,
  },
  {
    feature: 'Time required',
    buildstack: 'Under 5 minutes',
    manual: 'Hours of research',
    buildstackPositive: true,
    manualPositive: false,
  },
  {
    feature: 'Upgrade planning',
    buildstack: 'Built-in insights',
    manual: 'Requires expertise',
    buildstackPositive: true,
    manualPositive: false,
  },
  {
    feature: 'Price optimization',
    buildstack: 'Real-time comparison',
    manual: 'Manual price hunting',
    buildstackPositive: true,
    manualPositive: false,
  },
  {
    feature: 'Wattage calculation',
    buildstack: 'Automatic with headroom',
    manual: 'Calculator + guesswork',
    buildstackPositive: true,
    manualPositive: false,
  },
  {
    feature: 'Shareable builds',
    buildstack: 'One-click link',
    manual: 'Screenshot + spreadsheet',
    buildstackPositive: true,
    manualPositive: false,
  },
];

export function Comparison() {
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.06,
      },
    },
  };

  const rowVariants = {
    hidden: {
      opacity: 0,
      y: prefersReducedMotion ? 0 : 15,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: prefersReducedMotion ? 0 : 0.3,
        ease: 'easeOut' as const,
      },
    },
  };

  return (
    <section className="py-12 sm:py-16 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl sm:text-4xl font-bold">
            Why use BuildStack?
          </h2>
          <p className="mt-4 text-muted-foreground">
            See how we compare to manual PC building.
          </p>
        </motion.div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="rounded-xl border border-border overflow-hidden"
        >
          {/* Header */}
          <div className="grid grid-cols-3 bg-muted/50">
            <div className="p-4 text-sm font-medium text-muted-foreground">
              Feature
            </div>
            <div className="p-4 text-sm font-medium text-center bg-primary/5 border-x border-border">
              BuildStack
            </div>
            <div className="p-4 text-sm font-medium text-center text-muted-foreground">
              Manual
            </div>
          </div>

          {/* Rows */}
          {COMPARISON_ROWS.map((row, index) => (
            <motion.div
              key={row.feature}
              variants={rowVariants}
              className={`grid grid-cols-3 ${
                index !== COMPARISON_ROWS.length - 1 ? 'border-b border-border' : ''
              }`}
            >
              <div className="p-4 text-sm font-medium">{row.feature}</div>
              <div className="p-4 text-sm text-center bg-primary/5 border-x border-border">
                <div className="flex items-center justify-center gap-2">
                  {row.buildstackPositive && (
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  )}
                  <span>{row.buildstack}</span>
                </div>
              </div>
              <div className="p-4 text-sm text-center text-muted-foreground">
                <div className="flex items-center justify-center gap-2">
                  {!row.manualPositive && (
                    <X className="w-4 h-4 text-red-500/70 flex-shrink-0" />
                  )}
                  <span>{row.manual}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default Comparison;
