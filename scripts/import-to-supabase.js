/**
 * Import PC Component Data to Supabase via API
 *
 * This script reads from local IGNIPC PostgreSQL and inserts
 * directly into Supabase in batches (to avoid size limits).
 *
 * Usage: node scripts/import-to-supabase.js
 */

const { Pool } = require('pg');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// IGNIPC PostgreSQL connection
const ignipcPool = new Pool({
  connectionString: 'postgresql://postgres:root@localhost:5432/ignipc',
});

// Supabase client - use service role key if available, otherwise anon key
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKey
);

const BATCH_SIZE = 100;

async function fetchCPUs() {
  const query = `
    SELECT
      c.cpu_id as id, c.name, c.brand, c.name as model,
      COALESCE(c.price, 0) as price, c.image_url,
      s.socket_name as socket, c.cores, c.threads,
      c.base_clock_ghz, c.boost_clock_ghz, c.tdp_watts,
      c.cache_mb, r.ram_type_name as ram_type,
      c.max_ram_speed_mhz, c.has_integrated_graphics, c.unlocked
    FROM pc_cpu c
    LEFT JOIN pc_socket s ON c.socket_id = s.socket_id
    LEFT JOIN pc_ram_type r ON c.supported_ram_type_id = r.ram_type_id
    WHERE c.price IS NOT NULL AND c.price > 0
    ORDER BY c.price
  `;
  const result = await ignipcPool.query(query);
  return result.rows.map((row) => ({
    type: 'cpu', name: row.name, brand: row.brand, model: row.model,
    price: parseFloat(row.price), image_url: row.image_url,
    specs: {
      socket: row.socket, cores: row.cores, threads: row.threads,
      base_clock: parseFloat(row.base_clock_ghz) || 0,
      boost_clock: parseFloat(row.boost_clock_ghz) || 0,
      tdp: row.tdp_watts, cache_mb: row.cache_mb, ram_type: row.ram_type,
      max_ram_speed: row.max_ram_speed_mhz,
      integrated_graphics: row.has_integrated_graphics, unlocked: row.unlocked,
    },
  }));
}

async function fetchGPUs() {
  const query = `
    SELECT
      g.gpu_id as id, g.name, g.brand, g.name as model,
      COALESCE(g.price, 0) as price, g.image_url,
      g.vram_gb, g.vram_type, g.base_clock_mhz, g.boost_clock_mhz,
      g.cuda_cores, g.stream_processors, g.length_mm, g.slot_width,
      g.tdp_watts, g.recommended_psu_watts, g.power_connectors
    FROM pc_gpu g
    WHERE g.price IS NOT NULL AND g.price > 0
    ORDER BY g.price
  `;
  const result = await ignipcPool.query(query);
  return result.rows.map((row) => ({
    type: 'gpu', name: row.name, brand: row.brand, model: row.model,
    price: parseFloat(row.price), image_url: row.image_url,
    specs: {
      vram: row.vram_gb, vram_type: row.vram_type,
      base_clock_mhz: row.base_clock_mhz, boost_clock_mhz: row.boost_clock_mhz,
      cuda_cores: row.cuda_cores, stream_processors: row.stream_processors,
      length_mm: row.length_mm, slot_width: parseFloat(row.slot_width) || 2,
      tdp: row.tdp_watts, recommended_psu: row.recommended_psu_watts,
      power_connectors: row.power_connectors,
    },
  }));
}

async function fetchMotherboards() {
  const query = `
    SELECT
      m.motherboard_id as id, m.name, m.brand, m.name as model,
      COALESCE(m.price, 0) as price, m.image_url,
      s.socket_name as socket, m.chipset,
      f.form_factor_name as form_factor, r.ram_type_name as ram_type,
      m.ram_slots, m.max_ram_gb, m.m2_slots, m.sata_ports, m.has_wifi
    FROM pc_motherboard m
    LEFT JOIN pc_socket s ON m.socket_id = s.socket_id
    LEFT JOIN pc_form_factor f ON m.form_factor_id = f.form_factor_id
    LEFT JOIN pc_ram_type r ON m.ram_type_id = r.ram_type_id
    WHERE m.price IS NOT NULL AND m.price > 0
    ORDER BY m.price
  `;
  const result = await ignipcPool.query(query);
  return result.rows.map((row) => ({
    type: 'motherboard', name: row.name, brand: row.brand, model: row.model,
    price: parseFloat(row.price), image_url: row.image_url,
    specs: {
      socket: row.socket, chipset: row.chipset, form_factor: row.form_factor,
      ram_type: row.ram_type, ram_slots: row.ram_slots, max_ram_gb: row.max_ram_gb,
      m2_slots: row.m2_slots, sata_ports: row.sata_ports, has_wifi: row.has_wifi,
    },
  }));
}

