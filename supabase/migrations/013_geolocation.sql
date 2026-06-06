-- Add geolocation columns to HCPs
ALTER TABLE hcps
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS clinic_address_number TEXT;

-- Add geolocation columns to HCOs
ALTER TABLE hcos
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS address_number TEXT;

-- Create spatial indexes for geo queries
CREATE INDEX IF NOT EXISTS idx_hcps_geo ON hcps(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_hcos_geo ON hcos(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Create geocoding cache table (avoid duplicate Nominatim calls)
CREATE TABLE IF NOT EXISTS geocoding_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  query TEXT NOT NULL UNIQUE,
  display_name TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  raw_response JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_geocoding_cache_query ON geocoding_cache(query);

-- RLS for geocoding_cache (all authenticated users can read/write)
ALTER TABLE geocoding_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read cache"
  ON geocoding_cache FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert cache"
  ON geocoding_cache FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
