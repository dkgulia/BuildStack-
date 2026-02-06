import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const { data: preset, error } = await supabase
    .from('presets')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!preset) {
    return NextResponse.json({ error: 'Preset not found' }, { status: 404 });
  }

  // Resolve component IDs to full component data
  const components = preset.components || {};
  const resolvedComponents: Record<string, unknown> = {};

  for (const [type, comp] of Object.entries(components)) {
    const { component_id, display_text } = comp as { component_id: string | null; display_text: string };

    if (component_id) {
      const { data: part } = await supabase
        .from('components')
        .select('*')
        .eq('id', component_id)
        .maybeSingle();

      if (part) {
        resolvedComponents[type] = part;
        continue;
      }
    }

    // Fallback: return display text only
    resolvedComponents[type] = { display_text };
  }

  return NextResponse.json({
    success: true,
    data: {
      ...preset,
      resolved_components: resolvedComponents,
    },
  });
}
