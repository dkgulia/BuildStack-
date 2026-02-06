'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ChevronLeft } from 'lucide-react';
import { WizardProgress } from '@/components/wizard/WizardProgress';
import { WizardStepUseCase } from '@/components/wizard/WizardStepUseCase';
import { WizardStepPlatform } from '@/components/wizard/WizardStepPlatform';
import { WizardStepBudget } from '@/components/wizard/WizardStepBudget';
import { WizardStepResult } from '@/components/wizard/WizardStepResult';

export default function WizardPage() {
  const prefersReducedMotion = useReducedMotion();
  const [step, setStep] = useState(1);
  const [useCase, setUseCase] = useState('');
  const [platform, setPlatform] = useState('');
  const [budget, setBudget] = useState<number | null>(null);

  const handleUseCaseSelect = useCallback((uc: string) => {
    setUseCase(uc);
    setStep(2);
  }, []);

  const handlePlatformSelect = useCallback((p: string) => {
    setPlatform(p);
    setStep(3);
  }, []);

  const handleBudgetSelect = useCallback((b: number | null) => {
    setBudget(b);
    setStep(4);
  }, []);

  const handleStartOver = useCallback(() => {
    setStep(1);
    setUseCase('');
    setPlatform('');
    setBudget(null);
  }, []);

  const handleBack = useCallback(() => {
    if (step > 1) setStep((s) => s - 1);
  }, [step]);

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a]">
      <header className="border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/builder" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">Builder</span>
            </Link>
            <div className="h-4 w-px bg-white/10 hidden sm:block" />
            <Link href="/" className="font-semibold text-white">BuildStack</Link>
          </div>
          <Link
            href="/builder"
            className="text-sm text-white/50 hover:text-white transition-colors"
          >
            Skip to Builder
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12">
        {/* Progress */}
        <div className="mb-10">
          <WizardProgress currentStep={step} />
        </div>

        {/* Back button */}
        {step > 1 && step < 4 && (
          <button
            onClick={handleBack}
            className="flex items-center gap-1 mb-6 text-xs text-white/40 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Back
          </button>
        )}

        {/* Step content with transitions */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={prefersReducedMotion ? {} : { opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={prefersReducedMotion ? {} : { opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
          >
            {step === 1 && <WizardStepUseCase onSelect={handleUseCaseSelect} />}
            {step === 2 && <WizardStepPlatform onSelect={handlePlatformSelect} />}
            {step === 3 && <WizardStepBudget onSelect={handleBudgetSelect} />}
            {step === 4 && (
              <WizardStepResult
                useCase={useCase}
                platform={platform}
                budget={budget}
                onStartOver={handleStartOver}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
