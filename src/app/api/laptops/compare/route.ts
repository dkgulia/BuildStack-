import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ids = searchParams.get('ids');

  if (!ids) {
    return NextResponse.json({ error: 'Missing ids parameter' }, { status: 400 });
  }

  const idArray = ids.split(',').filter(Boolean);

  if (idArray.length < 2 || idArray.length > 3) {
    return NextResponse.json({ error: 'Provide 2-3 IDs for comparison' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('laptops')
    .select('*')
    .in('id', idArray);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}
