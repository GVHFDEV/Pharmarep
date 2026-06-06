-- Create visits table
CREATE TABLE IF NOT EXISTS visits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  hcp_id UUID REFERENCES hcps(id) ON DELETE CASCADE NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
  rating TEXT CHECK (rating IN ('great', 'good', 'neutral', 'bad')),
  notes TEXT,
  duration_minutes INTEGER,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_visits_user_id ON visits(user_id);
CREATE INDEX idx_visits_hcp_id ON visits(hcp_id);
CREATE INDEX idx_visits_scheduled_at ON visits(scheduled_at);
CREATE INDEX idx_visits_status ON visits(status);

-- Enable RLS
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own visits" ON visits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own visits" ON visits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own visits" ON visits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own visits" ON visits FOR DELETE USING (auth.uid() = user_id);

-- Updated_at trigger
CREATE OR REPLACE TRIGGER visits_updated_at
  BEFORE UPDATE ON visits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
