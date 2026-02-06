-- Presets table for prebuilt PC configurations
CREATE TABLE IF NOT EXISTS presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  category VARCHAR(100) NOT NULL,
  subcategory VARCHAR(100),
  description TEXT,
  platform VARCHAR(20),
  image_url TEXT,
  components JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_presets_category ON presets(category);
CREATE INDEX IF NOT EXISTS idx_presets_platform ON presets(platform);
CREATE INDEX IF NOT EXISTS idx_presets_slug ON presets(slug);
CREATE INDEX IF NOT EXISTS idx_presets_active ON presets(is_active) WHERE is_active = true;

-- Enable RLS
ALTER TABLE presets ENABLE ROW LEVEL SECURITY;

-- Public read access for active presets
CREATE POLICY "Allow public read on active presets" ON presets
  FOR SELECT USING (is_active = true);
