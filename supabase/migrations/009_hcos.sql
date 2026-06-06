-- Create HCOs (Health Care Organizations - Pharmacies) table
CREATE TABLE IF NOT EXISTS hcos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  crf TEXT NOT NULL,
  cnpj TEXT,
  email TEXT,
  phone TEXT,
  whatsapp TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  neighborhood TEXT,
  contact_person TEXT,
  category TEXT,
  potential INTEGER CHECK (potential IN (1, 2, 3)),
  notes TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, crf)
);

-- Indexes
CREATE INDEX idx_hcos_user_id ON hcos(user_id);
CREATE INDEX idx_hcos_active ON hcos(active);
CREATE INDEX idx_hcos_name ON hcos(name);

-- Enable RLS
ALTER TABLE hcos ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own hcos" ON hcos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own hcos" ON hcos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own hcos" ON hcos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own hcos" ON hcos FOR DELETE USING (auth.uid() = user_id);

-- Updated_at trigger
CREATE OR REPLACE TRIGGER hcos_updated_at
  BEFORE UPDATE ON hcos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
