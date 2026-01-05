-- QR Menu Database Sync Script
-- This script contains ALL recent column additions.
-- It uses 'IF NOT EXISTS' so it is safe to run multiple times.

-- 1. Category Styling Columns
ALTER TABLE settings ADD COLUMN IF NOT EXISTS category_font_size TEXT DEFAULT 'large';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS category_font_weight TEXT DEFAULT 'black';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS category_row_height TEXT DEFAULT 'medium';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS category_gap TEXT DEFAULT 'medium';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS category_overlay_opacity INTEGER DEFAULT 50;

-- 2. Mobile Banner Column
ALTER TABLE settings ADD COLUMN IF NOT EXISTS mobile_banner_urls TEXT[] DEFAULT '{}';

-- 3. Banner Text Configuration Columns
ALTER TABLE settings ADD COLUMN IF NOT EXISTS banner_overlay_visible BOOLEAN DEFAULT true;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS banner_tag TEXT DEFAULT 'FIRSAT';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS banner_title TEXT DEFAULT 'Kampanya';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS banner_subtitle TEXT DEFAULT '%20 İndirim';

-- 4. Product Card Styling Columns (NEW)
ALTER TABLE settings ADD COLUMN IF NOT EXISTS product_title_color TEXT DEFAULT '#111827';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS product_description_color TEXT DEFAULT '#6b7280';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS product_price_color TEXT DEFAULT '#d97706';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS product_title_size TEXT DEFAULT 'large';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS product_description_size TEXT DEFAULT 'medium';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS product_price_size TEXT DEFAULT 'large';

-- 5. Custom Domain
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS custom_domain TEXT;
