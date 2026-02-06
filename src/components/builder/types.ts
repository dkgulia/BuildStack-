export type Category = 'cpu' | 'gpu' | 'motherboard' | 'ram' | 'storage' | 'psu' | 'case' | 'cooling' | 'monitor';

export interface Part {
  id: string;
  type: Category;
  brand: string;
  name: string;
  model: string;
  price: number;
  image_url: string | null;
  specs: Record<string, unknown>;
  created_at: string;
}

export interface Build {
  cpu: Part | null;
  gpu: Part | null;
  motherboard: Part | null;
  ram: Part | null;
  storage: Part | null;
  psu: Part | null;
  case: Part | null;
  cooling: Part | null;
  monitor: Part | null;
}

export interface CompatibilityIssue {
  type: 'error' | 'warning';
  message: string;
  categories: Category[];
}

export const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'cpu', label: 'CPU' },
  { id: 'gpu', label: 'GPU' },
  { id: 'motherboard', label: 'Motherboard' },
  { id: 'ram', label: 'RAM' },
  { id: 'storage', label: 'Storage' },
  { id: 'psu', label: 'PSU' },
  { id: 'case', label: 'Case' },
  { id: 'cooling', label: 'Cooling' },
  { id: 'monitor', label: 'Monitor (Optional)' },
];

// Helper to extract specs for display
export function getSpecsDisplay(part: Part): string[] {
  const specs = part.specs;
  const type = part.type;

  switch (type) {
    case 'cpu':
      return [
        specs.cores ? `${specs.cores}C/${specs.threads || specs.cores}T` : '',
        specs.boost_clock ? `${specs.boost_clock} GHz` : '',
        specs.tdp ? `${specs.tdp}W` : '',
        specs.socket as string || '',
      ].filter(Boolean);
    case 'gpu':
      return [
        specs.vram ? `${specs.vram}GB` : '',
        specs.tdp ? `${specs.tdp}W` : '',
        specs.length_mm ? `${specs.length_mm}mm` : '',
      ].filter(Boolean);
    case 'motherboard':
      return [
        specs.socket as string || '',
        specs.chipset as string || '',
        specs.form_factor as string || '',
      ].filter(Boolean);
    case 'ram':
      return [
        specs.capacity_gb ? `${specs.capacity_gb}GB` : '',
        specs.speed_mhz ? `${specs.speed_mhz} MHz` : '',
        specs.type as string || '',
      ].filter(Boolean);
    case 'storage': {
      const capacityGb = specs.capacity_gb as number;
      return [
        capacityGb ? (capacityGb >= 1000 ? `${capacityGb / 1000}TB` : `${capacityGb}GB`) : '',
        specs.type as string || '',
      ].filter(Boolean);
    }
    case 'psu':
      return [
        specs.wattage ? `${specs.wattage}W` : '',
        specs.efficiency as string || '',
      ].filter(Boolean);
    case 'case':
      return [
        specs.case_type as string || specs.form_factor as string || '',
      ].filter(Boolean);
    case 'cooling':
      return [
        specs.type as string || '',
        specs.tdp_rating ? `${specs.tdp_rating}W` : '',
      ].filter(Boolean);
    case 'monitor':
      return [
        specs.screen_size ? `${specs.screen_size}"` : '',
        specs.resolution as string || '',
        specs.refresh_rate ? `${specs.refresh_rate}Hz` : '',
        specs.panel_type as string || '',
      ].filter(Boolean);
    default:
      return [];
  }
}

// Helper to get socket from part
export function getSocket(part: Part | null): string | undefined {
  if (!part) return undefined;
  return part.specs.socket as string | undefined;
}

// Helper to get RAM type from part
export function getRamType(part: Part | null): string | undefined {
  if (!part) return undefined;
  return (part.specs.ram_type || part.specs.type) as string | undefined;
}

// Helper to get TDP/wattage from part
export function getTdp(part: Part | null): number {
  if (!part) return 0;
  return (part.specs.tdp || part.specs.wattage || 0) as number;
}

// Helper to get PSU wattage
export function getPsuWattage(part: Part | null): number {
  if (!part) return 0;
  return (part.specs.wattage || 0) as number;
}
