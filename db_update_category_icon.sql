-- Add icon column to categories table for small icons/stickers
ALTER TABLE categories ADD COLUMN IF NOT EXISTS icon TEXT;
