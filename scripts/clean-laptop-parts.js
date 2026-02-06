/**
 * Clean Laptop/Notebook Parts from Desktop Components
 *
 * Removes laptop GPUs (e.g., RTX 5090 Laptop, Max-Q variants) and
 * notebook RAM (SODIMM) from the Supabase components table since
 * this is a desktop PC builder.
 *
 * Usage: node scripts/clean-laptop-parts.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKey
);

async function cleanLaptopGPUs() {
  // Find laptop GPUs
  const { data: laptopGPUs, error: fetchError } = await supabase
    .from('components')
    .select('id, name')
    .eq('type', 'gpu')
    .or('name.ilike.%laptop%,name.ilike.%mobile%,name.ilike.%max-q%,name.ilike.%notebook%');

  if (fetchError) {
    console.error('Error fetching laptop GPUs:', fetchError.message);
    return 0;
  }

  if (!laptopGPUs || laptopGPUs.length === 0) {
    console.log('   No laptop GPUs found');
    return 0;
  }

  console.log(`   Found ${laptopGPUs.length} laptop GPUs to remove:`);
  laptopGPUs.slice(0, 10).forEach((g) => console.log(`     - ${g.name}`));
  if (laptopGPUs.length > 10) console.log(`     ... and ${laptopGPUs.length - 10} more`);

  // Delete them
  const ids = laptopGPUs.map((g) => g.id);
  const { error: deleteError } = await supabase
    .from('components')
    .delete()
    .in('id', ids);

  if (deleteError) {
    console.error('   Error deleting laptop GPUs:', deleteError.message);
    return 0;
  }

  return laptopGPUs.length;
}

async function cleanNotebookRAM() {
  // Find notebook RAM
  const { data: notebookRAM, error: fetchError } = await supabase
    .from('components')
    .select('id, name')
    .eq('type', 'ram')
    .or('name.ilike.%sodimm%,name.ilike.%notebook%,name.ilike.%laptop%');

  if (fetchError) {
    console.error('Error fetching notebook RAM:', fetchError.message);
    return 0;
  }

  if (!notebookRAM || notebookRAM.length === 0) {
    console.log('   No notebook RAM found');
    return 0;
  }

  console.log(`   Found ${notebookRAM.length} notebook RAM modules to remove:`);
  notebookRAM.slice(0, 10).forEach((r) => console.log(`     - ${r.name}`));
  if (notebookRAM.length > 10) console.log(`     ... and ${notebookRAM.length - 10} more`);

  // Delete them
  const ids = notebookRAM.map((r) => r.id);
  const { error: deleteError } = await supabase
    .from('components')
    .delete()
    .in('id', ids);

  if (deleteError) {
    console.error('   Error deleting notebook RAM:', deleteError.message);
    return 0;
  }

  return notebookRAM.length;
}

async function showStats() {
  const types = ['cpu', 'gpu', 'motherboard', 'ram', 'storage', 'psu', 'case', 'cooling'];

  console.log('\n   Component counts:');
  for (const type of types) {
    const { count } = await supabase
      .from('components')
      .select('*', { count: 'exact', head: true })
      .eq('type', type);
    console.log(`     ${type}: ${count}`);
  }
}

async function main() {
  console.log('Cleaning laptop/notebook parts from desktop components...\n');

  console.log('Before cleanup:');
  await showStats();

  console.log('\n1. Removing laptop GPUs...');
  const gpuCount = await cleanLaptopGPUs();
  console.log(`   Removed ${gpuCount} laptop GPUs`);

  console.log('\n2. Removing notebook RAM...');
  const ramCount = await cleanNotebookRAM();
  console.log(`   Removed ${ramCount} notebook RAM modules`);

  console.log('\nAfter cleanup:');
  await showStats();

  console.log(`\nDone! Removed ${gpuCount + ramCount} non-desktop parts.`);
}

main().catch(console.error);
