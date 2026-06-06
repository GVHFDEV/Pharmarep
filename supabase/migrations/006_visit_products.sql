-- Create visit_products table (products promoted during a visit)
CREATE TABLE IF NOT EXISTS visit_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  visit_id UUID REFERENCES visits(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  samples_delivered INTEGER DEFAULT 0,
  notes TEXT
);

-- Enable RLS
ALTER TABLE visit_products ENABLE ROW LEVEL SECURITY;

-- RLS Policy: access via join with visits table
CREATE POLICY "Users can view own visit_products"
  ON visit_products FOR SELECT
  USING (EXISTS (SELECT 1 FROM visits WHERE visits.id = visit_products.visit_id AND visits.user_id = auth.uid()));

CREATE POLICY "Users can create own visit_products"
  ON visit_products FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM visits WHERE visits.id = visit_products.visit_id AND visits.user_id = auth.uid()));

CREATE POLICY "Users can update own visit_products"
  ON visit_products FOR UPDATE
  USING (EXISTS (SELECT 1 FROM visits WHERE visits.id = visit_products.visit_id AND visits.user_id = auth.uid()));

CREATE POLICY "Users can delete own visit_products"
  ON visit_products FOR DELETE
  USING (EXISTS (SELECT 1 FROM visits WHERE visits.id = visit_products.visit_id AND visits.user_id = auth.uid()));
