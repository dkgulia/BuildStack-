-- GIN index on specs JSONB column for efficient spec-based filtering
CREATE INDEX IF NOT EXISTS idx_components_specs ON components USING GIN (specs);
