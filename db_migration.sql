-- Add allergens and variants columns to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS allergens text[] default array[]::text[];
ALTER TABLE products ADD COLUMN IF NOT EXISTS variants jsonb default '[]'::jsonb;
