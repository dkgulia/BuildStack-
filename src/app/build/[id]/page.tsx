'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, Copy, ExternalLink, Cpu, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Build, evaluateCompatibility, CompatibilityReport } from '@/lib/compatibility';
import { Badge } from '@/components/shared/Badge';
import { CopyLinkButton } from '@/components/shared/CopyLinkButton';

function formatINR(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

const categoryLabels: Record<string, string> = {
  cpu: 'Processor',
  gpu: 'Graphics Card',
  motherboard: 'Motherboard',
  ram: 'Memory',
  storage: 'Storage',
  psu: 'Power Supply',
  case: 'Case',
  cooling: 'Cooling',
};

const categoryOrder = ['cpu', 'gpu', 'motherboard', 'ram', 'storage', 'psu', 'case', 'cooling'];

export default function BuildPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const [build, setBuild] = useState<Build | null>(null);
  const [report, setReport] = useState<CompatibilityReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBuild = async () => {
      try {
        const response = await fetch(`/api/build/${id}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Build not found');
          return;
        }

        setBuild(data.build);
        setReport(evaluateCompatibility(data.build));
      } catch {
        setError('Failed to load build');
      } finally {
        setLoading(false);
      }
    };

    fetchBuild();
  }, [id]);

  const handleDuplicate = () => {
    if (!build) return;

    localStorage.setItem('currentBuild', JSON.stringify({
      ...build,
      id: undefined,
      name: `${build.name || 'Build'} (Copy)`,
      createdAt: undefined,
    }));

    router.push('/builder');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: prefersReducedMotion ? 0 : 0.3 },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-white/50 animate-spin mx-auto mb-4" />
          <p className="text-white/50">Loading build...</p>
        </div>
      </div>
    );
  }

  if (error || !build) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-white mb-2">Build Not Found</h1>
          <p className="text-white/50 mb-6">{error || 'This build may have been removed or the link is invalid.'}</p>
          <Link
            href="/builder"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-medium hover:bg-white/90 transition-colors"
          >
            <Cpu className="w-4 h-4" />
            Start New Build
          </Link>
        </div>
      </div>
    );
  }

  const hasIssues = report && report.issues.some((i) => i.severity === 'fail');
  const hasWarnings = report && report.issues.some((i) => i.severity === 'warn');

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="fixed inset-0 bg-gradient-radial from-white/[0.02] via-transparent to-transparent pointer-events-none" />

      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-white/50 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline text-sm">Home</span>
          </Link>
          <Link href="/" className="font-semibold text-white">
            BuildStack
          </Link>
          <div className="w-20" />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                {build.name || 'Shared Build'}
              </h1>
              {build.createdAt && (
                <p className="text-white/50 mt-1">
                  Created {formatDate(build.createdAt)}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {hasIssues ? (
                <Badge variant="fail">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Issues Found
                </Badge>
              ) : hasWarnings ? (
                <Badge variant="warn">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Warnings
                </Badge>
              ) : (
                <Badge variant="pass">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Compatible
                </Badge>
              )}
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="grid sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
              <p className="text-xs text-white/50 uppercase tracking-wide mb-1">Total Price</p>
              <p className="text-2xl font-bold text-white">{formatINR(report?.totalPrice || 0)}</p>
            </div>
            <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
              <p className="text-xs text-white/50 uppercase tracking-wide mb-1">Est. Wattage</p>
              <p className="text-2xl font-bold text-white">{report?.estimatedWattage || 0}W</p>
            </div>
            <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
              <p className="text-xs text-white/50 uppercase tracking-wide mb-1">Parts</p>
              <p className="text-2xl font-bold text-white">{report?.partsCount || 0}/8</p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h2 className="text-lg font-semibold text-white mb-4">Components</h2>
            <div className="space-y-2">
              {categoryOrder.map((category, index) => {
                const part = build.parts[category as keyof typeof build.parts];

                return (
                  <motion.div
                    key={category}
                    initial={prefersReducedMotion ? {} : { opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className={`p-4 rounded-xl border ${
                      part
                        ? 'border-white/10 bg-white/5'
                        : 'border-dashed border-white/10 bg-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white/50 uppercase tracking-wide">
                          {categoryLabels[category]}
                        </p>
                        {part ? (
                          <p className="text-white font-medium mt-0.5 truncate">
                            {part.brand} {part.name}
                          </p>
                        ) : (
                          <p className="text-white/30 mt-0.5">Not selected</p>
                        )}
                      </div>
                      {part && (
                        <p className="text-white font-semibold ml-4 flex-shrink-0">
                          {formatINR(part.price)}
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-3 pt-4"
          >
            <motion.button
              onClick={handleDuplicate}
              whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-white text-black font-semibold hover:bg-white/90 transition-colors"
            >
              <Copy className="w-4 h-4" />
              Duplicate Build
            </motion.button>
            <CopyLinkButton className="flex-1 sm:flex-initial" />
            <Link
              href="/builder"
              className="flex items-center justify-center gap-2 py-3 px-6 rounded-xl border border-white/20 text-white font-medium hover:bg-white/5 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              New Build
            </Link>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
