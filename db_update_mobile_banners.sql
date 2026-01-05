-- Add mobile banner URLs column
ALTER TABLE settings ADD COLUMN IF NOT EXISTS mobile_banner_urls TEXT[] DEFAULT '{}';
