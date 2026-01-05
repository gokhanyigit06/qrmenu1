-- Add overlay opacity setting
ALTER TABLE settings ADD COLUMN IF NOT EXISTS category_overlay_opacity INT DEFAULT 50; -- 0 to 100
