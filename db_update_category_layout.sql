-- Add layout_mode column to categories table
-- Options: 'grid' (default with images), 'list' (no images, variants list), 'list-no-image' (simple list no image)
ALTER TABLE categories ADD COLUMN IF NOT EXISTS layout_mode TEXT DEFAULT 'grid';
