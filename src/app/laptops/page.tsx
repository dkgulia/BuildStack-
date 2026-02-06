'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Laptop, ChevronDown, X, GitCompareArrows } from 'lucide-react';

interface LaptopItem {
  id: string;
  name: string;
  brand: string;
  price: number | null;
  image_url: string | null;
  condition: string;
  specs: Record<string, unknown>;
}

export default function LaptopsPage() {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const [laptops, setLaptops] = useState<LaptopItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [brandFilter, setBrandFilter] = useState('');
  const [conditionFilter, setConditionFilter] = useState('');
  const [brands, setBrands] = useState<string[]>([]);
  const [conditions, setConditions] = useState<string[]>([]);
  const [compareList, setCompareList] = useState<string[]>([]);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const res = await fetch('/api/laptops/filters');
        const result = await res.json();
        if (result.success) {
          setBrands(result.filters?.brands || []);
          setConditions(result.filters?.conditions || []);
        }
      } catch {}
    };
    fetchFilters();
  }, []);

  useEffect(() => {
    const fetchLaptops = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (brandFilter) params.set('brand', brandFilter);
        if (conditionFilter) params.set('condition', conditionFilter);
        const qs = params.toString();
        const res = await fetch(`/api/laptops${qs ? `?${qs}` : ''}`);
        const result = await res.json();
        if (result.success) {
          setLaptops(result.data || []);
        }
      } catch {} finally {
        setIsLoading(false);
      }
    };
    fetchLaptops();
  }, [brandFilter, conditionFilter]);

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a]">
      <header className="border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">Back</span>
            </Link>
            <div className="h-4 w-px bg-white/10 hidden sm:block" />
            <Link href="/" className="font-semibold text-white">BuildStack</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/monitors" className="text-sm text-white/50 hover:text-white transition-colors">Monitors</Link>
            <Link href="/builder" className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/90 transition-colors">
              Open Builder
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Laptops</h1>
          <p className="mt-2 text-sm text-white/50">
            Browse {isLoading ? '...' : laptops.length} laptops — new and refurbished.
          </p>
        </motion.div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-8 flex-wrap">
          {/* Condition */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setConditionFilter('')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                !conditionFilter ? 'bg-white text-black' : 'bg-white/10 text-white/60 hover:bg-white/15'
              }`}
            >
              All
            </button>
            {conditions.map((c) => (
              <button
                key={c}
                onClick={() => setConditionFilter(c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  conditionFilter === c ? 'bg-white text-black' : 'bg-white/10 text-white/60 hover:bg-white/15'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Brand */}
          {brands.length > 0 && (
            <div className="relative">
              <select
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                className="appearance-none pl-3 pr-8 py-1.5 rounded-lg text-xs font-medium bg-white/10 text-white/70 border-none cursor-pointer focus:outline-none"
              >
                <option value="">All Brands</option>
                {brands.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-white/40 pointer-events-none" />
            </div>
          )}

          {(brandFilter || conditionFilter) && (
            <button
              onClick={() => { setBrandFilter(''); setConditionFilter(''); }}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs text-white/50 hover:text-white transition-colors"
            >
              <X className="w-3 h-3" /> Clear
            </button>
          )}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-white/30 animate-spin" />
          </div>
        ) : laptops.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/40">No laptops found with these filters.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {laptops.map((laptop, i) => (
              <motion.div
                key={laptop.id}
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: prefersReducedMotion ? 0 : Math.min(i * 0.03, 0.3) }}
                className="p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:border-white/20 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => {
                      setCompareList((prev) => {
                        if (prev.includes(laptop.id)) return prev.filter((id) => id !== laptop.id);
                        if (prev.length >= 3) return prev;
                        return [...prev, laptop.id];
                      });
                    }}
                    className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center mt-0.5 transition-colors ${
                      compareList.includes(laptop.id)
                        ? 'bg-white border-white'
                        : 'border-white/20 hover:border-white/40'
                    }`}
                  >
                    {compareList.includes(laptop.id) && (
                      <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                    <Laptop className="w-5 h-5 text-white/30" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-white truncate">{laptop.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-white/40">{laptop.brand}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                        laptop.condition === 'New'
                          ? 'bg-green-500/10 text-green-400'
                          : 'bg-yellow-500/10 text-yellow-400'
                      }`}>
                        {laptop.condition}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                  {!!laptop.specs.processor && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-white/5 text-white/50">
                      {String(laptop.specs.processor)}
                    </span>
                  )}
                  {!!laptop.specs.ram && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-white/5 text-white/50">
                      {String(laptop.specs.ram)}
                    </span>
                  )}
                  {!!laptop.specs.storage && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-white/5 text-white/50">
                      {String(laptop.specs.storage)}
                    </span>
                  )}
                  {!!laptop.specs.screen_size && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-white/5 text-white/50">
                      {String(laptop.specs.screen_size)}&quot;
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
        {/* Floating compare button */}
        {compareList.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40"
          >
            <button
              onClick={() => router.push(`/compare?ids=${compareList.join(',')}&type=laptop`)}
              className="flex items-center gap-2 px-5 py-3 bg-white text-black font-medium rounded-full shadow-lg hover:bg-white/90 transition-colors"
            >
              <GitCompareArrows className="w-4 h-4" />
              Compare {compareList.length} Laptops
            </button>
          </motion.div>
        )}
      </main>
    </div>
  );
}
