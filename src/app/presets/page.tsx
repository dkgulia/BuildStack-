'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { PresetCard, Preset } from '@/components/presets/PresetCard';

const CATEGORY_TABS = [
  { id: '', label: 'All' },
  { id: 'gaming', label: 'Gaming' },
  { id: 'editing', label: 'Editing' },
  { id: 'creative', label: 'Creative' },
  { id: 'coding', label: 'Coding' },
  { id: 'office', label: 'Office' },
];

export default function PresetsPage() {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const [presets, setPresets] = useState<Preset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('');

  useEffect(() => {
    const fetchPresets = async () => {
      setIsLoading(true);
      try {
        const qs = activeCategory ? `?category=${activeCategory}` : '';
        const res = await fetch(`/api/presets${qs}`);
        const result = await res.json();
        if (result.success) {
          setPresets(result.data || []);
        }
      } catch {
        // Silently fail
      } finally {
        setIsLoading(false);
      }
    };

    fetchPresets();
  }, [activeCategory]);

  const handleUsePreset = (preset: Preset) => {
    router.push(`/builder?preset=${preset.slug}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-white/50 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">Back</span>
            </Link>
            <div className="h-4 w-px bg-white/10 hidden sm:block" />
            <Link href="/" className="font-semibold text-white">
              BuildStack
            </Link>
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
        {/* Title */}
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-white">PC Templates</h1>
          <p className="mt-2 text-sm text-white/50">
            Pre-configured builds optimized for your workflow. Pick one and customize it.
          </p>
        </motion.div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === tab.id
                  ? 'bg-white text-black'
                  : 'bg-white/10 text-white/60 hover:bg-white/15 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Presets Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-white/30 animate-spin" />
          </div>
        ) : presets.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/40">No templates found for this category.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {presets.map((preset, i) => (
              <motion.div
                key={preset.id}
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: prefersReducedMotion ? 0 : i * 0.05 }}
              >
                <PresetCard preset={preset} onUse={handleUsePreset} />
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
