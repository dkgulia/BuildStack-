'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Gamepad2, Film, Code2, Briefcase } from 'lucide-react';

const USE_CASES = [
  {
    id: 'gaming',
    label: 'Gaming',
    description: 'High FPS gaming, ray tracing, AAA titles',
    icon: Gamepad2,
    tags: ['GPU-heavy', '144+ FPS'],
  },
  {
    id: 'editing',
    label: 'Video Editing',
    description: 'Premiere Pro, DaVinci Resolve, 4K rendering',
    icon: Film,
    tags: ['Multi-core', 'RAM-heavy'],
  },
  {
    id: 'coding',
    label: 'Coding / Dev',
    description: 'IDEs, Docker, compiling, VMs',
    icon: Code2,
    tags: ['Multi-threaded', 'Fast storage'],
  },
  {
    id: 'office',
    label: 'Office / General',
    description: 'Browsing, documents, light multitasking',
    icon: Briefcase,
    tags: ['Budget-friendly', 'Quiet'],
  },
];

interface WizardStepUseCaseProps {
  onSelect: (useCase: string) => void;
}

export function WizardStepUseCase({ onSelect }: WizardStepUseCaseProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-white">What will you use this PC for?</h2>
        <p className="mt-2 text-sm text-white/50">This helps us pick the right components for your needs.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
        {USE_CASES.map((uc, i) => {
          const Icon = uc.icon;
          return (
            <motion.button
              key={uc.id}
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: prefersReducedMotion ? 0 : i * 0.08 }}
              onClick={() => onSelect(uc.id)}
              className="group p-5 rounded-xl border border-white/10 bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.05] transition-all text-left"
            >
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-lg bg-white/5 group-hover:bg-white/10 flex items-center justify-center flex-shrink-0 transition-colors">
                  <Icon className="w-5 h-5 text-white/50 group-hover:text-white/80 transition-colors" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">{uc.label}</h3>
                  <p className="text-xs text-white/40 mt-1">{uc.description}</p>
                  <div className="flex gap-1.5 mt-2">
                    {uc.tags.map((tag) => (
                      <span key={tag} className="px-1.5 py-0.5 text-[10px] rounded bg-white/5 text-white/50">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
