-- Add product card styling columns
ALTER TABLE settings ADD COLUMN IF NOT EXISTS product_title_color TEXT DEFAULT '#111827'; -- gray-900
ALTER TABLE settings ADD COLUMN IF NOT EXISTS product_description_color TEXT DEFAULT '#6b7280'; -- gray-500
ALTER TABLE settings ADD COLUMN IF NOT EXISTS product_price_color TEXT DEFAULT '#d97706'; -- amber-600
ALTER TABLE settings ADD COLUMN IF NOT EXISTS product_title_size TEXT DEFAULT 'large'; -- medium, large, xl
ALTER TABLE settings ADD COLUMN IF NOT EXISTS product_description_size TEXT DEFAULT 'medium'; -- small, medium, large
ALTER TABLE settings ADD COLUMN IF NOT EXISTS product_price_size TEXT DEFAULT 'large'; -- medium, large, xl
