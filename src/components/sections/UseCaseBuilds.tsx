'use client';

import { motion, useReducedMotion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const USE_CASES = [
  {
    title: 'Gaming PC',
    budget: '₹80,000 – ₹2,50,000',
    focus: 'High FPS, ray tracing, smooth gameplay',
    query: 'gaming',
  },
  {
    title: 'Video Editing',
    budget: '₹1,00,000 – ₹3,00,000',
    focus: '4K/8K timeline, fast renders, color accuracy',
    query: 'editing',
  },
  {
    title: 'Coding / Dev',
    budget: '₹60,000 – ₹1,50,000',
    focus: 'Multi-tasking, fast builds, Docker-ready',
    query: 'coding',
  },
  {
    title: 'Office Workstation',
    budget: '₹40,000 – ₹80,000',
    focus: 'Reliability, quiet operation, efficiency',
    query: 'office',
  },
];

export function UseCaseBuilds() {
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.12,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: prefersReducedMotion ? 0 : 25,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: prefersReducedMotion ? 0 : 0.5,
        ease: 'easeOut' as const,
      },
    },
  };

  return (
    <section className="py-12 sm:py-16 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl sm:text-4xl font-bold">
            Built for what you do
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Start with a template optimized for your workflow.
          </p>
        </motion.div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {USE_CASES.map((useCase) => (
            <motion.div
              key={useCase.title}
              variants={itemVariants}
              whileHover={
                prefersReducedMotion
                  ? {}
                  : {
                      y: -6,
                      transition: { duration: 0.2 },
                    }
              }
              className="group relative p-6 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all"
            >
              <h3 className="text-lg font-semibold">{useCase.title}</h3>
              <div className="mt-4 space-y-2">
                <div>
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">
                    Budget
                  </span>
                  <p className="text-sm font-medium">{useCase.budget}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">
                    Focus
                  </span>
                  <p className="text-sm text-muted-foreground">{useCase.focus}</p>
                </div>
              </div>
              <Link
                href={`/builder?usecase=${useCase.query}`}
                className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline group-hover:gap-3 transition-all"
              >
                Use this template
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default UseCaseBuilds;
