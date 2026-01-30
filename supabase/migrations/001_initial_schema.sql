-- PC Builder SaaS Database Schema
-- Run this in Supabase SQL Editor

-- Component Categories
CREATE TABLE IF NOT EXISTS component_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  icon VARCHAR(50),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Components Table (unified with JSONB specs)
CREATE TABLE IF NOT EXISTS components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(100),
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  specs JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Saved Builds
CREATE TABLE IF NOT EXISTS builds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  components JSONB NOT NULL,
  total_price DECIMAL(10,2),
  slug VARCHAR(100) UNIQUE,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_components_type ON components(type);
CREATE INDEX IF NOT EXISTS idx_components_brand ON components(brand);
CREATE INDEX IF NOT EXISTS idx_builds_slug ON builds(slug);
CREATE INDEX IF NOT EXISTS idx_builds_public ON builds(is_public);

-- Enable Row Level Security
ALTER TABLE component_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE components ENABLE ROW LEVEL SECURITY;
ALTER TABLE builds ENABLE ROW LEVEL SECURITY;

-- RLS Policies (allow public read access)
CREATE POLICY "Allow public read on component_types" ON component_types FOR SELECT USING (true);
CREATE POLICY "Allow public read on components" ON components FOR SELECT USING (true);
CREATE POLICY "Allow public read on public builds" ON builds FOR SELECT USING (is_public = true);
CREATE POLICY "Allow public insert on builds" ON builds FOR INSERT WITH CHECK (true);

-- Seed Component Types
INSERT INTO component_types (name, display_name, icon, sort_order) VALUES
  ('cpu', 'CPU', 'Cpu', 1),
  ('gpu', 'Graphics Card', 'Monitor', 2),
  ('motherboard', 'Motherboard', 'CircuitBoard', 3),
  ('ram', 'Memory', 'MemoryStick', 4),
  ('storage', 'Storage', 'HardDrive', 5),
  ('psu', 'Power Supply', 'Zap', 6),
  ('case', 'Case', 'Box', 7),
  ('cooling', 'Cooling', 'Fan', 8)
ON CONFLICT (name) DO NOTHING;
