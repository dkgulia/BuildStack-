'use client';

import { motion } from 'framer-motion';

const STEPS = [
  { label: 'Use Case', step: 1 },
  { label: 'Platform', step: 2 },
  { label: 'Budget', step: 3 },
  { label: 'Result', step: 4 },
];

interface WizardProgressProps {
  currentStep: number;
}

export function WizardProgress({ currentStep }: WizardProgressProps) {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4">
      {STEPS.map((s, i) => (
        <div key={s.step} className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2">
            <div
              className={`relative w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                currentStep > s.step
                  ? 'bg-white text-black'
                  : currentStep === s.step
                    ? 'bg-white text-black'
                    : 'bg-white/10 text-white/40'
              }`}
            >
              {currentStep > s.step ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                s.step
              )}
              {currentStep === s.step && (
                <motion.div
                  layoutId="step-ring"
                  className="absolute inset-[-3px] rounded-full border-2 border-white"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </div>
            <span
              className={`hidden sm:inline text-xs font-medium transition-colors ${
                currentStep >= s.step ? 'text-white' : 'text-white/40'
              }`}
            >
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={`w-8 sm:w-12 h-px transition-colors ${
                currentStep > s.step ? 'bg-white/50' : 'bg-white/10'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
