'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Cpu, Monitor, CircuitBoard, MemoryStick, HardDrive, Zap, Box, Fan } from 'lucide-react';

interface PresetComponent {
  component_id: string | null;
  display_text: string;
}

export interface Preset {
  id: string;
  name: string;
  slug: string;
  category: string;
  subcategory: string | null;
  platform: string | null;
  image_url: string | null;
  components: Record<string, PresetComponent>;
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

const CATEGORY_COLORS: Record<string, string> = {
  gaming: 'bg-red-500/10 text-red-400',
  editing: 'bg-blue-500/10 text-blue-400',
  creative: 'bg-purple-500/10 text-purple-400',
  coding: 'bg-green-500/10 text-green-400',
  office: 'bg-yellow-500/10 text-yellow-400',
};

interface PresetCardProps {
  preset: Preset;
  onUse: (preset: Preset) => void;
}

export function PresetCard({ preset, onUse }: PresetCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const componentCount = Object.keys(preset.components).length;
  const categoryColor = CATEGORY_COLORS[preset.category] || 'bg-white/10 text-white/70';

  return (
    <motion.div
      whileHover={prefersReducedMotion ? {} : { y: -4, transition: { duration: 0.2 } }}
      className="flex flex-col p-5 rounded-xl border border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04] transition-colors"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-white">{preset.name}</h3>
          {preset.subcategory && preset.subcategory !== preset.category && (
            <p className="text-xs text-white/40 mt-0.5">{preset.subcategory}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {preset.platform && (
            <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-white/10 text-white/60 uppercase tracking-wide">
              {preset.platform}
            </span>
          )}
          <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full uppercase tracking-wide ${categoryColor}`}>
            {preset.category}
          </span>
        </div>
      </div>

      <div className="flex-1 space-y-1.5 mb-4">
        {Object.entries(preset.components).slice(0, 4).map(([type, comp]) => {
          const Icon = COMPONENT_ICONS[type] || Box;
          return (
            <div key={type} className="flex items-center gap-2">
              <Icon className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />
              <span className="text-xs text-white/60 truncate">{comp.display_text}</span>
            </div>
          );
        })}
        {componentCount > 4 && (
          <p className="text-xs text-white/30 pl-5.5">+{componentCount - 4} more</p>
        )}
      </div>

      <button
        onClick={() => onUse(preset)}
        className="w-full py-2 text-sm font-medium rounded-lg bg-white text-black hover:bg-white/90 transition-colors"
      >
        Use This Build
      </button>
    </motion.div>
  );
}
