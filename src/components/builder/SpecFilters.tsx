'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, X, Filter } from 'lucide-react';
import { Category } from './types';

export interface FilterValues {
  brands: string[];
  [key: string]: (string | number)[];
}

export interface ActiveFilters {
  brand?: string;
  [key: string]: string | undefined;
}

interface SpecFiltersProps {
  category: Category;
  filters: ActiveFilters;
  onFiltersChange: (filters: ActiveFilters) => void;
}

// Display labels for filter keys
const FILTER_LABELS: Record<string, string> = {
  brand: 'Brand',
  socket: 'Socket',
  ram_type: 'RAM Type',
  cores: 'Cores',
  form_factor: 'Form Factor',
  chipset: 'Chipset',
  vram: 'VRAM',
  vram_type: 'VRAM Type',
  type: 'Type',
  capacity_gb: 'Capacity',
  speed_mhz: 'Speed',
  wattage: 'Wattage',
  efficiency: 'Efficiency',
  modular: 'Modular',
  case_type: 'Case Type',
  panel_type: 'Panel Type',
};

// Which filters to show per category (in display order)
const CATEGORY_FILTERS: Record<Category, string[]> = {
  cpu: ['brand', 'socket', 'ram_type', 'cores'],
  gpu: ['brand', 'vram', 'vram_type'],
  motherboard: ['brand', 'socket', 'form_factor', 'ram_type', 'chipset'],
  ram: ['brand', 'type', 'capacity_gb', 'speed_mhz'],
  storage: ['brand', 'type', 'capacity_gb'],
  psu: ['brand', 'wattage', 'efficiency', 'modular'],
  case: ['brand', 'case_type'],
  cooling: ['brand', 'type'],
  monitor: ['brand', 'panel_type'],
};

function formatFilterValue(key: string, value: string | number): string {
  if (key === 'capacity_gb') {
    const num = Number(value);
    return num >= 1000 ? `${num / 1000}TB` : `${num}GB`;
  }
  if (key === 'vram') return `${value}GB`;
  if (key === 'speed_mhz') return `${value} MHz`;
  if (key === 'wattage') return `${value}W`;
  if (key === 'cores') return `${value} Cores`;
  return String(value);
}

export function SpecFilters({ category, filters, onFiltersChange }: SpecFiltersProps) {
  const [availableFilters, setAvailableFilters] = useState<FilterValues | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedFilter, setExpandedFilter] = useState<string | null>(null);

  // Fetch available filter values when category changes
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    fetch(`/api/components/${category}/filters`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data.success) {
          setAvailableFilters(data.filters);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [category]);

  const handleFilterSelect = useCallback((key: string, value: string) => {
    const newFilters = { ...filters };
    if (newFilters[key] === value) {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }
    onFiltersChange(newFilters);
    setExpandedFilter(null);
  }, [filters, onFiltersChange]);

  const handleClearAll = useCallback(() => {
    onFiltersChange({});
  }, [onFiltersChange]);

  const activeFilterCount = Object.keys(filters).length;
  const filterKeys = CATEGORY_FILTERS[category] || ['brand'];

  if (isLoading || !availableFilters) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Filter chips row */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 text-white/50">
          <Filter className="w-3.5 h-3.5" />
          <span className="text-xs font-medium uppercase tracking-wide">Filter</span>
        </div>

        {filterKeys.map((key) => {
          const values = key === 'brand' ? availableFilters.brands : availableFilters[key];
          if (!values || values.length <= 1) return null;

          const isActive = !!filters[key];
          const isExpanded = expandedFilter === key;

          return (
            <div key={key} className="relative">
              <button
                onClick={() => setExpandedFilter(isExpanded ? null : key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-white text-black'
                    : 'bg-white/10 text-white/70 hover:bg-white/15'
                }`}
              >
                {isActive
                  ? formatFilterValue(key, filters[key]!)
                  : FILTER_LABELS[key] || key}
                <ChevronDown
                  className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Dropdown */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-1 z-50 min-w-[160px] max-h-[240px] overflow-y-auto rounded-xl bg-[#1a1a1a] border border-white/10 shadow-xl py-1"
                  >
                    {values.map((val) => {
                      const strVal = String(val);
                      const isSelected = filters[key] === strVal;
                      return (
                        <button
                          key={strVal}
                          onClick={() => handleFilterSelect(key, strVal)}
                          className={`w-full px-3 py-2 text-left text-xs transition-colors ${
                            isSelected
                              ? 'bg-white/10 text-white'
                              : 'text-white/70 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          {formatFilterValue(key, val)}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {/* Clear all */}
        {activeFilterCount > 0 && (
          <button
            onClick={handleClearAll}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>

      {/* Close dropdown on outside click */}
      {expandedFilter && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setExpandedFilter(null)}
        />
      )}
    </div>
  );
}
