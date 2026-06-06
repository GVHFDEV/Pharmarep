-- Add channel to visits (type of contact)
ALTER TABLE visits ADD COLUMN IF NOT EXISTS channel TEXT DEFAULT NULL;

-- Add product_type to products (amostra vs material promocional)
ALTER TABLE products ADD COLUMN IF NOT EXISTS product_type TEXT DEFAULT 'amostra' CHECK (product_type IN ('amostra', 'material'));
