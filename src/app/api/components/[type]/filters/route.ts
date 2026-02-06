import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

const VALID_TYPES = [
  'cpu', 'gpu', 'motherboard', 'ram', 'storage', 'psu', 'case', 'cooling', 'monitor',
];

// Which spec keys to extract distinct values for, per component type
const FILTER_SPECS: Record<string, string[]> = {
  cpu: ['socket', 'ram_type', 'cores'],
  gpu: ['vram', 'vram_type'],
  motherboard: ['socket', 'form_factor', 'ram_type', 'chipset'],
  ram: ['type', 'capacity_gb', 'speed_mhz'],
  storage: ['type', 'capacity_gb'],
  psu: ['wattage', 'efficiency', 'modular'],
  case: ['case_type'],
  cooling: ['type'],
  monitor: ['panel_type'],
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params;

  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json(
      { error: 'Invalid component type' },
      { status: 400 }
    );
  }

  // Fetch all components of this type (only specs and brand columns)
  const { data, error } = await supabase
    .from('components')
    .select('brand, specs')
    .eq('type', type);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data || data.length === 0) {
    return NextResponse.json({ success: true, filters: { brands: [] } });
  }

  // Extract distinct brands
  const brands = [...new Set(data.map((d) => d.brand).filter(Boolean))].sort();

  // Extract distinct values for each spec key
  const specKeys = FILTER_SPECS[type] || [];
  const specs: Record<string, (string | number)[]> = {};

  for (const key of specKeys) {
    const values = new Set<string | number>();
    for (const item of data) {
      const val = item.specs?.[key];
      if (val !== null && val !== undefined && val !== '') {
        values.add(val);
      }
    }
    // Sort values: numbers numerically, strings alphabetically
    const arr = [...values];
    arr.sort((a, b) => {
      if (typeof a === 'number' && typeof b === 'number') return a - b;
      return String(a).localeCompare(String(b));
    });
    specs[key] = arr;
  }

  return NextResponse.json({
    success: true,
    filters: {
      brands,
      ...specs,
    },
  });
}
