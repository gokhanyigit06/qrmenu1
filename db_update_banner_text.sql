-- Add banner text configuration columns
ALTER TABLE settings 
ADD COLUMN IF NOT EXISTS banner_overlay_visible BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS banner_tag TEXT DEFAULT 'FIRSAT',
ADD COLUMN IF NOT EXISTS banner_title TEXT DEFAULT 'Kampanya',
ADD COLUMN IF NOT EXISTS banner_subtitle TEXT DEFAULT '%20 İndirim';
