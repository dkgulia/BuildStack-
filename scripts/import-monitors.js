/**
 * Import monitors from IGNIPC versus_data.json into Supabase components table.
 *
 * Usage: node scripts/import-monitors.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const MONITORS_PATH = path.join(
  __dirname, '..', '..', 'backend-ignipc',
  'seeders', 'customPc', 'monitors', 'versus', 'versus_data.json'
);

function parseNumber(val) {
  if (!val) return null;
  const num = parseFloat(String(val).replace(/[^0-9.]/g, ''));
  return isNaN(num) ? null : num;
}

function extractBrand(name) {
  const brands = ['Asus', 'LG', 'Samsung', 'Dell', 'BenQ', 'Acer', 'MSI', 'ViewSonic', 'AOC', 'HP', 'Philips', 'Gigabyte', 'Lenovo', 'Sony'];
  for (const brand of brands) {
    if (name.toLowerCase().startsWith(brand.toLowerCase())) {
      return brand;
    }
  }
  return name.split(' ')[0];
}

function extractPanelType(displayType) {
  if (!displayType) return null;
  const types = Array.isArray(displayType) ? displayType : [displayType];
  const joined = types.join(' ').toUpperCase();
  if (joined.includes('IPS')) return 'IPS';
  if (joined.includes('VA')) return 'VA';
  if (joined.includes('TN')) return 'TN';
  if (joined.includes('OLED')) return 'OLED';
  return types[0] || null;
}

async function importMonitors() {
  console.log('Reading monitors data...');

  if (!fs.existsSync(MONITORS_PATH)) {
    console.error(`File not found: ${MONITORS_PATH}`);
    process.exit(1);
  }

  const monitors = JSON.parse(fs.readFileSync(MONITORS_PATH, 'utf-8'));
  console.log(`Found ${monitors.length} monitors`);

  // Check existing
  const { count } = await supabase
    .from('components')
    .select('id', { count: 'exact', head: true })
    .eq('type', 'monitor');
  console.log(`Existing monitors in DB: ${count || 0}`);

  let inserted = 0;
  let skipped = 0;
  let errors = 0;

  const BATCH_SIZE = 50;
  const rows = [];

  for (const monitor of monitors) {
    const s = monitor.specifications || {};
    const brand = extractBrand(monitor.name);
    const name = monitor.name;

    const specs = {
      screen_size: parseNumber(s['screen size']),
      resolution: s.resolution || null,
      pixel_density: parseNumber(s['pixel density']),
      refresh_rate: parseNumber(s['refresh rate']),
      response_time: parseNumber(s['response time']),
      panel_type: extractPanelType(s['Display type']),
      brightness: parseNumber(s['brightness (typical)']),
      contrast_ratio: s['contrast ratio'] || null,
      hdmi_ports: parseNumber(s['HDMI ports']),
      displayport: parseNumber(s['DisplayPort outputs']),
      usb_ports: parseNumber(s['USB ports']),
      has_usb_c: s['Has USB Type-C'] === 'yes',
      has_speakers: s['has built-in stereo speakers'] === 'yes',
      has_vesa: s['Supports VESA mount'] === 'yes',
      srgb_coverage: s['sRGB coverage'] || null,
      hdr: s['supports HDR10'] === 'yes',
      weight_kg: parseNumber(s.weight),
      adaptive_sync: Array.isArray(s['Adaptive synchronization'])
        ? s['Adaptive synchronization'].join(', ')
        : s['Adaptive synchronization'] || null,
    };

    rows.push({
      type: 'monitor',
      name,
      brand,
      model: name,
      price: parseNumber(monitor.listPrice) || 0,
      image_url: monitor.images?.[0] || null,
      specs,
    });
  }

  // Batch insert
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from('components').insert(batch);
    if (error) {
      console.error(`Batch error at ${i}: ${error.message}`);
      errors += batch.length;
    } else {
      inserted += batch.length;
    }
  }

  console.log(`\nDone!`);
  console.log(`  Inserted: ${inserted}`);
  console.log(`  Errors: ${errors}`);
}

importMonitors().catch(console.error);