async function fetchRAM() {
  const query = `
    SELECT
      r.ram_id as id, r.name, r.brand, r.name as model,
      COALESCE(r.price, 0) as price, r.image_url,
      t.ram_type_name as type, r.capacity_gb, r.modules_count,
      r.speed_mhz, r.cas_latency, r.voltage, r.has_rgb, r.height_mm
    FROM pc_ram r
    LEFT JOIN pc_ram_type t ON r.ram_type_id = t.ram_type_id
    WHERE r.price IS NOT NULL AND r.price > 0
    ORDER BY r.price
  `;
  const result = await ignipcPool.query(query);
  return result.rows.map((row) => ({
    type: 'ram', name: row.name, brand: row.brand, model: row.model,
    price: parseFloat(row.price), image_url: row.image_url,
    specs: {
      type: row.type, capacity_gb: row.capacity_gb, modules: row.modules_count,
      speed_mhz: row.speed_mhz, cas_latency: row.cas_latency,
      voltage: parseFloat(row.voltage) || null, has_rgb: row.has_rgb, height_mm: row.height_mm,
    },
  }));
}

async function fetchStorage() {
  const query = `
    SELECT
      s.storage_id as id, s.name, s.brand, s.name as model,
      COALESCE(s.price, 0) as price, s.image_url,
      s.storage_type, i.interface_name as interface, s.form_factor,
      s.capacity_gb, s.read_speed_mbps, s.write_speed_mbps,
      s.has_dram_cache, s.tbw
    FROM pc_storage s
    LEFT JOIN pc_storage_interface i ON s.interface_id = i.interface_id
    WHERE s.price IS NOT NULL AND s.price > 0
    ORDER BY s.price
  `;
  const result = await ignipcPool.query(query);
  return result.rows.map((row) => ({
    type: 'storage', name: row.name, brand: row.brand, model: row.model,
    price: parseFloat(row.price), image_url: row.image_url,
    specs: {
      type: row.storage_type, interface: row.interface, form_factor: row.form_factor,
      capacity_gb: row.capacity_gb, read_speed: row.read_speed_mbps,
      write_speed: row.write_speed_mbps, has_dram_cache: row.has_dram_cache, tbw: row.tbw,
    },
  }));
}

async function fetchPSUs() {
  const query = `
    SELECT
      p.psu_id as id, p.name, p.brand, p.name as model,
      COALESCE(p.price, 0) as price, p.image_url,
      p.wattage, p.efficiency_rating, f.form_factor_name as form_factor,
      p.modular_type, p.cpu_power_connectors, p.gpu_power_connectors, p.sata_connectors
    FROM pc_psu p
    LEFT JOIN pc_form_factor f ON p.form_factor_id = f.form_factor_id
    WHERE p.price IS NOT NULL AND p.price > 0
    ORDER BY p.price
  `;
  const result = await ignipcPool.query(query);
  return result.rows.map((row) => ({
    type: 'psu', name: row.name, brand: row.brand, model: row.model,
    price: parseFloat(row.price), image_url: row.image_url,
    specs: {
      wattage: row.wattage, efficiency: row.efficiency_rating,
      form_factor: row.form_factor, modular: row.modular_type,
      cpu_connectors: row.cpu_power_connectors, gpu_connectors: row.gpu_power_connectors,
      sata_connectors: row.sata_connectors,
    },
  }));
}

async function fetchCases() {
  const query = `
    SELECT
      c.case_id as id, c.name, c.brand, c.name as model,
      COALESCE(c.price, 0) as price, c.image_url,
      c.case_type, c.max_gpu_length_mm, c.max_cooler_height_mm,
      c.max_psu_length_mm, c.drive_bays_3_5, c.drive_bays_2_5,
      c.expansion_slots, c.has_tempered_glass, c.has_rgb,
      ARRAY_AGG(DISTINCT f.form_factor_name) FILTER (WHERE f.form_factor_name IS NOT NULL) as form_factors
    FROM pc_case c
    LEFT JOIN pc_case_form_factor cf ON c.case_id = cf.case_id
    LEFT JOIN pc_form_factor f ON cf.form_factor_id = f.form_factor_id
    WHERE c.price IS NOT NULL AND c.price > 0
    GROUP BY c.case_id
    ORDER BY c.price
  `;
  const result = await ignipcPool.query(query);
  return result.rows.map((row) => ({
    type: 'case', name: row.name, brand: row.brand, model: row.model,
    price: parseFloat(row.price), image_url: row.image_url,
    specs: {
      case_type: row.case_type, form_factor: row.form_factors || [],
      max_gpu_length: row.max_gpu_length_mm, max_cooler_height: row.max_cooler_height_mm,
      max_psu_length: row.max_psu_length_mm, drive_bays_35: row.drive_bays_3_5,
      drive_bays_25: row.drive_bays_2_5, expansion_slots: row.expansion_slots,
      tempered_glass: row.has_tempered_glass, has_rgb: row.has_rgb,
    },
  }));
}

