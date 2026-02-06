'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  motion,
  AnimatePresence,
  useReducedMotion,
} from 'framer-motion';

type UseCase = 'gaming' | 'editing' | 'coding' | 'office';

interface Suggestion {
  cpu: string;
  gpu: string;
  performance: string;
  wattage: string;
  upgrade: string;
}

const USE_CASES: { id: UseCase; label: string }[] = [
  { id: 'gaming', label: 'Gaming' },
  { id: 'editing', label: 'Editing' },
  { id: 'coding', label: 'Coding' },
  { id: 'office', label: 'Office' },
];

const TRUST_ITEMS = [
  'Compatibility checks',
  'Live pricing',
  'Shareable builds',
];

function formatINR(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function getSuggestion(budget: number, useCase: UseCase): Suggestion {
  const tier = budget < 60000 ? 'entry' : budget < 100000 ? 'mid' : budget < 150000 ? 'high' : 'enthusiast';

  const suggestions: Record<string, Record<UseCase, Suggestion>> = {
    entry: {
      gaming: {
        cpu: 'Intel i3 / Ryzen 3',
        gpu: 'GTX 1650 / RX 6500 XT',
        performance: '1080p Medium settings',
        wattage: '~15%',
        upgrade: 'Limited',
      },
      editing: {
        cpu: 'Intel i5 / Ryzen 5',
        gpu: 'Integrated / GTX 1650',
        performance: 'Basic 1080p editing',
        wattage: '~20%',
        upgrade: 'Moderate',
      },
      coding: {
        cpu: 'Intel i5 / Ryzen 5',
        gpu: 'Integrated graphics',
        performance: 'Smooth IDE performance',
        wattage: '~25%',
        upgrade: 'Good',
      },
      office: {
        cpu: 'Intel i3 / Ryzen 3',
        gpu: 'Integrated graphics',
        performance: 'Excellent for productivity',
        wattage: '~30%',
        upgrade: 'Good',
      },
    },
    mid: {
      gaming: {
        cpu: 'Intel i5 / Ryzen 5',
        gpu: 'RTX 4060 / RX 7600',
        performance: '1080p High / 1440p Medium',
        wattage: '~20%',
        upgrade: 'Good',
      },
      editing: {
        cpu: 'Intel i7 / Ryzen 7',
        gpu: 'RTX 4060 / RX 7600',
        performance: '4K timeline editing',
        wattage: '~20%',
        upgrade: 'Good',
      },
      coding: {
        cpu: 'Intel i7 / Ryzen 7',
        gpu: 'RTX 4060 (CUDA)',
        performance: 'Fast builds + ML capable',
        wattage: '~25%',
        upgrade: 'Excellent',
      },
      office: {
        cpu: 'Intel i5 / Ryzen 5',
        gpu: 'Integrated / Entry GPU',
        performance: 'Overkill for office',
        wattage: '~35%',
        upgrade: 'Excellent',
      },
    },
    high: {
      gaming: {
        cpu: 'Intel i7 / Ryzen 7',
        gpu: 'RTX 4070 / RX 7800 XT',
        performance: '1440p High / 4K Medium',
        wattage: '~20%',
        upgrade: 'Good',
      },
      editing: {
        cpu: 'Intel i9 / Ryzen 9',
        gpu: 'RTX 4070 / RX 7800 XT',
        performance: 'Smooth 4K + 8K proxy',
        wattage: '~15%',
        upgrade: 'Good',
      },
      coding: {
        cpu: 'Intel i9 / Ryzen 9',
        gpu: 'RTX 4070 (CUDA)',
        performance: 'Heavy ML workloads',
        wattage: '~20%',
        upgrade: 'Excellent',
      },
      office: {
        cpu: 'Intel i7 / Ryzen 7',
        gpu: 'Entry GPU',
        performance: 'Way overkill',
        wattage: '~40%',
        upgrade: 'Excellent',
      },
    },
    enthusiast: {
      gaming: {
        cpu: 'Intel i9 / Ryzen 9',
        gpu: 'RTX 4080 / RX 7900 XT',
        performance: '4K Ultra + Ray Tracing',
        wattage: '~15%',
        upgrade: 'Top tier',
      },
      editing: {
        cpu: 'Intel i9 / Ryzen 9',
        gpu: 'RTX 4080 / RX 7900 XT',
        performance: '8K native editing',
        wattage: '~15%',
        upgrade: 'Top tier',
      },
      coding: {
        cpu: 'Intel i9 / Ryzen 9',
        gpu: 'RTX 4080+ (CUDA)',
        performance: 'Enterprise ML ready',
        wattage: '~15%',
        upgrade: 'Top tier',
      },
      office: {
        cpu: 'Intel i9 / Ryzen 9',
        gpu: 'RTX 4070',
        performance: 'Extreme overkill',
        wattage: '~40%',
        upgrade: 'Top tier',
      },
    },
  };

  return suggestions[tier][useCase];
}

export function HeroSection() {
  const [budget, setBudget] = useState(100000);
  const [useCase, setUseCase] = useState<UseCase>('gaming');
  const prefersReducedMotion = useReducedMotion();

  const suggestion = getSuggestion(budget, useCase);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.1,
        delayChildren: prefersReducedMotion ? 0 : 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: prefersReducedMotion ? 0 : 0.5 },
    },
  };

  const cardVariants = {
    hidden: {
      opacity: 0,
      x: prefersReducedMotion ? 0 : 50,
      y: prefersReducedMotion ? 0 : 0,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { duration: prefersReducedMotion ? 0 : 0.6, delay: prefersReducedMotion ? 0 : 0.3 },
    },
  };

  const cardVariantsMobile = {
    hidden: {
      opacity: 0,
      y: prefersReducedMotion ? 0 : 30,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: prefersReducedMotion ? 0 : 0.5, delay: prefersReducedMotion ? 0 : 0.2 },
    },
  };

  return (
    <section className="relative overflow-hidden bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center lg:text-left"
          >
            {/* Headline */}
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight"
            >
              Build your perfect
              <br />
              <span className="text-primary">PC setup</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={itemVariants}
              className="mt-6 text-lg text-muted-foreground max-w-lg mx-auto lg:mx-0"
            >
              Select components, verify compatibility instantly, and get the best
              value for your budget. All in one place.
            </motion.p>

            {/* Trust Row */}
            <motion.div
              variants={itemVariants}
              className="mt-8 flex flex-wrap justify-center lg:justify-start gap-2"
            >
              {TRUST_ITEMS.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-muted text-muted-foreground"
                >
                  {item}
                </span>
              ))}
            </motion.div>

            {/* CTAs */}
            <motion.div
              variants={itemVariants}
              className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start"
            >
              <motion.div
                whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
              >
                <Link
                  href="/builder"
                  className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  Start Build
                </Link>
              </motion.div>
              <motion.div
                whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
              >
                <Link
                  href="/builder/wizard"
                  className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 rounded-lg border font-medium hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  Guided Setup
                </Link>
              </motion.div>
            </motion.div>

            {/* Helper Text */}
            <motion.p
              variants={itemVariants}
              className="mt-4 text-sm text-muted-foreground"
            >
              No signup required • Not sure where to start? Try the <Link href="/builder/wizard" className="underline hover:text-foreground transition-colors">guided wizard</Link>.
            </motion.p>
          </motion.div>

          {/* Right Card - Desktop */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="hidden lg:block"
          >
            <BudgetCard
              budget={budget}
              setBudget={setBudget}
              useCase={useCase}
              setUseCase={setUseCase}
              suggestion={suggestion}
              prefersReducedMotion={prefersReducedMotion}
            />
          </motion.div>

          {/* Right Card - Mobile */}
          <motion.div
            variants={cardVariantsMobile}
            initial="hidden"
            animate="visible"
            className="lg:hidden"
          >
            <BudgetCard
              budget={budget}
              setBudget={setBudget}
              useCase={useCase}
              setUseCase={setUseCase}
              suggestion={suggestion}
              prefersReducedMotion={prefersReducedMotion}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

interface BudgetCardProps {
  budget: number;
  setBudget: (value: number) => void;
  useCase: UseCase;
  setUseCase: (value: UseCase) => void;
  suggestion: Suggestion;
  prefersReducedMotion: boolean | null;
}

function BudgetCard({
  budget,
  setBudget,
  useCase,
  setUseCase,
  suggestion,
  prefersReducedMotion,
}: BudgetCardProps) {
  return (
    <div className="relative rounded-2xl border bg-gradient-to-br from-muted/50 to-muted/20 p-6 shadow-lg">
      {/* Card Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Budget Builder</h3>
        <p className="text-sm text-muted-foreground">
          Get instant recommendations
        </p>
      </div>

      {/* Budget Slider */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label
            htmlFor="budget-slider"
            className="text-sm font-medium"
          >
            Budget
          </label>
          <span className="text-lg font-bold">{formatINR(budget)}</span>
        </div>
        <input
          id="budget-slider"
          type="range"
          min={40000}
          max={250000}
          step={5000}
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
          aria-label="Select your budget"
          aria-valuemin={40000}
          aria-valuemax={250000}
          aria-valuenow={budget}
          aria-valuetext={formatINR(budget)}
          className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>₹40,000</span>
          <span>₹2,50,000</span>
        </div>
      </div>

      {/* Use Case Pills */}
      <div className="mb-6">
        <label className="text-sm font-medium block mb-2">Use Case</label>
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Select use case"
        >
          {USE_CASES.map((item) => (
            <motion.button
              key={item.id}
              onClick={() => setUseCase(item.id)}
              animate={
                prefersReducedMotion
                  ? {}
                  : {
                      backgroundColor:
                        useCase === item.id
                          ? 'var(--primary)'
                          : 'var(--muted)',
                    }
              }
              transition={{ duration: 0.2 }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                useCase === item.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
              aria-pressed={useCase === item.id}
            >
              {item.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Dynamic Output */}
      <div className="space-y-3 p-4 rounded-lg bg-background/50 border">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${budget}-${useCase}`}
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? {} : { opacity: 0, y: -10 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
            className="space-y-3"
          >
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">CPU Tier</span>
              <span className="text-sm font-medium">{suggestion.cpu}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">GPU Tier</span>
              <span className="text-sm font-medium">{suggestion.gpu}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Performance</span>
              <span className="text-sm font-medium">{suggestion.performance}</span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Mini Stats */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg bg-background/50 border text-center">
          <div className="text-xs text-muted-foreground">Wattage headroom</div>
          <div className="text-sm font-medium mt-1">{suggestion.wattage}</div>
        </div>
        <div className="p-3 rounded-lg bg-background/50 border text-center">
          <div className="text-xs text-muted-foreground">Upgrade path</div>
          <div className="text-sm font-medium mt-1">{suggestion.upgrade}</div>
        </div>
      </div>
    </div>
  );
}

export default HeroSection;
