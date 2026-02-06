'use client';

import { motion } from 'framer-motion';
import { X, Check, Cpu, Monitor, CircuitBoard, MemoryStick, HardDrive, Zap, Box, Fan } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

interface CompatiblePart {
  id: string;
  name: string;
  brand: string;
  price: number;
  category: string;
  specs: Record<string, unknown>;
  image_url?: string;
}

interface CompatiblePartsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  issueTitle: string;
  parts: CompatiblePart[];
  onSelectPart: (part: CompatiblePart) => void;
}

const categoryIcons: Record<string, React.ElementType> = {
  cpu: Cpu,
  gpu: Monitor,
  motherboard: CircuitBoard,
  ram: MemoryStick,
  storage: HardDrive,
  psu: Zap,
  case: Box,
  cooling: Fan,
};

const categoryLabels: Record<string, string> = {
  cpu: 'Processor',
  gpu: 'Graphics Card',
  motherboard: 'Motherboard',
  ram: 'Memory',
  storage: 'Storage',
  psu: 'Power Supply',
  case: 'Case',
  cooling: 'Cooling',
};

function getSpecsDisplay(category: string, specs: Record<string, unknown>): string {
  switch (category) {
    case 'cpu':
      return `${specs.cores || '?'} cores • ${specs.socket || 'Unknown socket'}`;
    case 'gpu':
      return `${specs.vram || '?'}GB VRAM • ${specs.tdp || '?'}W TDP`;
    case 'motherboard':
      return `${specs.socket || 'Unknown'} • ${specs.ram_type || 'DDR?'}`;
    case 'ram':
      return `${specs.capacity_gb || '?'}GB • ${specs.type || 'DDR?'} ${specs.speed_mhz || '?'}MHz`;
    case 'storage':
      return `${specs.capacity_gb || '?'}GB • ${specs.type || 'Unknown'}`;
    case 'psu':
      return `${specs.wattage || '?'}W • ${specs.efficiency || '80+'}`;
    case 'case':
      return `Max GPU: ${specs.max_gpu_length || specs.max_gpu_length_mm || '?'}mm`;
    case 'cooling':
      return `${specs.type || 'Unknown'} • TDP: ${specs.tdp_rating || specs.tdp_rating_watts || '?'}W`;
    default:
      return '';
  }
}

export function CompatiblePartsSheet({
  isOpen,
  onClose,
  issueTitle,
  parts,
  onSelectPart,
}: CompatiblePartsSheetProps) {
  const category = parts[0]?.category || '';
  const Icon = categoryIcons[category] || Cpu;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-md bg-[#0a0a0a] border-white/10 overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-white flex items-center gap-2">
            <Icon className="w-5 h-5 text-green-400" />
            Compatible {categoryLabels[category] || 'Parts'}
          </SheetTitle>
          <SheetDescription className="text-white/50">
            Select a compatible part to resolve: {issueTitle}
          </SheetDescription>
        </SheetHeader>

        {parts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-white/50">No compatible parts found in inventory.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {parts.map((part, index) => (
              <motion.button
                key={part.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  onSelectPart(part);
                  onClose();
                }}
                className="w-full p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-green-500/30 transition-all text-left group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                    {part.image_url ? (
                      <img
                        src={part.image_url}
                        alt={part.name}
                        className="w-10 h-10 object-contain"
                      />
                    ) : (
                      <Icon className="w-6 h-6 text-white/30" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs text-white/50">{part.brand}</p>
                        <p className="text-sm font-medium text-white truncate">{part.name}</p>
                      </div>
                    </div>
                    <p className="text-xs text-white/40 mt-1">
                      {getSpecsDisplay(part.category, part.specs)}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-green-400 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Compatible
                  </span>
                  <span className="text-xs text-white/30 group-hover:text-white/50 transition-colors">
                    Click to select
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-lg border border-white/20 text-white/70 hover:bg-white/5 transition-colors text-sm"
          >
            Close
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
