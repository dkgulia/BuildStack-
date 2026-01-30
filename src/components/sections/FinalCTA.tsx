'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function FinalCTA() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="py-12 sm:py-16 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{
            opacity: 0,
            scale: prefersReducedMotion ? 1 : 0.95,
          }}
          whileInView={{
            opacity: 1,
            scale: 1,
          }}
          viewport={{ once: true }}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.5,
            ease: 'easeOut' as const,
          }}
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            Build smarter.
            <br />
            <span className="text-muted-foreground">Not harder.</span>
          </h2>

          <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto">
            Start your PC build in under 5 minutes. No signup required.
            No compatibility headaches. Just results.
          </p>

          <motion.div
            className="mt-10"
            whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
            whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
          >
            <Link
              href="/builder"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-lg bg-primary text-primary-foreground font-medium text-lg hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
            >
              Open Builder
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>

          <p className="mt-6 text-sm text-muted-foreground">
            Free forever • No account needed • 5,000+ components
          </p>
        </motion.div>
      </div>
    </section>
  );
}

export default FinalCTA;
