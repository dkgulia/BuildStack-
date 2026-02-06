'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface WizardStepBudgetProps {
  onSelect: (budget: number | null) => void;
}

const MIN = 40000;
const MAX = 250000;
const STEP = 10000;

function formatBudget(value: number): string {
  if (value >= 100000) {
    return `${(value / 100000).toFixed(value % 100000 === 0 ? 0 : 1)}L`;
  }
  return `${(value / 1000).toFixed(0)}K`;
}

export function WizardStepBudget({ onSelect }: WizardStepBudgetProps) {
  const prefersReducedMotion = useReducedMotion();
  const [budget, setBudget] = useState(100000);

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-white">What's your budget?</h2>
        <p className="mt-2 text-sm text-white/50">We'll optimize your build within this range.</p>
      </div>

      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center">
          <span className="text-3xl font-bold text-white">
            ₹{budget.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="space-y-2">
          <input
            type="range"
            min={MIN}
            max={MAX}
            step={STEP}
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none bg-white/10 cursor-pointer accent-white [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer"
          />
          <div className="flex justify-between text-xs text-white/40">
            <span>₹{formatBudget(MIN)}</span>
            <span>₹{formatBudget(MAX)}</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => onSelect(budget)}
            className="w-full py-3 bg-white text-black font-medium rounded-lg hover:bg-white/90 transition-colors"
          >
            Continue with ₹{formatBudget(budget)} budget
          </button>
          <button
            onClick={() => onSelect(null)}
            className="w-full py-3 bg-white/5 text-white/60 font-medium rounded-lg hover:bg-white/10 hover:text-white transition-colors"
          >
            Skip — no budget limit
          </button>
        </div>
      </div>
    </motion.div>
  );
}
