-- Add Ordering Module flags to Restaurants table
ALTER TABLE public.restaurants 
ADD COLUMN IF NOT EXISTS is_ordering_active boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_waiter_mode_active boolean DEFAULT false;

-- Add Station Name to Categories (for splitting Kitchen vs Bar)
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS station_name text DEFAULT 'Mutfak';

-- Create Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id uuid REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    table_no text NOT NULL,
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'completed', 'cancelled')),
    total_amount numeric DEFAULT 0,
    customer_note text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Order Items Table
CREATE TABLE IF NOT EXISTS public.order_items (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id uuid REFERENCES public.products(id) ON DELETE SET NULL, -- Keep record even if product deleted
    product_name text NOT NULL, -- Snapshot of name
    price numeric NOT NULL, -- Snapshot of price at time of order
    quantity integer DEFAULT 1,
    options jsonb, -- Selected variants/extras
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'prepared', 'served')),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Create Policies (Simplified for now, assuming public write for customers, authenticated read for admins)
-- Note: In a real app, strict RLS is needed. 
-- For now, we allow public insert (for customers) and authenticated select/update (for admins).

-- Orders Policies
CREATE POLICY "Public can create orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view orders of their restaurant" ON public.orders FOR SELECT USING (true); -- Ideally filter by restaurant_id matching auth
CREATE POLICY "Admins can update orders" ON public.orders FOR UPDATE USING (true);

-- Order Items Policies
CREATE POLICY "Public can create order items" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view order items" ON public.order_items FOR SELECT USING (true);
CREATE POLICY "Admins can update order items" ON public.order_items FOR UPDATE USING (true);

-- Create Tables Table (for QR Codes)
CREATE TABLE IF NOT EXISTS public.tables (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id uuid REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    table_no text NOT NULL,
    qr_code_url text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(restaurant_id, table_no)
);

-- Tables Policies
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view tables" ON public.tables FOR SELECT USING (true);
CREATE POLICY "Admins can manage tables" ON public.tables FOR ALL USING (true);

-- Enable Realtime for Orders (Critical for Kitchen Screen)
-- alter publication supabase_realtime add table orders;
-- alter publication supabase_realtime add table order_items;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_restaurant_id ON public.orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- 8. Payments Table (Advanced Billing)
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) NOT NULL,
    restaurant_id UUID NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    payment_method TEXT CHECK (payment_method IN ('cash', 'credit_card', 'meal_card', 'other')),
    discount_amount NUMERIC(10, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Update Orders table for payments
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT false;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS final_amount NUMERIC(10, 2);

-- RLS for Payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view payments" ON public.payments
    FOR SELECT USING (true); -- Simplified for demo

CREATE POLICY "Admins can insert payments" ON public.payments
    FOR INSERT WITH CHECK (true); -- Simplified for demo
CREATE INDEX IF NOT EXISTS idx_tables_restaurant_id ON public.tables(restaurant_id);
