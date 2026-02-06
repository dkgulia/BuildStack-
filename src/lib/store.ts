import { Build } from './compatibility';
import { supabase } from './supabase/client';

function generateSlug(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let slug = '';
  for (let i = 0; i < 8; i++) {
    slug += chars[Math.floor(Math.random() * chars.length)];
  }
  return slug;
}

export async function createBuild(
  build: Omit<Build, 'id' | 'createdAt'>
): Promise<Build> {
  const slug = generateSlug();

  const row = {
    name: build.name || 'My PC Build',
    components: build.parts,
    slug,
    is_public: true,
  };

  const { data, error } = await supabase
    .from('builds')
    .insert(row)
    .select('id, slug, name, components, created_at')
    .single();

  if (error) {
    throw new Error(`Failed to save build: ${error.message}`);
  }

  return {
    id: data.slug,
    name: data.name,
    parts: data.components,
    currency: 'INR',
    createdAt: data.created_at,
  };
}

export async function getBuild(idOrSlug: string): Promise<Build | null> {
  // Try by slug first (short IDs), then by UUID
  let query = supabase
    .from('builds')
    .select('id, slug, name, components, created_at')
    .eq('slug', idOrSlug)
    .maybeSingle();

  let { data, error } = await query;

  if (!data && !error) {
    // Try by UUID
    const result = await supabase
      .from('builds')
      .select('id, slug, name, components, created_at')
      .eq('id', idOrSlug)
      .maybeSingle();
    data = result.data;
    error = result.error;
  }

  if (error || !data) return null;

  return {
    id: data.slug || data.id,
    name: data.name,
    parts: data.components,
    currency: 'INR',
    createdAt: data.created_at,
  };
}
