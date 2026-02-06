'use client';

import { Suspense, useState, useCallback, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowLeft, Search, X, Sparkles, Wand2 } from 'lucide-react';
import { Part, Build, Category, CompatibilityIssue, CATEGORIES, getSocket, getRamType, getTdp, getPsuWattage } from '@/components/builder/types';
import { PartsTabs } from '@/components/builder/PartsTabs';
import { PartsList } from '@/components/builder/PartsList';
import { BuildSummaryPanel } from '@/components/builder/BuildSummaryPanel';
import { MobileBuildSheet } from '@/components/builder/MobileBuildSheet';
import { CompareDrawer } from '@/components/builder/CompareDrawer';
import { SpecFilters, ActiveFilters } from '@/components/builder/SpecFilters';
import { SortDropdown, SortOption } from '@/components/builder/SortDropdown';
import { PresetSheet } from '@/components/builder/PresetSheet';
import { AISuggestButton } from '@/components/builder/AISuggestButton';

const initialBuild: Build = {
  cpu: null,
  gpu: null,
  motherboard: null,
  ram: null,
  storage: null,
  psu: null,
  case: null,
  cooling: null,
  monitor: null,
};

// Map use-case query param to preset category
const USECASE_TO_CATEGORY: Record<string, string> = {
  gaming: 'gaming',
  editing: 'editing',
  coding: 'coding',
  office: 'office',
};

function BuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefersReducedMotion = useReducedMotion();
  const [build, setBuild] = useState<Build>(initialBuild);
  const [activeTab, setActiveTab] = useState<Category>('cpu');
  const [searchQuery, setSearchQuery] = useState('');
  const [compareList, setCompareList] = useState<string[]>([]);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [specFilters, setSpecFilters] = useState<ActiveFilters>({});
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [presetSheetOpen, setPresetSheetOpen] = useState(false);
  const [presetFilterCategory, setPresetFilterCategory] = useState<string | undefined>(undefined);

  // Handle usecase/preset/wizard query params on mount
  useEffect(() => {
    const usecase = searchParams.get('usecase');
    const presetSlug = searchParams.get('preset');
    const fromWizard = searchParams.get('fromWizard');

    if (fromWizard === 'true') {
      try {
        const stored = localStorage.getItem('wizard_build');
        if (stored) {
          const wizardBuild = JSON.parse(stored) as Partial<Build>;
          setBuild((prev) => ({ ...prev, ...wizardBuild }));
          localStorage.removeItem('wizard_build');
        }
      } catch {}
      return;
    }

    if (presetSlug) {
      // Load a specific preset by slug
      fetch(`/api/presets/${presetSlug}`)
        .then((res) => res.json())
        .then((result) => {
          if (result.success && result.data?.resolved_components) {
            const resolved = result.data.resolved_components;
            const newBuild: Partial<Build> = {};
            const componentTypes: Category[] = ['cpu', 'gpu', 'motherboard', 'ram', 'storage', 'psu', 'case', 'cooling'];
            for (const type of componentTypes) {
              const comp = resolved[type];
              if (comp && 'id' in comp) {
                newBuild[type] = comp as Part;
              }
            }
            setBuild((prev) => ({ ...prev, ...newBuild }));
          }
        })
        .catch(() => {});
    } else if (usecase) {
      // Open preset sheet filtered to this use case
      const category = USECASE_TO_CATEGORY[usecase];
      if (category) {
        setPresetFilterCategory(category);
        setPresetSheetOpen(true);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apply preset to build
  const handleApplyPreset = useCallback((presetBuild: Partial<Build>) => {
    setBuild((prev) => ({ ...prev, ...presetBuild }));
  }, []);

  // Data fetching state
  const [partsCache, setPartsCache] = useState<Record<Category, Part[]>>({
    cpu: [],
    gpu: [],
    motherboard: [],
    ram: [],
    storage: [],
    psu: [],
    case: [],
    cooling: [],
    monitor: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Build a cache key from filters + sort so we refetch when they change
  const filterKey = JSON.stringify({ ...specFilters, sort_by: sortBy });

  // Reset filters when category changes
  useEffect(() => {
    setSpecFilters({});
    setSortBy('default');
  }, [activeTab]);

  // Fetch parts for current category with filters
  useEffect(() => {
    const fetchParts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        // Add spec filters
        for (const [key, value] of Object.entries(specFilters)) {
          if (value) params.set(key, value);
        }
        // Add sort
        if (sortBy !== 'default') params.set('sort_by', sortBy);

        const qs = params.toString();
        const url = `/api/components/${activeTab}${qs ? `?${qs}` : ''}`;
        const response = await fetch(url);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch components');
        }

        setPartsCache((prev) => ({
          ...prev,
          [activeTab]: result.data || [],
        }));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch components');
      } finally {
        setIsLoading(false);
      }
    };

    fetchParts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, filterKey]);

  // Get parts for current category
  const categoryParts = partsCache[activeTab];

  // Calculate estimated wattage
  const estimatedWattage = useMemo(() => {
    let wattage = 50; // Base system power
    wattage += getTdp(build.cpu);
    wattage += getTdp(build.gpu);
    if (build.ram) wattage += 10;
    if (build.storage) wattage += 10;
    if (build.cooling) wattage += 15;
    return wattage;
  }, [build]);

  // Compatibility checking
  const compatibilityIssues = useMemo<CompatibilityIssue[]>(() => {
    const issues: CompatibilityIssue[] = [];

    // CPU ↔ Motherboard socket check
    if (build.cpu && build.motherboard) {
      const cpuSocket = getSocket(build.cpu);
      const mbSocket = getSocket(build.motherboard);
      if (cpuSocket && mbSocket && cpuSocket !== mbSocket) {
        issues.push({
          type: 'error',
          message: `CPU socket (${cpuSocket}) doesn't match motherboard (${mbSocket})`,
          categories: ['cpu', 'motherboard'],
        });
      }
    }

    // RAM ↔ Motherboard type check
    if (build.ram && build.motherboard) {
      const ramType = getRamType(build.ram);
      const mbRamType = getRamType(build.motherboard);
      if (ramType && mbRamType && ramType !== mbRamType) {
        issues.push({
          type: 'error',
          message: `${ramType} RAM not compatible with motherboard (requires ${mbRamType})`,
          categories: ['ram', 'motherboard'],
        });
      }
    }

    // PSU wattage check
    if (build.psu) {
      const psuWattage = getPsuWattage(build.psu);
      const recommendedWattage = estimatedWattage * 1.2;
      if (psuWattage && psuWattage < recommendedWattage) {
        issues.push({
          type: 'warning',
          message: `PSU (${psuWattage}W) may be insufficient. Recommended: ${Math.ceil(recommendedWattage)}W`,
          categories: ['psu'],
        });
      }
    }

    return issues;
  }, [build, estimatedWattage]);

  // Select part and auto-advance
  const handleSelectPart = useCallback((part: Part) => {
    setBuild((prev) => ({ ...prev, [part.type]: part }));

    // Auto-advance to next category
    const currentIndex = CATEGORIES.findIndex((c) => c.id === part.type);
    if (currentIndex < CATEGORIES.length - 1) {
      setTimeout(() => {
        setActiveTab(CATEGORIES[currentIndex + 1].id);
      }, 300);
    }

    // Clear search when selecting
    setSearchQuery('');
  }, []);

  // Remove part from build
  const handleRemovePart = useCallback((category: Category) => {
    setBuild((prev) => ({ ...prev, [category]: null }));
  }, []);

  // Review build - save to localStorage and navigate
  const handleReview = useCallback(() => {
    const buildData = {
      name: 'My PC Build',
      parts: build,
      currency: 'INR' as const,
    };
    localStorage.setItem('currentBuild', JSON.stringify(buildData));
    router.push('/builder/review');
  }, [build, router]);

  // Share build - save to API and navigate to share page
  const handleShare = useCallback(async () => {
    setIsSaving(true);
    try {
      const buildData = {
        name: 'My PC Build',
        parts: build,
        currency: 'INR' as const,
      };

      const response = await fetch('/api/build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildData),
      });

      const result = await response.json();

      if (result.success && result.id) {
        router.push(`/build/${result.id}`);
      }
    } catch (error) {
      console.error('Failed to save build:', error);
    } finally {
      setIsSaving(false);
    }
  }, [build, router]);

  // Compare list management
  const handleCompareToggle = useCallback((partId: string) => {
    setCompareList((prev) => {
      if (prev.includes(partId)) {
        return prev.filter((id) => id !== partId);
      }
      if (prev.length >= 3) return prev;
      return [...prev, partId];
    });
  }, []);

  const handleCompareClear = useCallback(() => {
    setCompareList([]);
  }, []);

  const handleCompareSelect = useCallback((part: Part) => {
    handleSelectPart(part);
    setCompareList([]);
  }, [handleSelectPart]);

  // Get compare parts from all cached parts
  const compareParts = useMemo(() => {
    const allParts = Object.values(partsCache).flat();
    return compareList.map((id) => allParts.find((p) => p.id === id)).filter(Boolean) as Part[];
  }, [compareList, partsCache]);

  // Selected parts count
  const selectedCount = Object.values(build).filter(Boolean).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
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

          <div className="flex items-center gap-2">
            <Link
              href="/builder/wizard"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 text-white/70 hover:bg-white/15 transition-colors"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Guided Setup</span>
            </Link>
            <button
              onClick={() => {
                setPresetFilterCategory(undefined);
                setPresetSheetOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 text-white/70 hover:bg-white/15 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Templates
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full">
        <div className="flex flex-col lg:flex-row">
          {/* Left Column - Parts Selection (60-65%) */}
          <div className="flex-1 lg:w-[62%] px-4 sm:px-6 py-6 lg:border-r lg:border-white/10">
            {/* Category Tabs */}
            <div className="mb-6">
              <PartsTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
                build={build}
              />
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="text"
                  placeholder={`Search ${CATEGORIES.find((c) => c.id === activeTab)?.label || 'parts'}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-white/10 rounded transition-colors"
                  >
                    <X className="w-4 h-4 text-white/50" />
                  </button>
                )}
              </div>
            </div>

            {/* Spec Filters */}
            <div className="mb-4">
              <SpecFilters
                category={activeTab}
                filters={specFilters}
                onFiltersChange={setSpecFilters}
              />
            </div>

            {/* Category Title + Sort */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-white">
                {CATEGORIES.find((c) => c.id === activeTab)?.label}
              </h2>
              <div className="flex items-center gap-3">
                <AISuggestButton
                  build={build}
                  targetCategory={activeTab}
                  onSelect={handleSelectPart}
                />
                <SortDropdown value={sortBy} onChange={setSortBy} />
                <span className="text-sm text-white/50">
                  {isLoading ? 'Loading...' : `${categoryParts.length} options`}
                </span>
              </div>
            </div>

            {/* Error State */}
            {error && (
              <div className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Parts List */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? {} : { opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <PartsList
                  parts={categoryParts}
                  category={activeTab}
                  build={build}
                  onSelect={handleSelectPart}
                  searchQuery={searchQuery}
                  compareList={compareList}
                  onCompareToggle={handleCompareToggle}
                  issues={compatibilityIssues}
                  isLoading={isLoading}
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Column - Build Summary (35-40%) - Desktop Only */}
          <div className="hidden lg:block lg:w-[38%] px-6 py-6">
            <BuildSummaryPanel
              build={build}
              estimatedWattage={estimatedWattage}
              issues={compatibilityIssues}
              onCategoryClick={setActiveTab}
              onRemove={handleRemovePart}
              onReview={handleReview}
              onShare={handleShare}
            />
          </div>
        </div>
      </main>

      {/* Mobile Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0a0a0a] border-t border-white/10 px-4 py-3 safe-area-inset-bottom">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-white/50">{selectedCount}/8 parts selected</div>
          </div>
          <button
            onClick={() => setMobileSheetOpen(true)}
            className="px-6 py-2.5 bg-white text-black font-medium rounded-lg hover:bg-white/90 transition-colors"
          >
            View Build
          </button>
        </div>
      </div>

      {/* Mobile Build Sheet */}
      <MobileBuildSheet
        isOpen={mobileSheetOpen}
        onClose={() => setMobileSheetOpen(false)}
        build={build}
        estimatedWattage={estimatedWattage}
        issues={compatibilityIssues}
        onCategoryClick={setActiveTab}
        onRemove={handleRemovePart}
        onReview={handleReview}
        onShare={handleShare}
      />

      {/* Compare Drawer */}
      <AnimatePresence>
        {compareParts.length > 0 && (
          <CompareDrawer
            parts={compareParts}
            activeCategory={activeTab}
            onRemove={(partId) => handleCompareToggle(partId)}
            onClear={handleCompareClear}
            onSelect={handleCompareSelect}
          />
        )}
      </AnimatePresence>

      {/* Preset Sheet */}
      <PresetSheet
        isOpen={presetSheetOpen}
        onClose={() => setPresetSheetOpen(false)}
        filterCategory={presetFilterCategory}
        onApply={handleApplyPreset}
      />

      {/* Bottom padding for mobile to account for fixed bar */}
      <div className="lg:hidden h-20" />
    </div>
  );
}

export default function BuilderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    }>
      <BuilderContent />
    </Suspense>
  );
}
