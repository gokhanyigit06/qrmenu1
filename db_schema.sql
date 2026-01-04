-- 1. Enable UUID extension
create extension if not exists "uuid-ossp";

-- 2. Categories Table
create table categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  name_en text,
  slug text,
  image text,
  description text,
  badge text,
  discount_rate int,
  sort_order int default 0,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Products Table
create table products (
  id uuid default uuid_generate_v4() primary key,
  category_id uuid references categories(id) on delete set null,
  name text not null,
  name_en text,
  description text,
  description_en text,
  price decimal(10,2) not null,
  discount_price decimal(10,2),
  image text,
  badge text,
  tags jsonb default '[]'::jsonb, -- Stores tags like [{id:1, name:'Spicy'}]
  allergens text[] default array[]::text[],
  variants jsonb default '[]'::jsonb, -- Stores variants like [{name:'Porsiyon', price:100}]
  sort_order int default 0,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Settings Table (For single tenant app)
create table settings (
  id int primary key default 1, -- Only one row
  theme_color text default 'black',
  dark_mode boolean default false,
  banner_active boolean default true,
  banner_urls text[] default array['https://images.unsplash.com/photo-1504674900247-0877df9cc836'],
  popup_active boolean default false,
  popup_url text,
  logo_url text,
  logo_width int default 150,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Insert Initial Settings Row
insert into settings (id, theme_color) values (1, 'black') on conflict (id) do nothing;

-- 6. Setup Storage Buckets (Run this part separately if needed, but SQL usually can't create buckets directly in standard PostgreSQL, Supabase handles this via API or Dashboard. 
-- However, we can create policies if the bucket exists.)
-- We will assume a bucket named 'menu-assets' exists.

-- 7. Row Level Security (RLS) Policies
-- Enable RLS
alter table categories enable row level security;
alter table products enable row level security;
alter table settings enable row level security;

-- Create Policies (Public Read, Authenticated Write)
-- Categories
create policy "Public categories are viewable by everyone" on categories for select using (true);
create policy "Users can insert categories" on categories for insert with check (true); -- For dev simplicity, usually allow only auth
create policy "Users can update categories" on categories for update using (true);
create policy "Users can delete categories" on categories for delete using (true);

-- Products
create policy "Public products are viewable by everyone" on products for select using (true);
create policy "Users can insert products" on products for insert with check (true);
create policy "Users can update products" on products for update using (true);
create policy "Users can delete products" on products for delete using (true);

-- Settings
create policy "Public settings are viewable by everyone" on settings for select using (true);
create policy "Users can update settings" on settings for update using (true);

-- --- ANALYTICS & TRACKING ---

-- 1. Create the table
CREATE TABLE IF NOT EXISTS analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  event_type TEXT DEFAULT 'view',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  meta JSONB
);

-- 2. Create Index for faster querying
CREATE INDEX IF NOT EXISTS idx_analytics_restaurant_date ON analytics(restaurant_id, created_at);

-- 3. IMPORTANT: Enable RLS (Security)
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- 4. Allow ANONYMOUS users (visitors) to INSERT (track views)
CREATE POLICY "Enable insert for everyone" 
ON analytics FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- 5. Allow reading stats
CREATE POLICY "Enable select for everyone" 
ON analytics FOR SELECT 
TO anon, authenticated 
USING (true);

-- --- CUSTOM DOMAIN SUPPORT ---
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS custom_domain TEXT UNIQUE;
CREATE INDEX IF NOT EXISTS idx_restaurants_custom_domain ON restaurants(custom_domain);
