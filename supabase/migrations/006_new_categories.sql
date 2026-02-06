-- Laptops table (separate from components since laptops are complete products, not builder parts)
CREATE TABLE IF NOT EXISTS laptops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(500) NOT NULL,
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(255),
  price DECIMAL(10,2),
  image_url TEXT,
  images TEXT[] DEFAULT '{}',
  specs JSONB NOT NULL DEFAULT '{}',
  condition VARCHAR(20) DEFAULT 'New',
  source VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for laptops
CREATE INDEX IF NOT EXISTS idx_laptops_brand ON laptops(brand);
CREATE INDEX IF NOT EXISTS idx_laptops_condition ON laptops(condition);
CREATE INDEX IF NOT EXISTS idx_laptops_specs ON laptops USING GIN (specs);

-- RLS for laptops
ALTER TABLE laptops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on laptops" ON laptops FOR SELECT USING (true);

-- Add monitor to component_types (monitors go in the components table)
INSERT INTO component_types (name, display_name, icon, sort_order) VALUES
  ('monitor', 'Monitor', 'Monitor', 9)
ON CONFLICT (name) DO NOTHING;
