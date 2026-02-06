'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Monitor, ChevronDown, X, GitCompareArrows } from 'lucide-react';

interface MonitorPart {
  id: string;
  name: string;
  brand: string;
  price: number;
  image_url: string | null;
  specs: Record<string, unknown>;
}

const PANEL_TYPES = ['All', 'IPS', 'VA', 'TN', 'OLED'];

export default function MonitorsPage() {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const [monitors, setMonitors] = useState<MonitorPart[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [panelFilter, setPanelFilter] = useState('All');
  const [brandFilter, setBrandFilter] = useState('');
  const [brands, setBrands] = useState<string[]>([]);
  const [compareList, setCompareList] = useState<string[]>([]);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const res = await fetch('/api/components/monitor/filters');
        const result = await res.json();
        if (result.success && result.filters?.brands) {
          setBrands(result.filters.brands);
        }
      } catch {}
    };
    fetchFilters();
  }, []);

  useEffect(() => {
    const fetchMonitors = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (panelFilter !== 'All') params.set('panel_type', panelFilter);
        if (brandFilter) params.set('brand', brandFilter);
        const qs = params.toString();
        const res = await fetch(`/api/components/monitor${qs ? `?${qs}` : ''}`);
        const result = await res.json();
        if (result.success) {
          setMonitors(result.data || []);
        }
      } catch {} finally {
        setIsLoading(false);
      }
    };
    fetchMonitors();
  }, [panelFilter, brandFilter]);

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
            <Link href="/laptops" className="text-sm text-white/50 hover:text-white transition-colors">Laptops</Link>
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
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Monitors</h1>
          <p className="mt-2 text-sm text-white/50">
            Browse {isLoading ? '...' : monitors.length} monitors from top brands.
          </p>
        </motion.div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-8 flex-wrap">
          {/* Panel Type */}
          <div className="flex items-center gap-1.5">
            {PANEL_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setPanelFilter(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  panelFilter === type
                    ? 'bg-white text-black'
                    : 'bg-white/10 text-white/60 hover:bg-white/15'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Brand Filter */}
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

          {(panelFilter !== 'All' || brandFilter) && (
            <button
              onClick={() => { setPanelFilter('All'); setBrandFilter(''); }}
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
        ) : monitors.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/40">No monitors found with these filters.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {monitors.map((monitor, i) => (
              <motion.div
                key={monitor.id}
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: prefersReducedMotion ? 0 : Math.min(i * 0.03, 0.3) }}
                className="p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:border-white/20 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => {
                      setCompareList((prev) => {
                        if (prev.includes(monitor.id)) return prev.filter((id) => id !== monitor.id);
                        if (prev.length >= 3) return prev;
                        return [...prev, monitor.id];
                      });
                    }}
                    className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center mt-0.5 transition-colors ${
                      compareList.includes(monitor.id)
                        ? 'bg-white border-white'
                        : 'border-white/20 hover:border-white/40'
                    }`}
                  >
                    {compareList.includes(monitor.id) && (
                      <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                    <Monitor className="w-5 h-5 text-white/30" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-white truncate">{monitor.name}</h3>
                    <p className="text-xs text-white/40 mt-0.5">{monitor.brand}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                  {!!monitor.specs.screen_size && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-white/5 text-white/50">
                      {String(monitor.specs.screen_size)}&quot;
                    </span>
                  )}
                  {!!monitor.specs.resolution && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-white/5 text-white/50">
                      {String(monitor.specs.resolution)}
                    </span>
                  )}
                  {!!monitor.specs.refresh_rate && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-white/5 text-white/50">
                      {String(monitor.specs.refresh_rate)}Hz
                    </span>
                  )}
                  {!!monitor.specs.panel_type && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-white/5 text-white/50">
                      {String(monitor.specs.panel_type)}
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
              onClick={() => router.push(`/compare?ids=${compareList.join(',')}&type=monitor`)}
              className="flex items-center gap-2 px-5 py-3 bg-white text-black font-medium rounded-full shadow-lg hover:bg-white/90 transition-colors"
            >
              <GitCompareArrows className="w-4 h-4" />
              Compare {compareList.length} Monitors
            </button>
          </motion.div>
        )}
      </main>
    </div>
  );
}
