'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, Loader2, GitCompareArrows } from 'lucide-react';
import { CompareTable } from '@/components/compare/CompareTable';

interface ComparePart {
  id: string;
  type: string;
  brand: string;
  name: string;
  specs: Record<string, unknown>;
}

const TYPE_LABELS: Record<string, string> = {
  cpu: 'CPUs',
  gpu: 'GPUs',
  motherboard: 'Motherboards',
  ram: 'RAM',
  storage: 'Storage',
  psu: 'PSUs',
  case: 'Cases',
  cooling: 'Coolers',
  monitor: 'Monitors',
  laptop: 'Laptops',
};

function CompareContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const [parts, setParts] = useState<ComparePart[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const ids = searchParams.get('ids') || '';
  const type = searchParams.get('type') || 'cpu';

  useEffect(() => {
    if (!ids) {
      setError('No parts selected for comparison');
      setIsLoading(false);
      return;
    }

    const fetchParts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const url = type === 'laptop'
          ? `/api/laptops/compare?ids=${ids}`
          : `/api/components/${type}?ids=${ids}`;

        const res = await fetch(url);
        const result = await res.json();

        if (result.success && result.data) {
          setParts(result.data);
        } else {
          setError(result.error || 'Failed to fetch parts');
        }
      } catch {
        setError('Failed to load comparison');
      } finally {
        setIsLoading(false);
      }
    };

    fetchParts();
  }, [ids, type]);

  const handleSelect = (part: ComparePart) => {
    localStorage.setItem('compareSelection', JSON.stringify({ type: part.type, part }));
    router.push('/builder');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a]">
      <header className="border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-white/50 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">Back</span>
            </button>
            <div className="h-4 w-px bg-white/10 hidden sm:block" />
            <Link href="/" className="font-semibold text-white">BuildStack</Link>
          </div>
          <Link
            href="/builder"
            className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/90 transition-colors"
          >
            Open Builder
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
              <GitCompareArrows className="w-5 h-5 text-white/50" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                Compare {TYPE_LABELS[type] || 'Parts'}
              </h1>
              <p className="mt-0.5 text-sm text-white/50">
                Side-by-side spec comparison — differences highlighted in amber.
              </p>
            </div>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-white/30 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-white/40">{error}</p>
            <Link
              href="/builder"
              className="inline-block mt-4 px-4 py-2 text-sm bg-white/10 text-white rounded-lg hover:bg-white/15 transition-colors"
            >
              Go to Builder
            </Link>
          </div>
        ) : parts.length < 2 ? (
          <div className="text-center py-20">
            <p className="text-white/40">Need at least 2 parts to compare.</p>
            <Link
              href="/builder"
              className="inline-block mt-4 px-4 py-2 text-sm bg-white/10 text-white rounded-lg hover:bg-white/15 transition-colors"
            >
              Go to Builder
            </Link>
          </div>
        ) : (
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden"
          >
            <CompareTable
              parts={parts}
              onSelect={type !== 'laptop' ? handleSelect : undefined}
            />
          </motion.div>
        )}
      </main>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <Loader2 className="w-6 h-6 text-white/30 animate-spin" />
      </div>
    }>
      <CompareContent />
    </Suspense>
  );
}
