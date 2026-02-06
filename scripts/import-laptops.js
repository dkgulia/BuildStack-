/**
 * Import laptops from IGNIPC data into Supabase laptops table.
 * Imports from:
 *   - New laptops: versus_data.json (552 items)
 *   - Refurbished (EB): electronic-bazaar-merged.json (683 items)
 *   - Refurbished (NJ): newjaisa.json (386 items)
 *
 * Usage: node scripts/import-laptops.js
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

const IGNIPC = path.join(__dirname, '..', '..', 'backend-ignipc');

function parseNumber(val) {
  if (!val) return null;
  const num = parseFloat(String(val).replace(/[,₹\s]/g, ''));
  return isNaN(num) ? null : num;
}

function extractBrand(name) {
  const brands = ['Lenovo', 'HP', 'Dell', 'Asus', 'Acer', 'Apple', 'MSI', 'Samsung', 'Gigabyte', 'Microsoft', 'Razer', 'Toshiba'];
  const lower = (name || '').toLowerCase();
  for (const brand of brands) {
    if (lower.startsWith(brand.toLowerCase())) return brand;
  }
  return name?.split(' ')[0] || 'Unknown';
}

async function importNewLaptops() {
  const filePath = path.join(IGNIPC, 'seeders', 'laptops', 'new', 'versus', 'versus_data.json');
  if (!fs.existsSync(filePath)) {
    console.log('New laptops file not found, skipping');
    return 0;
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  console.log(`Processing ${data.length} new laptops...`);

  const rows = data.map((item) => {
    const s = item.specifications || {};
    const brand = extractBrand(item.name);

    return {
      name: item.name,
      brand,
      model: item.name,
      price: parseNumber(item.listPrice),
      image_url: item.images?.[0] || null,
      images: item.images || [],
      condition: 'New',
      source: 'versus',
      specs: {
        screen_size: parseNumber(s['screen size']),
        resolution: s.resolution || null,
        refresh_rate: parseNumber(s['refresh rate']),
        ram: s.RAM || null,
        ram_speed: s['RAM speed'] || null,
        storage: s['internal storage'] || null,
        cpu_speed: s['CPU speed'] || null,
        cpu_threads: parseNumber(s['CPU threads']),
        vram: s.VRAM || null,
        gpu_clock: s['GPU clock speed'] || null,
        battery: s['battery size'] || null,
        weight_kg: parseNumber(s.weight),
        has_touchscreen: s['has a touch screen'] === 'yes',
        brightness: parseNumber(s['brightness (typical)']),
        type: s.Type || null,
      },
    };
  });

  let inserted = 0;
  const BATCH = 50;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { error } = await supabase.from('laptops').insert(batch);
    if (error) {
      console.error(`  Batch error at ${i}: ${error.message}`);
    } else {
      inserted += batch.length;
    }
  }
  return inserted;
}

async function importRefurbishedEB() {
  const filePath = path.join(IGNIPC, 'seeders', 'laptops', 'refurbished', 'electronicBazaar', 'electronic-bazaar-merged.json');
  if (!fs.existsSync(filePath)) {
    console.log('EB refurbished file not found, skipping');
    return 0;
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  console.log(`Processing ${data.length} refurbished laptops (EB)...`);

  const rows = data.map((item) => ({
    name: item.Description || `${item.Brand} Laptop`,
    brand: item.Brand || 'Unknown',
    model: item.Description || null,
    price: item.Cost || null,
    image_url: item.Images?.[0] || null,
    images: item.Images || [],
    condition: 'Refurbished',
    source: 'electronicsbazaar',
    specs: {
      processor: item.Processor || null,
      ram: item.RAM ? `${item.RAM}GB` : null,
      storage: item.Storage ? `${item.Storage}GB` : null,
      screen_size: parseNumber(item.Screen_size),
      os: item.Operating_system || null,
      warranty: item.Warranty || null,
    },
  }));

  let inserted = 0;
  const BATCH = 50;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { error } = await supabase.from('laptops').insert(batch);
    if (error) {
      console.error(`  Batch error at ${i}: ${error.message}`);
    } else {
      inserted += batch.length;
    }
  }
  return inserted;
}

async function importRefurbishedNJ() {
  const filePath = path.join(IGNIPC, 'seeders', 'laptops', 'refurbished', 'newJaisa', 'newjaisa.json');
  if (!fs.existsSync(filePath)) {
    console.log('NJ refurbished file not found, skipping');
    return 0;
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  console.log(`Processing ${data.length} refurbished laptops (NJ)...`);

  const rows = data.map((item) => ({
    name: item.Description || `${item.Brand} Laptop`,
    brand: item.Brand || 'Unknown',
    model: item.Description || null,
    price: item.Cost || null,
    image_url: item['Image URL'] || null,
    images: item['Image URL'] ? [item['Image URL']] : [],
    condition: 'Refurbished',
    source: 'newjaisa',
    specs: {
      processor: item.Processor || null,
      ram: item.RAM ? `${item.RAM}GB` : null,
      storage: item.Storage ? `${item.Storage}GB` : null,
      screen_size: parseNumber(item.screen_size),
      os: item.operating_system || null,
      warranty: item.warranty || null,
    },
  }));

  let inserted = 0;
  const BATCH = 50;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { error } = await supabase.from('laptops').insert(batch);
    if (error) {
      console.error(`  Batch error at ${i}: ${error.message}`);
    } else {
      inserted += batch.length;
    }
  }
  return inserted;
}

async function main() {
  // Check existing
  const { count } = await supabase
    .from('laptops')
    .select('id', { count: 'exact', head: true });
  console.log(`Existing laptops in DB: ${count || 0}\n`);

  const newCount = await importNewLaptops();
  const ebCount = await importRefurbishedEB();
  const njCount = await importRefurbishedNJ();

  console.log(`\nDone!`);
  console.log(`  New laptops: ${newCount}`);
  console.log(`  Refurbished (EB): ${ebCount}`);
  console.log(`  Refurbished (NJ): ${njCount}`);
  console.log(`  Total imported: ${newCount + ebCount + njCount}`);
}

main().catch(console.error);
