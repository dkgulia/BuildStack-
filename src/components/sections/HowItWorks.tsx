'use client';

import { motion, useReducedMotion, useInView } from 'framer-motion';
import { useRef } from 'react';

const STEPS = [
  {
    number: '01',
    title: 'Set your budget',
    description: 'Choose how much you want to spend. We optimize every rupee.',
  },
  {
    number: '02',
    title: 'Pick your use-case',
    description: 'Gaming, editing, coding, or office. We tailor recommendations.',
  },
  {
    number: '03',
    title: 'Auto compatibility check',
    description: 'Every part is validated. Socket, RAM, PSU, clearance—all checked.',
  },
  {
    number: '04',
    title: 'Get your build',
    description: 'Receive an optimized, compatible PC build ready to purchase.',
  },
];

export function HowItWorks() {
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: prefersReducedMotion ? 0 : 30,
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
          <h2 className="text-3xl sm:text-4xl font-bold">How it works</h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            From budget to build in four simple steps. No expertise required.
          </p>
        </motion.div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {STEPS.map((step) => (
            <motion.div
              key={step.number}
              variants={itemVariants}
              whileHover={
                prefersReducedMotion
                  ? {}
                  : {
                      y: -4,
                      transition: { duration: 0.2 },
                    }
              }
              className="group relative p-6 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-[0_0_30px_-10px] hover:shadow-primary/20 transition-colors"
            >
              <span className="text-5xl font-bold text-muted-foreground/20 group-hover:text-primary/20 transition-colors">
                {step.number}
              </span>
              <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {step.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default HowItWorks;
