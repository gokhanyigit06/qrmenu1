-- Add styling columns to settings table
ALTER TABLE settings ADD COLUMN IF NOT EXISTS category_font_size TEXT DEFAULT 'large'; -- medium, large, xl
ALTER TABLE settings ADD COLUMN IF NOT EXISTS category_font_weight TEXT DEFAULT 'black'; -- normal, bold, black
ALTER TABLE settings ADD COLUMN IF NOT EXISTS category_row_height TEXT DEFAULT 'medium'; -- small, medium, large
ALTER TABLE settings ADD COLUMN IF NOT EXISTS category_gap TEXT DEFAULT 'medium'; -- small, medium, large
