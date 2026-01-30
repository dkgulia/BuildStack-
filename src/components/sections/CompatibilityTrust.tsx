'use client';

import { motion, useReducedMotion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Check } from 'lucide-react';

const CHECKS = [
  {
    title: 'CPU–Motherboard socket match',
    description: 'LGA 1700, AM5, AM4—automatically verified.',
  },
  {
    title: 'GPU clearance',
    description: 'Card length checked against case dimensions.',
  },
  {
    title: 'PSU wattage headroom',
    description: 'Minimum 20% buffer for stable operation.',
  },
  {
    title: 'RAM speed & capacity',
    description: 'DDR4/DDR5 type and max speed validated.',
  },
  {
    title: 'Cooler height clearance',
    description: 'Tower cooler fits your case, guaranteed.',
  },
  {
    title: 'M.2 slot availability',
    description: 'NVMe drives matched to available slots.',
  },
];

export function CompatibilityTrust() {
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      x: prefersReducedMotion ? 0 : -20,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: prefersReducedMotion ? 0 : 0.4,
        ease: 'easeOut' as const,
      },
    },
  };

  return (
    <section className="py-12 sm:py-16 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold">
              Compatibility you can trust
            </h2>
            <p className="mt-4 text-muted-foreground">
              Every build is validated against real-world specifications.
              No guesswork. No returns. No regrets.
            </p>
            <div className="mt-8 p-4 rounded-lg border border-border bg-card">
              <p className="text-sm text-muted-foreground">
                <span className="text-foreground font-medium">
                  Built on real data.
                </span>{' '}
                Our compatibility engine uses manufacturer specifications
                and community-verified measurements to ensure every part fits.
              </p>
            </div>
          </motion.div>

          {/* Right checklist */}
          <motion.div
            ref={ref}
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            className="space-y-3"
          >
            {CHECKS.map((check) => (
              <motion.div
                key={check.title}
                variants={itemVariants}
                className="flex items-start gap-4 p-4 rounded-lg border border-border bg-card"
              >
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">{check.title}</h4>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {check.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default CompatibilityTrust;
