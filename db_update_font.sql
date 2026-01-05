-- Add font family column
ALTER TABLE settings ADD COLUMN IF NOT EXISTS font_family TEXT DEFAULT 'Inter';
