import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Build,
  ComponentType,
  PCComponent,
  CompatibilityResult,
  CompatibilityIssue,
} from '@/types/components';

interface BuilderState {
  // Build state
  build: Build;

  // UI state
  activeCategory: ComponentType;

  // Actions
  setComponent: (type: ComponentType, component: PCComponent | null) => void;
  removeComponent: (type: ComponentType) => void;
  clearBuild: () => void;
  setActiveCategory: (category: ComponentType) => void;

  // Computed
  getTotalPrice: () => number;
  getSelectedCount: () => number;
  checkCompatibility: () => CompatibilityResult;
}

const initialBuild: Build = {
  cpu: null,
  gpu: null,
  motherboard: null,
  ram: null,
  storage: null,
  psu: null,
  case: null,
  cooling: null,
};

export const useBuilder = create<BuilderState>()(
  persist(
    (set, get) => ({
      build: initialBuild,
      activeCategory: 'cpu',

      setComponent: (type, component) =>
        set((state) => ({
          build: { ...state.build, [type]: component },
        })),

      removeComponent: (type) =>
        set((state) => ({
          build: { ...state.build, [type]: null },
        })),

      clearBuild: () => set({ build: initialBuild }),

      setActiveCategory: (category) => set({ activeCategory: category }),

      getTotalPrice: () => {
        const { build } = get();
        return Object.values(build).reduce(
          (total, component) => total + (component?.price || 0),
          0
        );
      },

      getSelectedCount: () => {
        const { build } = get();
        return Object.values(build).filter(Boolean).length;
      },

      checkCompatibility: () => {
        const { build } = get();
        const issues: CompatibilityIssue[] = [];

        // Rule 1: CPU ↔ Motherboard socket match
        if (build.cpu && build.motherboard) {
          const cpuSocket = (build.cpu.specs as { socket?: string }).socket;
          const mbSocket = (build.motherboard.specs as { socket?: string }).socket;

          if (cpuSocket && mbSocket && cpuSocket !== mbSocket) {
            issues.push({
              severity: 'error',
              message: `CPU socket (${cpuSocket}) doesn't match motherboard socket (${mbSocket})`,
              components: ['cpu', 'motherboard'],
            });
          }
        }

        // Rule 2: RAM type compatibility
        if (build.ram && build.motherboard) {
          const ramType = (build.ram.specs as { type?: string }).type;
          const mbRamType = (build.motherboard.specs as { ram_type?: string }).ram_type;

          if (ramType && mbRamType && ramType !== mbRamType) {
            issues.push({
              severity: 'error',
              message: `RAM type (${ramType}) not compatible with motherboard (requires ${mbRamType})`,
              components: ['ram', 'motherboard'],
            });
          }
        }

        // Rule 3: PSU wattage check
        if (build.psu) {
          const psuWattage = (build.psu.specs as { wattage?: number }).wattage || 0;

          // Calculate total TDP
          let totalTdp = 0;
          if (build.cpu) {
            totalTdp += (build.cpu.specs as { tdp?: number }).tdp || 0;
          }
          if (build.gpu) {
            totalTdp += (build.gpu.specs as { tdp?: number }).tdp || 0;
          }
          // Add 100W for other components
          totalTdp += 100;

          const recommended = Math.ceil(totalTdp * 1.2);

          if (psuWattage < recommended) {
            issues.push({
              severity: 'warning',
              message: `PSU (${psuWattage}W) may be insufficient. Recommended: ${recommended}W`,
              components: ['psu'],
            });
          }
        }

        // Rule 4: GPU physical fit
        if (build.gpu && build.case) {
          const gpuLength = (build.gpu.specs as { length_mm?: number }).length_mm;
          const maxGpuLength = (build.case.specs as { max_gpu_length?: number }).max_gpu_length;

          if (gpuLength && maxGpuLength && gpuLength > maxGpuLength) {
            issues.push({
              severity: 'error',
              message: `GPU too long (${gpuLength}mm) for case (max ${maxGpuLength}mm)`,
              components: ['gpu', 'case'],
            });
          }
        }

        // Rule 5: Cooler socket compatibility
        if (build.cooling && build.cpu) {
          const cpuSocket = (build.cpu.specs as { socket?: string }).socket;
          const coolerSockets = (build.cooling.specs as { socket_support?: string[] }).socket_support;

          if (cpuSocket && coolerSockets && !coolerSockets.includes(cpuSocket)) {
            issues.push({
              severity: 'error',
              message: `Cooler doesn't support CPU socket (${cpuSocket})`,
              components: ['cooling', 'cpu'],
            });
          }
        }

        // Rule 6: Cooler height vs case clearance
        if (build.cooling && build.case) {
          const coolerHeight = (build.cooling.specs as { height_mm?: number }).height_mm;
          const maxCoolerHeight = (build.case.specs as { max_cooler_height?: number }).max_cooler_height;

          if (coolerHeight && maxCoolerHeight && coolerHeight > maxCoolerHeight) {
            issues.push({
              severity: 'error',
              message: `Cooler too tall (${coolerHeight}mm) for case (max ${maxCoolerHeight}mm)`,
              components: ['cooling', 'case'],
            });
          }
        }

        return {
          compatible: !issues.some((i) => i.severity === 'error'),
          issues,
        };
      },
    }),
    {
      name: 'pc-builder-storage',
      partialize: (state) => ({ build: state.build }),
    }
  )
);
