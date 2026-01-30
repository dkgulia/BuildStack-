'use client';

import { useState } from 'react';
import {
  Cpu,
  Monitor,
  CircuitBoard,
  MemoryStick,
  HardDrive,
  Zap,
  Box,
  Fan,
  X,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Share2,
  Copy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBuilder } from '@/hooks/use-builder';
import type { ComponentType } from '@/types/components';
import { cn } from '@/lib/utils';

const COMPONENT_CONFIG: Record<
  ComponentType,
  { label: string; icon: React.ElementType }
> = {
  cpu: { label: 'CPU', icon: Cpu },
  gpu: { label: 'GPU', icon: Monitor },
  motherboard: { label: 'Motherboard', icon: CircuitBoard },
  ram: { label: 'RAM', icon: MemoryStick },
  storage: { label: 'Storage', icon: HardDrive },
  psu: { label: 'PSU', icon: Zap },
  case: { label: 'Case', icon: Box },
  cooling: { label: 'Cooling', icon: Fan },
};

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function BuildSummary() {
  const {
    build,
    getTotalPrice,
    getSelectedCount,
    checkCompatibility,
    removeComponent,
    clearBuild,
    setActiveCategory,
  } = useBuilder();

  const [copied, setCopied] = useState(false);

  const totalPrice = getTotalPrice();
  const selectedCount = getSelectedCount();
  const compatibility = checkCompatibility();

  const handleShare = async () => {
    const buildIds = Object.entries(build)
      .filter(([, comp]) => comp !== null)
      .map(([type, comp]) => `${type}=${comp?.id}`)
      .join('&');

    const url = `${window.location.origin}/builder?${buildIds}`;

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="border rounded-lg bg-card h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Your Build</h2>
          <span className="text-sm text-muted-foreground">
            {selectedCount}/8
          </span>
        </div>
      </div>

      {/* Components List */}
      <div className="flex-1 overflow-auto p-2 space-y-1">
        {(Object.keys(COMPONENT_CONFIG) as ComponentType[]).map((type) => {
          const component = build[type];
          const config = COMPONENT_CONFIG[type];
          const Icon = config.icon;
          const hasError = compatibility.issues.some(
            (i) => i.severity === 'error' && i.components.includes(type)
          );
          const hasWarning = compatibility.issues.some(
            (i) => i.severity === 'warning' && i.components.includes(type)
          );

          return (
            <div
              key={type}
              onClick={() => setActiveCategory(type)}
              className={cn(
                'group flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors',
                'hover:bg-muted/50',
                hasError && 'bg-destructive/10',
                hasWarning && !hasError && 'bg-yellow-500/10'
              )}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded flex items-center justify-center',
                  component ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                )}
              >
                <Icon className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-xs text-muted-foreground">{config.label}</div>
                {component ? (
                  <div className="text-sm font-medium truncate">{component.brand}</div>
                ) : (
                  <div className="text-sm text-muted-foreground">Not selected</div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {hasError && <AlertCircle className="w-4 h-4 text-destructive" />}
                {hasWarning && !hasError && (
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                )}
                {component && (
                  <>
                    <span className="text-sm font-medium">
                      {formatPrice(component.price)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeComponent(type);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-muted rounded transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Compatibility Status */}
      {compatibility.issues.length > 0 && (
        <div className="px-4 pb-2">
          <div
            className={cn(
              'p-3 rounded-md text-sm',
              compatibility.compatible
                ? 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400'
                : 'bg-destructive/10 text-destructive'
            )}
          >
            <div className="flex items-center gap-2 font-medium">
              {compatibility.compatible ? (
                <>
                  <AlertTriangle className="w-4 h-4" />
                  {compatibility.issues.length} warning(s)
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4" />
                  Compatibility issues
                </>
              )}
            </div>
            <div className="mt-1 text-xs opacity-80">
              {compatibility.issues[0]?.message}
            </div>
          </div>
        </div>
      )}

      {compatibility.issues.length === 0 && selectedCount > 1 && (
        <div className="px-4 pb-2">
          <div className="p-3 rounded-md bg-green-500/10 text-green-700 dark:text-green-400 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            All compatible
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="p-4 border-t">
        <div className="flex items-center justify-between mb-3">
          <span className="text-muted-foreground">Total</span>
          <span className="text-xl font-bold">{formatPrice(totalPrice)}</span>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={clearBuild}
            disabled={selectedCount === 0}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Clear
          </Button>
          <Button
            size="sm"
            className="flex-1"
            onClick={handleShare}
            disabled={selectedCount === 0}
          >
            {copied ? (
              <>
                <Copy className="w-4 h-4 mr-1" />
                Copied!
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 mr-1" />
                Share
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
