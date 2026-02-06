'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, X, Check } from 'lucide-react';
import { Part, Build, Category, getSpecsDisplay } from './types';

interface Suggestion {
  id: string;
  name: string;
  brand: string;
  reason: string;
  part: Part | null;
}

interface AISuggestButtonProps {
  build: Build;
  targetCategory: Category;
  onSelect: (part: Part) => void;
}

export function AISuggestButton({ build, targetCategory, onSelect }: AISuggestButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [error, setError] = useState<string | null>(null);

  const hasSelectedParts = Object.values(build).some(Boolean);

  const fetchSuggestions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setSuggestions([]);

    try {
      const res = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          build,
          target_category: targetCategory,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Failed to get suggestions');
      }

      setSuggestions(result.suggestions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  }, [build, targetCategory]);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    fetchSuggestions();
  }, [fetchSuggestions]);

  const handleSelect = useCallback(
    (suggestion: Suggestion) => {
      if (suggestion.part) {
        onSelect(suggestion.part);
        setIsOpen(false);
      }
    },
    [onSelect]
  );

  if (!hasSelectedParts) return null;

  return (
    <div className="relative">
      <button
        onClick={handleOpen}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-300 hover:from-purple-500/30 hover:to-blue-500/30 border border-purple-500/20 transition-all"
      >
        <Sparkles className="w-3.5 h-3.5" />
        AI Suggest
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full right-0 mt-2 z-50 w-[340px] rounded-xl bg-[#141414] border border-white/10 shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-medium text-white">AI Recommendations</span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded hover:bg-white/10 transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-white/40" />
                </button>
              </div>

              {/* Content */}
              <div className="px-4 py-3 max-h-[400px] overflow-y-auto">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-2">
                    <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                    <span className="text-xs text-white/40">Analyzing your build...</span>
                  </div>
                ) : error ? (
                  <div className="text-center py-6">
                    <p className="text-xs text-red-400">{error}</p>
                    <button
                      onClick={fetchSuggestions}
                      className="mt-2 text-xs text-white/50 hover:text-white underline"
                    >
                      Retry
                    </button>
                  </div>
                ) : suggestions.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-xs text-white/40">No suggestions found for this category.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {suggestions.map((suggestion, i) => {
                      const specs = suggestion.part
                        ? getSpecsDisplay(suggestion.part)
                        : [];

                      return (
                        <div
                          key={suggestion.id}
                          className="p-3 rounded-lg border border-white/5 bg-white/[0.02] hover:border-white/15 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold flex-shrink-0">
                                  {i + 1}
                                </span>
                                <p className="text-sm font-medium text-white truncate">
                                  {suggestion.brand} {suggestion.name}
                                </p>
                              </div>
                              {specs.length > 0 && (
                                <div className="flex items-center gap-1.5 mt-1.5 ml-7 flex-wrap">
                                  {specs.map((spec) => (
                                    <span
                                      key={spec}
                                      className="px-1.5 py-0.5 rounded text-[10px] bg-white/5 text-white/50"
                                    >
                                      {spec}
                                    </span>
                                  ))}
                                </div>
                              )}
                              <p className="text-[11px] text-white/40 mt-1.5 ml-7 line-clamp-2">
                                {suggestion.reason}
                              </p>
                            </div>
                            {suggestion.part && (
                              <button
                                onClick={() => handleSelect(suggestion)}
                                className="flex-shrink-0 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                                title="Select this part"
                              >
                                <Check className="w-3.5 h-3.5 text-white" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
