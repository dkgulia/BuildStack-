'use client';

import { motion, useReducedMotion } from 'framer-motion';

const PLATFORMS = [
  {
    id: 'amd',
    label: 'AMD',
    description: 'Ryzen CPUs — great multi-core performance and value',
  },
  {
    id: 'intel',
    label: 'Intel',
    description: 'Core CPUs — strong single-thread and gaming performance',
  },
  {
    id: 'any',
    label: 'No Preference',
    description: 'Let us pick the best option regardless of brand',
  },
];

interface WizardStepPlatformProps {
  onSelect: (platform: string) => void;
}

export function WizardStepPlatform({ onSelect }: WizardStepPlatformProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-white">Which platform do you prefer?</h2>
        <p className="mt-2 text-sm text-white/50">Choose your CPU brand preference.</p>
      </div>

      <div className="flex flex-col gap-3 max-w-md mx-auto">
        {PLATFORMS.map((p, i) => (
          <motion.button
            key={p.id}
            initial={prefersReducedMotion ? {} : { opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: prefersReducedMotion ? 0 : i * 0.08 }}
            onClick={() => onSelect(p.id)}
            className="group p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.05] transition-all text-left"
          >
            <h3 className="text-sm font-semibold text-white">{p.label}</h3>
            <p className="text-xs text-white/40 mt-1">{p.description}</p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
