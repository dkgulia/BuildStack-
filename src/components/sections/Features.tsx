'use client';

import { motion, useReducedMotion, useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  Shield,
  Zap,
  Gauge,
  Battery,
  TrendingUp,
  Share2,
} from 'lucide-react';

const FEATURES = [
  {
    icon: Shield,
    title: 'Zero incompatible parts',
    description: 'Every component is validated against your build automatically.',
  },
  {
    icon: Zap,
    title: 'Live pricing',
    description: 'See total costs update in real-time as you configure.',
  },
  {
    icon: Gauge,
    title: 'Bottleneck detection',
    description: 'Identify CPU-GPU imbalances before you buy.',
  },
  {
    icon: Battery,
    title: 'Wattage safety check',
    description: 'PSU headroom calculated for stable, safe operation.',
  },
  {
    icon: TrendingUp,
    title: 'Upgrade path insights',
    description: 'Know which parts can be upgraded in the future.',
  },
  {
    icon: Share2,
    title: 'Shareable build links',
    description: 'Share your build with friends or save for later.',
  },
];

export function Features() {
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: prefersReducedMotion ? 0 : 20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: prefersReducedMotion ? 0 : 0.4,
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
            Built for serious builders
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Every feature designed to save you time and prevent costly mistakes.
          </p>
        </motion.div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                whileHover={
                  prefersReducedMotion
                    ? {}
                    : {
                        scale: 1.02,
                        transition: { duration: 0.2 },
                      }
                }
                className="group p-6 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="mt-4 font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

export default Features;
