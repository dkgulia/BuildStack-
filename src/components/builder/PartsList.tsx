'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ImageOff, EyeOff, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { Part, Category, Build, CompatibilityIssue, getSpecsDisplay, getSocket, getRamType } from './types';

const ITEMS_PER_PAGE = 20;

interface PartsListProps {
  parts: Part[];
  category: Category;
  build: Build;
  onSelect: (part: Part) => void;
  searchQuery: string;
  compareList: string[];
  onCompareToggle: (partId: string) => void;
  issues: CompatibilityIssue[];
  isLoading?: boolean;
}

function formatINR(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

function PartImage({ src, alt }: { src: string | null; alt: string }) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-white/5">
        <ImageOff className="w-6 h-6 text-white/20" />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className="object-contain p-2"
      sizes="80px"
      onError={() => setError(true)}
    />
  );
}

export function PartsList({
  parts,
  category,
  build,
  onSelect,
  searchQuery,
  compareList,
  onCompareToggle,
  issues,
  isLoading = false,
}: PartsListProps) {
  const prefersReducedMotion = useReducedMotion();
  const selectedPart = build[category];
  const [hideIncompatible, setHideIncompatible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 when category or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [category, searchQuery, hideIncompatible]);

  // Check if a part is compatible with current build
  const checkCompatibility = (part: Part): { compatible: boolean; reason?: string } => {
    // CPU-Motherboard socket compatibility
    if (category === 'cpu') {
      const mb = build.motherboard;
      if (mb) {
        const cpuSocket = getSocket(part);
        const mbSocket = getSocket(mb);
        if (cpuSocket && mbSocket && cpuSocket !== mbSocket) {
          return { compatible: false, reason: `Requires ${mbSocket} socket` };
        }
      }
    }

    if (category === 'motherboard') {
      const cpu = build.cpu;
      if (cpu) {
        const mbSocket = getSocket(part);
        const cpuSocket = getSocket(cpu);
        if (mbSocket && cpuSocket && mbSocket !== cpuSocket) {
          return { compatible: false, reason: `Requires ${cpuSocket} socket` };
        }
      }
    }

    // RAM-Motherboard type compatibility
    if (category === 'ram') {
      const mb = build.motherboard;
      if (mb) {
        const ramType = getRamType(part);
        const mbRamType = getRamType(mb);
        if (ramType && mbRamType && ramType !== mbRamType) {
          return { compatible: false, reason: `Requires ${mbRamType}` };
        }
      }
    }

    if (category === 'motherboard') {
      const ram = build.ram;
      if (ram) {
        const mbRamType = getRamType(part);
        const ramType = getRamType(ram);
        if (mbRamType && ramType && mbRamType !== ramType) {
          return { compatible: false, reason: `Selected RAM is ${ramType}` };
        }
      }
    }

    return { compatible: true };
  };

  // Filter and sort parts
  const { compatibleParts, incompatibleParts } = useMemo(() => {
    // First filter by search
    const filtered = parts.filter((part) => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      const specs = getSpecsDisplay(part);
      return (
        part.name.toLowerCase().includes(query) ||
        part.brand.toLowerCase().includes(query) ||
        specs.some((s) => s.toLowerCase().includes(query))
      );
    });

    // Then separate compatible and incompatible
    const compatible: Array<{ part: Part; reason?: string }> = [];
    const incompatible: Array<{ part: Part; reason: string }> = [];

    filtered.forEach((part) => {
      const result = checkCompatibility(part);
      if (result.compatible) {
        compatible.push({ part });
      } else {
        incompatible.push({ part, reason: result.reason! });
      }
    });

    return { compatibleParts: compatible, incompatibleParts: incompatible };
  }, [parts, searchQuery, build, category]);

  const hasIncompatibleParts = incompatibleParts.length > 0;
  const hasActiveFilters = build.cpu || build.motherboard || build.ram;

  // Pagination logic
  const displayedParts = useMemo(() => {
    // Combine parts: compatible first, then incompatible (if not hidden)
    const allParts: Array<{ part: Part; isIncompatible: boolean; reason?: string }> = [
      ...compatibleParts.map(({ part }) => ({ part, isIncompatible: false })),
      ...(hideIncompatible ? [] : incompatibleParts.map(({ part, reason }) => ({ part, isIncompatible: true, reason }))),
    ];

    const totalItems = allParts.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedParts = allParts.slice(startIndex, endIndex);

    // Find where the separator should be (if incompatible parts start on this page)
    const compatibleCount = compatibleParts.length;
    let separatorIndex = -1;
    if (!hideIncompatible && incompatibleParts.length > 0) {
      // Check if separator falls within this page
      if (compatibleCount > startIndex && compatibleCount <= endIndex) {
        separatorIndex = compatibleCount - startIndex;
      }
    }

    return { paginatedParts, totalPages, totalItems, separatorIndex };
  }, [compatibleParts, incompatibleParts, hideIncompatible, currentPage]);

  const { paginatedParts, totalPages, totalItems, separatorIndex } = displayedParts;

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.03,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: prefersReducedMotion ? 0 : 10,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: prefersReducedMotion ? 0 : 0.2,
      },
    },
    exit: {
      opacity: 0,
      y: prefersReducedMotion ? 0 : -10,
      transition: {
        duration: prefersReducedMotion ? 0 : 0.15,
      },
    },
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="p-4 rounded-xl border border-white/10 bg-white/[0.02] animate-pulse"
          >
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-lg bg-white/10" />
              <div className="flex-1">
                <div className="h-3 w-20 bg-white/10 rounded mb-2" />
                <div className="h-4 w-48 bg-white/10 rounded mb-3" />
                <div className="flex gap-2">
                  <div className="h-5 w-16 bg-white/10 rounded" />
                  <div className="h-5 w-16 bg-white/10 rounded" />
                </div>
              </div>
              <div className="text-right">
                <div className="h-5 w-24 bg-white/10 rounded mb-2" />
                <div className="h-8 w-20 bg-white/10 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const renderPartCard = (
    part: Part,
    isIncompatible: boolean = false,
    incompatibilityReason?: string
  ) => {
    const isSelected = selectedPart?.id === part.id;
    const isComparing = compareList.includes(part.id);
    const specs = getSpecsDisplay(part);

    return (
      <motion.div
        key={part.id}
        variants={itemVariants}
        layout
        whileHover={
          prefersReducedMotion || isIncompatible
            ? {}
            : {
                y: -2,
                transition: { duration: 0.15 },
              }
        }
        className={`group relative p-4 rounded-xl border transition-all ${
          isIncompatible
            ? 'bg-white/[0.01] border-white/5 opacity-50'
            : isSelected
            ? 'bg-white/10 border-white/30 shadow-[0_0_20px_rgba(255,255,255,0.1)]'
            : 'bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.04] hover:shadow-[0_0_30px_rgba(255,255,255,0.05)]'
        }`}
      >
        {/* Selection glow effect */}
        {isSelected && !isIncompatible && (
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/5 via-white/10 to-white/5 pointer-events-none"
          />
        )}

        <div className="relative flex items-start gap-4">
          {/* Compare checkbox */}
          <div className="pt-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!isIncompatible) onCompareToggle(part.id);
              }}
              disabled={isIncompatible || (!isComparing && compareList.length >= 3)}
              className={`w-4 h-4 rounded border transition-all ${
                isComparing
                  ? 'bg-white border-white'
                  : 'border-white/30 hover:border-white/50'
              } ${
                isIncompatible || (!isComparing && compareList.length >= 3)
                  ? 'opacity-30 cursor-not-allowed'
                  : ''
              }`}
            >
              {isComparing && (
                <svg
                  className="w-4 h-4 text-black"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Part image */}
          <div className={`relative w-20 h-20 rounded-lg overflow-hidden bg-white/5 flex-shrink-0 ${isIncompatible ? 'grayscale' : ''}`}>
            <PartImage src={part.image_url} alt={part.name} />
          </div>

          {/* Part info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="text-xs text-white/50 uppercase tracking-wide">
                  {part.brand}
                </div>
                <div className={`font-medium mt-0.5 truncate ${isIncompatible ? 'text-white/50' : 'text-white'}`}>
                  {part.name}
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {specs.slice(0, 4).map((spec, i) => (
                    <span
                      key={i}
                      className={`px-2 py-0.5 text-xs rounded-md ${isIncompatible ? 'bg-white/5 text-white/40' : 'bg-white/10 text-white/70'}`}
                    >
                      {spec}
                    </span>
                  ))}
                  {isIncompatible && incompatibilityReason && (
                    <span className="px-2 py-0.5 text-xs rounded-md bg-red-500/10 text-red-400/70">
                      {incompatibilityReason}
                    </span>
                  )}
                </div>
              </div>

              {/* Price and action */}
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <div className={`text-lg font-semibold ${isIncompatible ? 'text-white/40' : 'text-white'}`}>
                  {formatINR(part.price)}
                </div>
                {isIncompatible ? (
                  <span className="px-4 py-1.5 text-sm font-medium rounded-lg bg-white/5 text-white/30">
                    Incompatible
                  </span>
                ) : (
                  <button
                    onClick={() => onSelect(part)}
                    className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
                      isSelected
                        ? 'bg-white text-black'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    {isSelected ? (
                      <span className="flex items-center gap-1.5">
                        Selected
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </span>
                    ) : (
                      'Select'
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Filter toggle - only show if there are incompatible parts and active filters */}
      {hasIncompatibleParts && hasActiveFilters && (
        <div className="flex items-center justify-between px-1">
          <span className="text-sm text-white/50">
            {compatibleParts.length} compatible • {incompatibleParts.length} incompatible
          </span>
          <button
            onClick={() => setHideIncompatible(!hideIncompatible)}
            className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
          >
            {hideIncompatible ? (
              <>
                <Eye className="w-4 h-4" />
                Show all
              </>
            ) : (
              <>
                <EyeOff className="w-4 h-4" />
                Hide incompatible
              </>
            )}
          </button>
        </div>
      )}

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-2"
      >
        <AnimatePresence mode="popLayout">
          {totalItems === 0 ? (
            <motion.div
              key="empty"
              variants={itemVariants}
              className="text-center py-12 text-white/50"
            >
              No parts found
            </motion.div>
          ) : (
            <>
              {paginatedParts.map(({ part, isIncompatible, reason }, index) => (
                <div key={part.id}>
                  {/* Separator when incompatible parts start */}
                  {separatorIndex === index && (
                    <div className="flex items-center gap-3 py-3">
                      <div className="flex-1 h-px bg-white/10" />
                      <span className="text-xs text-white/30 uppercase tracking-wider">
                        Incompatible with your build
                      </span>
                      <div className="flex-1 h-px bg-white/10" />
                    </div>
                  )}
                  {renderPartCard(part, isIncompatible, reason)}
                </div>
              ))}
            </>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <span className="text-sm text-white/50">
            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} of {totalItems}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg transition-colors ${
                currentPage === 1
                  ? 'text-white/20 cursor-not-allowed'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // Show first, last, current, and neighbors
                const showPage =
                  page === 1 ||
                  page === totalPages ||
                  Math.abs(page - currentPage) <= 1;
                const showEllipsis =
                  (page === 2 && currentPage > 3) ||
                  (page === totalPages - 1 && currentPage < totalPages - 2);

                if (!showPage && !showEllipsis) return null;
                if (showEllipsis) {
                  return (
                    <span key={page} className="px-2 text-white/30">
                      ...
                    </span>
                  );
                }

                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                      page === currentPage
                        ? 'bg-white text-black'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg transition-colors ${
                currentPage === totalPages
                  ? 'text-white/20 cursor-not-allowed'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
