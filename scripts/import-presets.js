/**
 * Import prebuilt PC configs from IGNIPC backend into Supabase presets table.
 *
 * Usage: node scripts/import-presets.js
 *
 * Requires:
 *   NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local
 *   The presets table from 004_presets.sql must already exist.
 *   The IGNIPC backend at ../backend-ignipc (relative to project root).
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Path to IGNIPC prebuilts data
const PREBUILTS_PATH = path.join(
  __dirname,
  '..',
  '..',
  'backend-ignipc',
  'seeders',
  'pcBuilder',
  'prebuilts_normalized.json'
);

// Map IGNIPC categories to our use-case categories
const CATEGORY_MAP = {
  Gaming: 'gaming',
  'Video Editing': 'editing',
  'Photo Editing': 'editing',
  '3D & Animation': 'creative',
  'CAD & Design': 'creative',
  Rendering: 'creative',
  'Game Development': 'coding',
  'Data Science': 'coding',
  'AI & Machine Learning': 'coding',
  'Scientific Computing': 'coding',
  Trading: 'office',
  'Virtual Production': 'creative',
  Photogrammetry: 'creative',
};

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Try to find a matching component in Supabase by fuzzy name match
async function findComponent(type, displayText) {
  if (!displayText) return null;

  // Extract key search terms from displayText
  // e.g. "Ryzen 9 - 9950x upto 5.7GHz" → search for "9950x"
  // e.g. "RTX 5090 - Zotac Solid OC 32GB" → search for "5090"
  const searchTerms = displayText.split(/[-–,]/);
  const mainTerm = searchTerms[0].trim();

  // Map 'cooling' type to our DB type naming
  const dbType = type === 'cooling' ? 'cooling' : type;

  const { data } = await supabase
    .from('components')
    .select('id, name')
    .eq('type', dbType)
    .ilike('name', `%${mainTerm}%`)
    .limit(1);

  if (data && data.length > 0) return data[0].id;

  // Fallback: try with the full display text
  const { data: data2 } = await supabase
    .from('components')
    .select('id, name')
    .eq('type', dbType)
    .ilike('name', `%${displayText.substring(0, 30)}%`)
    .limit(1);

  if (data2 && data2.length > 0) return data2[0].id;

  return null;
}

async function importPresets() {
  console.log('Reading prebuilts data...');

  if (!fs.existsSync(PREBUILTS_PATH)) {
    console.error(`File not found: ${PREBUILTS_PATH}`);
    console.error('Make sure the IGNIPC backend exists at ../backend-ignipc');
    process.exit(1);
  }

  const raw = JSON.parse(fs.readFileSync(PREBUILTS_PATH, 'utf-8'));
  const prebuilts = raw.prebuilts;
  console.log(`Found ${prebuilts.length} prebuilt configs`);

  // Check for existing presets
  const { count } = await supabase
    .from('presets')
    .select('id', { count: 'exact', head: true });
  console.log(`Existing presets in DB: ${count || 0}`);

  let inserted = 0;
  let skipped = 0;
  let errors = 0;

  for (const preset of prebuilts) {
    const slug = slugify(preset.name);

    // Check if already exists
    const { data: existing } = await supabase
      .from('presets')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (existing) {
      skipped++;
      continue;
    }

    // Build components JSONB - try to match to our Supabase component IDs
    const components = {};
    const componentTypes = ['cpu', 'gpu', 'motherboard', 'ram', 'storage', 'psu', 'case', 'cooling'];

    for (const cType of componentTypes) {
      const comp = preset.components?.[cType];
      if (!comp) continue;

      // Try storage1 as primary storage if storage is missing
      const actualComp = cType === 'storage' && !comp.displayText
        ? preset.components?.storage1
        : comp;

      if (!actualComp?.displayText) continue;

      const matchedId = await findComponent(cType, actualComp.displayText);
      components[cType] = {
        component_id: matchedId,
        display_text: actualComp.displayText,
      };
    }

    // Also check storage1/storage2 if no storage was found
    if (!components.storage && preset.components?.storage1?.displayText) {
      const matchedId = await findComponent('storage', preset.components.storage1.displayText);
      components.storage = {
        component_id: matchedId,
        display_text: preset.components.storage1.displayText,
      };
    }

    const category = CATEGORY_MAP[preset.category] || 'other';

    const row = {
      name: preset.name,
      slug,
      category,
      subcategory: preset.subcategory || preset.category,
      platform: preset.platform || null,
      image_url: preset.imageUrl || null,
      components,
      is_active: true,
      sort_order: 0,
    };

    const { error } = await supabase.from('presets').insert(row);

    if (error) {
      console.error(`Error inserting "${preset.name}": ${error.message}`);
      errors++;
    } else {
      inserted++;
    }
  }

  console.log(`\nDone!`);
  console.log(`  Inserted: ${inserted}`);
  console.log(`  Skipped (duplicate): ${skipped}`);
  console.log(`  Errors: ${errors}`);
}

importPresets().catch(console.error);
