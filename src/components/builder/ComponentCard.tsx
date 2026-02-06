'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Check, ImageOff } from 'lucide-react';
import type { PCComponent, ComponentType } from '@/types/components';
import { cn } from '@/lib/utils';

interface ComponentCardProps {
  component: PCComponent;
  isSelected: boolean;
  onSelect: () => void;
}

function getSpecsDisplay(component: PCComponent): string[] {
  const specs = component.specs as Record<string, unknown>;
  const type = component.type as ComponentType;

  switch (type) {
    case 'cpu':
      return [
        `${specs.cores}C/${specs.threads}T`,
        specs.boost_clock ? `${specs.boost_clock} GHz` : '',
        specs.tdp ? `${specs.tdp}W` : '',
        specs.socket as string,
      ].filter(Boolean);
    case 'gpu':
      return [
        specs.vram ? `${specs.vram}GB` : '',
        specs.tdp ? `${specs.tdp}W` : '',
        specs.length_mm ? `${specs.length_mm}mm` : '',
      ].filter(Boolean);
    case 'motherboard':
      return [
        specs.socket as string,
        specs.chipset as string,
        specs.form_factor as string,
      ].filter(Boolean);
    case 'ram':
      return [
        `${specs.capacity_gb}GB`,
        `${specs.speed_mhz} MHz`,
        specs.type as string,
      ].filter(Boolean);
    case 'storage': {
      const capacityGb = specs.capacity_gb as number;
      return [
        capacityGb >= 1000 ? `${capacityGb / 1000}TB` : `${capacityGb}GB`,
        specs.type as string,
      ].filter(Boolean);
    }
    case 'psu':
      return [
        `${specs.wattage}W`,
        specs.efficiency as string,
      ].filter(Boolean);
    case 'case':
      return [
        specs.case_type as string,
      ].filter(Boolean);
    case 'cooling':
      return [
        specs.type as string,
        specs.tdp_rating ? `${specs.tdp_rating}W` : '',
      ].filter(Boolean);
    default:
      return [];
  }
}

export function ComponentCard({
  component,
  isSelected,
  onSelect,
}: ComponentCardProps) {
  const specsDisplay = getSpecsDisplay(component);
  const [imgError, setImgError] = useState(false);

  return (
    <div
      onClick={onSelect}
      className={cn(
        'flex items-center gap-4 p-3 rounded-lg border cursor-pointer transition-colors',
        isSelected
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/50 hover:bg-muted/50'
      )}
    >
      {/* Image */}
      <div className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-muted">
        {component.image_url && !imgError ? (
          <Image
            src={component.image_url}
            alt={component.name}
            fill
            className="object-contain p-1"
            sizes="64px"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <ImageOff className="w-5 h-5" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="text-xs text-muted-foreground">{component.brand}</div>
        <div className="font-medium text-sm truncate">{component.name}</div>
        <div className="flex flex-wrap gap-1 mt-1">
          {specsDisplay.slice(0, 3).map((spec, i) => (
            <span
              key={i}
              className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded"
            >
              {spec}
            </span>
          ))}
        </div>
      </div>

      {/* Select */}
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <button
          className={cn(
            'flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors',
            isSelected
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground'
          )}
        >
          {isSelected ? (
            <>
              <Check className="w-3 h-3" />
              Selected
            </>
          ) : (
            'Select'
          )}
        </button>
      </div>
    </div>
  );
}
