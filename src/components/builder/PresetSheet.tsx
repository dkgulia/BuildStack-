'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Cpu, Monitor, CircuitBoard, MemoryStick, HardDrive, Zap, Box, Fan } from 'lucide-react';
import { Build, Part, Category } from './types';

interface PresetComponent {
  component_id: string | null;
  display_text: string;
}

interface Preset {
  id: string;
  name: string;
  slug: string;
  category: string;
  subcategory: string | null;
  platform: string | null;
  components: Record<string, PresetComponent>;
}

interface ResolvedPreset {
  resolved_components: Record<string, Part | { display_text: string }>;
}

interface PresetSheetProps {
  isOpen: boolean;
  onClose: () => void;
  filterCategory?: string;
  onApply: (build: Partial<Build>) => void;
}

const COMPONENT_ICONS: Record<string, React.ElementType> = {
  cpu: Cpu,
  gpu: Monitor,
  motherboard: CircuitBoard,
  ram: MemoryStick,
  storage: HardDrive,
  psu: Zap,
  case: Box,
  cooling: Fan,
};

const CATEGORY_TABS = [
  { id: '', label: 'All' },
  { id: 'gaming', label: 'Gaming' },
  { id: 'editing', label: 'Editing' },
  { id: 'creative', label: 'Creative' },
  { id: 'coding', label: 'Coding' },
  { id: 'office', label: 'Office' },
];

export function PresetSheet({ isOpen, onClose, filterCategory, onApply }: PresetSheetProps) {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState(filterCategory || '');
  const [applyingSlug, setApplyingSlug] = useState<string | null>(null);

  useEffect(() => {
    if (filterCategory !== undefined) {
      setActiveCategory(filterCategory);
    }
  }, [filterCategory]);

  useEffect(() => {
    if (!isOpen) return;

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
  }, [isOpen, activeCategory]);

  const handleApply = useCallback(async (preset: Preset) => {
    setApplyingSlug(preset.slug);
    try {
      const res = await fetch(`/api/presets/${preset.slug}`);
      const result = await res.json();
      if (!result.success) return;

      const resolved = result.data as ResolvedPreset;
      const build: Partial<Build> = {};

      const componentTypes: Category[] = ['cpu', 'gpu', 'motherboard', 'ram', 'storage', 'psu', 'case', 'cooling'];
      for (const type of componentTypes) {
        const comp = resolved.resolved_components[type];
        if (comp && 'id' in comp) {
          build[type] = comp as Part;
        }
      }

      onApply(build);
      onClose();
    } catch {
      // Silently fail
    } finally {
      setApplyingSlug(null);
    }
  }, [onApply, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-[#0a0a0a] border-l border-white/10 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <h2 className="text-lg font-semibold text-white">Start from a Template</h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-white/50" />
              </button>
            </div>

            {/* Category Tabs */}
            <div className="flex items-center gap-1.5 px-5 py-3 overflow-x-auto border-b border-white/10">
              {CATEGORY_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    activeCategory === tab.id
                      ? 'bg-white text-black'
                      : 'bg-white/10 text-white/60 hover:bg-white/15 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-5 h-5 text-white/30 animate-spin" />
                </div>
              ) : presets.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm text-white/40">No templates found</p>
                </div>
              ) : (
                presets.map((preset) => (
                  <div
                    key={preset.id}
                    className="p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:border-white/20 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-sm font-semibold text-white">{preset.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          {preset.platform && (
                            <span className="text-[10px] text-white/40 uppercase">{preset.platform}</span>
                          )}
                          {preset.subcategory && (
                            <span className="text-[10px] text-white/40">{preset.subcategory}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1 mb-3">
                      {Object.entries(preset.components).slice(0, 3).map(([type, comp]) => {
                        const Icon = COMPONENT_ICONS[type] || Box;
                        return (
                          <div key={type} className="flex items-center gap-2">
                            <Icon className="w-3 h-3 text-white/30 flex-shrink-0" />
                            <span className="text-xs text-white/50 truncate">{comp.display_text}</span>
                          </div>
                        );
                      })}
                      {Object.keys(preset.components).length > 3 && (
                        <p className="text-[10px] text-white/30 pl-5">
                          +{Object.keys(preset.components).length - 3} more parts
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => handleApply(preset)}
                      disabled={applyingSlug === preset.slug}
                      className="w-full py-1.5 text-xs font-medium rounded-lg bg-white text-black hover:bg-white/90 disabled:opacity-50 transition-colors"
                    >
                      {applyingSlug === preset.slug ? (
                        <Loader2 className="w-3 h-3 animate-spin mx-auto" />
                      ) : (
                        'Use Template'
                      )}
                    </button>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
