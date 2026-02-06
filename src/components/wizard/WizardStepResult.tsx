'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Cpu, Monitor, CircuitBoard, MemoryStick, HardDrive, Zap, Box, Fan,
  Loader2, CheckCircle2, AlertTriangle, RotateCcw, ArrowRight,
} from 'lucide-react';

interface WizardBuildPart {
  part: {
    id: string;
    type: string;
    brand: string;
    name: string;
    specs: Record<string, unknown>;
  };
  reason: string;
}

interface WizardResultData {
  success: boolean;
  source: string;
  build: Record<string, WizardBuildPart>;
}

const CATEGORY_CONFIG: Record<string, { label: string; icon: React.ElementType }> = {
  cpu: { label: 'CPU', icon: Cpu },
  gpu: { label: 'GPU', icon: Monitor },
  motherboard: { label: 'Motherboard', icon: CircuitBoard },
  ram: { label: 'RAM', icon: MemoryStick },
  storage: { label: 'Storage', icon: HardDrive },
  psu: { label: 'PSU', icon: Zap },
  case: { label: 'Case', icon: Box },
  cooling: { label: 'Cooling', icon: Fan },
};

const LOADING_MESSAGES = [
  'Finding the best CPU...',
  'Matching a powerful GPU...',
  'Picking a compatible motherboard...',
  'Selecting fast RAM...',
  'Choosing optimal storage...',
  'Sizing the power supply...',
  'Finding a great case...',
  'Adding cooling...',
];

interface WizardStepResultProps {
  useCase: string;
  platform: string;
  budget: number | null;
  onStartOver: () => void;
}

export function WizardStepResult({ useCase, platform, budget, onStartOver }: WizardStepResultProps) {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const [result, setResult] = useState<WizardResultData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  // Cycle through loading messages
  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 1200);
    return () => clearInterval(interval);
  }, [isLoading]);

  // Fetch wizard build
  useEffect(() => {
    const fetchBuild = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/ai/wizard', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            use_case: useCase,
            platform,
            budget,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setResult(data);
        } else {
          setError(data.error || 'Failed to generate build');
        }
      } catch {
        setError('Failed to generate build. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBuild();
  }, [useCase, platform, budget]);

  const handleCustomize = () => {
    if (!result?.build) return;

    // Convert wizard build to the format builder expects
    const buildParts: Record<string, unknown> = {};
    for (const [category, item] of Object.entries(result.build)) {
      if (item?.part) {
        buildParts[category] = item.part;
      }
    }

    localStorage.setItem('wizard_build', JSON.stringify(buildParts));
    router.push('/builder?fromWizard=true');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-6">
        <Loader2 className="w-8 h-8 text-white/30 animate-spin" />
        <AnimatePresence mode="wait">
          <motion.p
            key={loadingMessageIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="text-sm text-white/50"
          >
            {LOADING_MESSAGES[loadingMessageIndex]}
          </motion.p>
        </AnimatePresence>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <AlertTriangle className="w-8 h-8 text-yellow-400/60" />
        <p className="text-sm text-white/50">{error}</p>
        <button
          onClick={onStartOver}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-white/10 text-white rounded-lg hover:bg-white/15 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    );
  }

  if (!result?.build) return null;

  const partCount = Object.keys(result.build).length;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-white">Your Build is Ready</h2>
        <div className="flex items-center justify-center gap-2 mt-2">
          <CheckCircle2 className="w-4 h-4 text-green-400" />
          <span className="text-sm text-white/50">
            {partCount} components selected
            {result.source === 'deepseek' ? ' via AI' : ' via smart matching'}
          </span>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
        {Object.entries(result.build).map(([category, item], i) => {
          const config = CATEGORY_CONFIG[category];
          if (!config || !item?.part) return null;
          const Icon = config.icon;

          return (
            <motion.div
              key={category}
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: prefersReducedMotion ? 0 : i * 0.06 }}
              className="p-4 rounded-xl border border-white/10 bg-white/[0.02]"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-white/40" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] text-white/40 uppercase tracking-wide">{config.label}</div>
                  <div className="text-sm font-medium text-white truncate mt-0.5">
                    {item.part.brand} {item.part.name}
                  </div>
                  {item.reason && (
                    <p className="text-[11px] text-white/30 mt-1 line-clamp-2">{item.reason}</p>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-2">
        <button
          onClick={handleCustomize}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-white text-black font-medium rounded-lg hover:bg-white/90 transition-colors"
        >
          Customize in Builder
          <ArrowRight className="w-4 h-4" />
        </button>
        <button
          onClick={onStartOver}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/5 text-white/60 font-medium rounded-lg hover:bg-white/10 hover:text-white transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Start Over
        </button>
      </div>
    </div>
  );
}
