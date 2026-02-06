import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET() {
  const { data, error } = await supabase
    .from('laptops')
    .select('brand, condition');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const brands = [...new Set((data || []).map((d) => d.brand).filter(Boolean))].sort();
  const conditions = [...new Set((data || []).map((d) => d.condition).filter(Boolean))].sort();

  return NextResponse.json({
    success: true,
    filters: { brands, conditions },
  });
}
