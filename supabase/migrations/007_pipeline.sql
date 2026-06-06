-- Create Pipeline Deals table
CREATE TABLE IF NOT EXISTS pipeline_deals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  hcp_id UUID REFERENCES hcps(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  stage TEXT DEFAULT 'prospeccao' CHECK (stage IN ('prospeccao', 'primeiro_contato', 'visita_agendada', 'em_relacionamento', 'convertido', 'perdido')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  notes TEXT,
  expected_close TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_pipeline_deals_user_id ON pipeline_deals(user_id);
CREATE INDEX idx_pipeline_deals_stage ON pipeline_deals(stage);

-- Enable RLS
ALTER TABLE pipeline_deals ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own pipeline_deals" ON pipeline_deals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own pipeline_deals" ON pipeline_deals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own pipeline_deals" ON pipeline_deals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own pipeline_deals" ON pipeline_deals FOR DELETE USING (auth.uid() = user_id);

-- Updated_at trigger
CREATE OR REPLACE TRIGGER pipeline_deals_updated_at
  BEFORE UPDATE ON pipeline_deals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