async function fetchCoolers() {
  const query = `
    SELECT
      c.cooler_id as id, c.name, c.brand, c.name as model,
      COALESCE(c.price, 0) as price, c.image_url,
      c.cooler_type, c.height_mm, c.radiator_size_mm,
      c.fan_rpm_min, c.fan_rpm_max, c.noise_level_dba,
      c.tdp_rating_watts, c.has_rgb,
      ARRAY_AGG(DISTINCT s.socket_name) FILTER (WHERE s.socket_name IS NOT NULL) as socket_support
    FROM pc_cpu_cooler c
    LEFT JOIN pc_cooler_socket cs ON c.cooler_id = cs.cooler_id
    LEFT JOIN pc_socket s ON cs.socket_id = s.socket_id
    WHERE c.price IS NOT NULL AND c.price > 0
    GROUP BY c.cooler_id
    ORDER BY c.price
  `;
  const result = await ignipcPool.query(query);
  return result.rows.map((row) => ({
    type: 'cooling', name: row.name, brand: row.brand, model: row.model,
    price: parseFloat(row.price), image_url: row.image_url,
    specs: {
      type: row.cooler_type, height_mm: row.height_mm,
      radiator_size: row.radiator_size_mm, fan_rpm_min: row.fan_rpm_min,
      fan_rpm_max: row.fan_rpm_max, noise_dba: row.noise_level_dba,
      tdp_rating: row.tdp_rating_watts, has_rgb: row.has_rgb,
      socket_support: row.socket_support || [],
    },
  }));
}

async function insertBatch(components, componentType) {
  for (let i = 0; i < components.length; i += BATCH_SIZE) {
    const batch = components.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from('components').insert(batch);

    if (error) {
      console.error(`   ❌ Error inserting ${componentType} batch ${Math.floor(i/BATCH_SIZE) + 1}:`, error.message);
      return false;
    }

    process.stdout.write(`   ${componentType}: ${Math.min(i + BATCH_SIZE, components.length)}/${components.length}\r`);
  }
  console.log(`   ✅ ${componentType}: ${components.length} inserted`);
  return true;
}

async function main() {
  console.log('🚀 Starting IGNIPC → Supabase import...\n');
  console.log(`📡 Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}\n`);

  try {
    // Test IGNIPC connection
    await ignipcPool.query('SELECT 1');
    console.log('✅ Connected to IGNIPC database');

    // Test Supabase connection
    const { error: testError } = await supabase.from('components').select('count').limit(1);
    if (testError) {
      console.error('❌ Supabase connection failed:', testError.message);
      console.log('\n⚠️  Make sure you ran 001_initial_schema.sql in Supabase SQL Editor first!');
      process.exit(1);
    }
    console.log('✅ Connected to Supabase\n');

    // Fetch and insert each component type
    console.log('📦 Importing components...\n');

    const cpus = await fetchCPUs();
    await insertBatch(cpus, 'CPUs');

    const gpus = await fetchGPUs();
    await insertBatch(gpus, 'GPUs');

    const motherboards = await fetchMotherboards();
    await insertBatch(motherboards, 'Motherboards');

    const rams = await fetchRAM();
    await insertBatch(rams, 'RAM');

    const storage = await fetchStorage();
    await insertBatch(storage, 'Storage');

    const psus = await fetchPSUs();
    await insertBatch(psus, 'PSUs');

    const cases = await fetchCases();
    await insertBatch(cases, 'Cases');

    const coolers = await fetchCoolers();
    await insertBatch(coolers, 'Coolers');

    const total = cpus.length + gpus.length + motherboards.length + rams.length +
                  storage.length + psus.length + cases.length + coolers.length;

    console.log(`\n🎉 Successfully imported ${total} components to Supabase!\n`);
    console.log('📋 Next: Start the app with npm run dev');

  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  } finally {
    await ignipcPool.end();
  }
}

main();
