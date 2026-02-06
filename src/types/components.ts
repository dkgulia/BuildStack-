// Component Types
export type ComponentType =
  | 'cpu'
  | 'gpu'
  | 'motherboard'
  | 'ram'
  | 'storage'
  | 'psu'
  | 'case'
  | 'cooling'
  | 'monitor';

export interface ComponentCategory {
  id: string;
  name: ComponentType;
  display_name: string;
  icon: string;
  sort_order: number;
}

// Base component with flexible specs
export interface PCComponent {
  id: string;
  type: ComponentType;
  name: string;
  brand: string;
  model: string;
  price: number;
  image_url: string | null;
  specs: Record<string, unknown>;
  created_at: string;
}

// Typed specs for each component type
export interface CPUSpecs {
  socket: string;
  cores: number;
  threads: number;
  base_clock: number;
  boost_clock: number;
  tdp: number;
  ram_type: 'DDR4' | 'DDR5';
  integrated_graphics: boolean;
}

export interface GPUSpecs {
  vram: number;
  vram_type: string;
  tdp: number;
  length_mm: number;
  slot_width: number;
  power_connectors: string;
}

export interface MotherboardSpecs {
  socket: string;
  chipset: string;
  form_factor: 'ATX' | 'Micro-ATX' | 'Mini-ITX' | 'E-ATX';
  ram_type: 'DDR4' | 'DDR5';
  ram_slots: number;
  max_ram_gb: number;
  m2_slots: number;
}

export interface RAMSpecs {
  type: 'DDR4' | 'DDR5';
  capacity_gb: number;
  modules: number;
  speed_mhz: number;
  cas_latency: string;
}

export interface StorageSpecs {
  type: 'NVMe' | 'SATA SSD' | 'HDD';
  capacity_gb: number;
  interface: string;
  read_speed: number;
  write_speed: number;
}

export interface PSUSpecs {
  wattage: number;
  efficiency: string;
  modular: 'Full' | 'Semi' | 'Non-modular';
  form_factor: string;
}

export interface CaseSpecs {
  form_factor: string[];
  max_gpu_length: number;
  max_cooler_height: number;
  drive_bays_25: number;
  drive_bays_35: number;
}

export interface CoolingSpecs {
  type: 'Air' | 'AIO';
  height_mm?: number;
  radiator_size?: number;
  tdp_rating: number;
  socket_support: string[];
}

// Build types
export interface Build {
  cpu: PCComponent | null;
  gpu: PCComponent | null;
  motherboard: PCComponent | null;
  ram: PCComponent | null;
  storage: PCComponent | null;
  psu: PCComponent | null;
  case: PCComponent | null;
  cooling: PCComponent | null;
  monitor: PCComponent | null;
}

export interface SavedBuild {
  id: string;
  name: string;
  description: string | null;
  components: Build;
  total_price: number;
  slug: string;
  is_public: boolean;
  created_at: string;
}

// Compatibility types
export interface CompatibilityIssue {
  severity: 'error' | 'warning';
  message: string;
  components: ComponentType[];
}

export interface CompatibilityResult {
  compatible: boolean;
  issues: CompatibilityIssue[];
}
