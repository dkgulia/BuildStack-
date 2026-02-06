-- Add columns to builds table for richer data
ALTER TABLE builds ADD COLUMN IF NOT EXISTS platform VARCHAR(20);
ALTER TABLE builds ADD COLUMN IF NOT EXISTS category VARCHAR(100);
ALTER TABLE builds ADD COLUMN IF NOT EXISTS preset_id UUID REFERENCES presets(id);
ALTER TABLE builds ADD COLUMN IF NOT EXISTS compatibility_score INT;
ALTER TABLE builds ADD COLUMN IF NOT EXISTS estimated_wattage INT;

-- Allow public insert with slug generation (needed for sharing)
-- The existing policy already allows public insert, but let's also allow reading by slug
