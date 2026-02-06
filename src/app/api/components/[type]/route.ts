import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

const VALID_TYPES = [
  'cpu',
  'gpu',
  'motherboard',
  'ram',
  'storage',
  'psu',
  'case',
  'cooling',
  'monitor',
];

// Spec filter keys that use exact match (specs->>key = value)
const EXACT_SPEC_FILTERS: Record<string, string[]> = {
  cpu: ['socket', 'ram_type'],
  gpu: ['vram_type'],
  motherboard: ['socket', 'form_factor', 'ram_type'],
  ram: ['type'],
  storage: ['type', 'interface'],
  psu: ['efficiency', 'modular'],
  case: ['case_type'],
  cooling: ['type'],
  monitor: ['panel_type'],
};

// Spec filter keys that use gte (specs->>key >= value)
const MIN_SPEC_FILTERS: Record<string, string[]> = {
  cpu: ['cores', 'tdp'],
  gpu: ['vram', 'tdp'],
  motherboard: ['ram_slots', 'm2_slots'],
  ram: ['capacity_gb', 'speed_mhz'],
  storage: ['capacity_gb', 'read_speed'],
  psu: ['wattage'],
  case: ['max_gpu_length', 'max_cooler_height'],
  cooling: ['tdp_rating'],
  monitor: ['refresh_rate'],
};

// Sort configurations per component type for "performance" sort
const PERFORMANCE_SORT: Record<string, { column: string; ascending: boolean }[]> = {
  cpu: [
    { column: 'specs->>cores', ascending: false },
    { column: 'specs->>boost_clock', ascending: false },
  ],
  gpu: [
    { column: 'specs->>vram', ascending: false },
    { column: 'specs->>tdp', ascending: false },
  ],
  motherboard: [
    { column: 'specs->>m2_slots', ascending: false },
    { column: 'specs->>ram_slots', ascending: false },
  ],
  ram: [
    { column: 'specs->>capacity_gb', ascending: false },
    { column: 'specs->>speed_mhz', ascending: false },
  ],
  storage: [
    { column: 'specs->>capacity_gb', ascending: false },
    { column: 'specs->>read_speed', ascending: false },
  ],
  psu: [
    { column: 'specs->>wattage', ascending: false },
  ],
  case: [
    { column: 'specs->>max_gpu_length', ascending: false },
  ],
  cooling: [
    { column: 'specs->>tdp_rating', ascending: false },
  ],
  monitor: [
    { column: 'specs->>refresh_rate', ascending: false },
  ],
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

  const { searchParams } = new URL(request.url);

  // Fetch specific parts by IDs (for compare page)
  const ids = searchParams.get('ids');
  if (ids) {
    const idArray = ids.split(',').filter(Boolean);
    const { data, error } = await supabase
      .from('components')
      .select('*')
      .eq('type', type)
      .in('id', idArray);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, data });
  }

  const brand = searchParams.get('brand');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const sortBy = searchParams.get('sort_by'); // 'performance', 'name', default: price asc

  let query = supabase
    .from('components')
    .select('*')
    .eq('type', type);

  // Brand filter
  if (brand) {
    query = query.eq('brand', brand);
  }

  // Price filters
  if (minPrice) {
    query = query.gte('price', parseFloat(minPrice));
  }
  if (maxPrice) {
    query = query.lte('price', parseFloat(maxPrice));
  }

  // Exact spec filters (e.g., socket=AM5, ram_type=DDR5)
  const exactFilters = EXACT_SPEC_FILTERS[type] || [];
  for (const key of exactFilters) {
    const value = searchParams.get(key);
    if (value) {
      // Handle keys that might be stored differently (e.g., ram "type" vs motherboard "ram_type")
      if (key === 'type' && type === 'ram') {
        query = query.eq('specs->>type', value);
      } else {
        query = query.eq(`specs->>${key}`, value);
      }
    }
  }

  // Minimum spec filters (e.g., cores>=8, vram>=12)
  const minFilters = MIN_SPEC_FILTERS[type] || [];
  for (const key of minFilters) {
    const value = searchParams.get(`${key}_min`);
    if (value) {
      query = query.gte(`specs->>${key}`, parseInt(value));
    }
  }

  // Boolean spec filters (e.g., has_wifi=true, has_rgb=true)
  const boolValue = searchParams.get('has_wifi');
  if (boolValue === 'true' && type === 'motherboard') {
    query = query.eq('specs->>has_wifi', true);
  }
  const rgbValue = searchParams.get('has_rgb');
  if (rgbValue === 'true') {
    query = query.eq('specs->>has_rgb', true);
  }

  // Sorting
  if (sortBy === 'performance') {
    const sortConfig = PERFORMANCE_SORT[type];
    if (sortConfig) {
      for (const sort of sortConfig) {
        query = query.order(sort.column, { ascending: sort.ascending });
      }
    }
  } else if (sortBy === 'name') {
    query = query.order('name', { ascending: true });
  } else {
    // Default: price ascending
    query = query.order('price', { ascending: true });
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}
