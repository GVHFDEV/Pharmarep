-- Inventory transactions log (entries and exits)
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('entry', 'exit')),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  reason TEXT,
  visit_id UUID REFERENCES visits(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add 'purpose' column to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS purpose TEXT;

-- Indexes
CREATE INDEX idx_inv_transactions_user ON inventory_transactions(user_id);
CREATE INDEX idx_inv_transactions_product ON inventory_transactions(product_id);
CREATE INDEX idx_inv_transactions_created ON inventory_transactions(created_at DESC);

-- Enable RLS
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own transactions" ON inventory_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own transactions" ON inventory_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
