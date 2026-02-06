import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const brand = searchParams.get('brand');
  const condition = searchParams.get('condition');
  const processor = searchParams.get('processor');
  const minRam = searchParams.get('min_ram');
  const sortBy = searchParams.get('sort_by');

  let query = supabase.from('laptops').select('*');

  if (brand) {
    query = query.eq('brand', brand);
  }
  if (condition) {
    query = query.eq('condition', condition);
  }
  if (processor) {
    query = query.ilike('specs->>processor', `%${processor}%`);
  }
  if (minRam) {
    query = query.gte('specs->>ram', minRam);
  }

  if (sortBy === 'name') {
    query = query.order('name', { ascending: true });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  query = query.limit(100);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}
