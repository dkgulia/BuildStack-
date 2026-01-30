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
];

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
  const brand = searchParams.get('brand');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');

  let query = supabase
    .from('components')
    .select('*')
    .eq('type', type)
    .order('price', { ascending: true });

  if (brand) {
    query = query.eq('brand', brand);
  }

  if (minPrice) {
    query = query.gte('price', parseFloat(minPrice));
  }

  if (maxPrice) {
    query = query.lte('price', parseFloat(maxPrice));
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}
