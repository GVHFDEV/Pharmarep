-- Create HCPs table (Healthcare Professionals)
CREATE TABLE IF NOT EXISTS hcps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  crm TEXT NOT NULL,
  cpf TEXT,
  email TEXT,
  mobile_phone TEXT,
  landline_phone TEXT,
  specialty TEXT NOT NULL,
  category TEXT,
  potential INTEGER CHECK (potential IN (1, 2, 3)),
  adoption_curve TEXT CHECK (adoption_curve IN (
    'Inovador', 'Early Adopter', 'Maioria Inicial',
    'Maioria Tardia', 'Retardatário'
  )),
  clinic_name TEXT,
  clinic_address TEXT,
  clinic_city TEXT,
  clinic_state TEXT,
  clinic_zip TEXT,
  notes TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_hcps_user_id ON hcps(user_id);
CREATE INDEX idx_hcps_specialty ON hcps(specialty);
CREATE INDEX idx_hcps_potential ON hcps(potential);

-- Enable RLS
ALTER TABLE hcps ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own HCPs"
  ON hcps FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own HCPs"
  ON hcps FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own HCPs"
  ON hcps FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own HCPs"
  ON hcps FOR DELETE
  USING (auth.uid() = user_id);

-- Updated_at trigger (reuse function from profiles migration)
CREATE OR REPLACE TRIGGER hcps_updated_at
  BEFORE UPDATE ON hcps
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
