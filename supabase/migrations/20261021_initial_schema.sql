-- ==============================================================================
-- RESTORAN & ADİSYON İŞLETİM SİSTEMİ (BESPOKE POS & MANAGEMENT OS)
-- SUPABASE POSTGRESQL SCHEMA MIGRATION
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. SECTIONS (Salonlar)
CREATE TABLE IF NOT EXISTS public.sections (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    display_order INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLES (Masalar)
CREATE TABLE IF NOT EXISTS public.tables (
    id TEXT PRIMARY KEY,
    table_number TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    section_id TEXT REFERENCES public.sections(id) ON DELETE CASCADE,
    capacity INT NOT NULL DEFAULT 4,
    status TEXT NOT NULL DEFAULT 'empty', -- 'empty', 'occupied', 'bill_requested', 'reserved', 'cleaning'
    pos_x FLOAT NOT NULL DEFAULT 0,
    pos_y FLOAT NOT NULL DEFAULT 0,
    pos_z FLOAT NOT NULL DEFAULT 0,
    shape TEXT NOT NULL DEFAULT 'rect', -- 'round', 'rect'
    current_order_id TEXT,
    seated_at TIMESTAMPTZ,
    guest_count INT,
    waiter_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CATEGORIES (Kategoriler)
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT,
    color TEXT,
    display_order INT DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. MENU ITEMS (Menü Ürünleri)
CREATE TABLE IF NOT EXISTS public.menu_items (
    id TEXT PRIMARY KEY,
    category_id TEXT REFERENCES public.categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    station TEXT NOT NULL DEFAULT 'hot_kitchen', -- 'hot_kitchen', 'cold_kitchen', 'bar', 'pastry'
    prep_time_minutes INT DEFAULT 10,
    calories INT,
    allergens TEXT[],
    is_available BOOLEAN DEFAULT TRUE,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. STAFF (Personel)
CREATE TABLE IF NOT EXISTS public.staff (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    pin TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'waiter', -- 'waiter', 'cashier', 'chef', 'manager'
    avatar_bg TEXT DEFAULT 'bg-emerald-600',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ORDERS (Adisyonlar)
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    table_id TEXT REFERENCES public.tables(id) ON DELETE SET NULL,
    table_number TEXT NOT NULL,
    section_id TEXT,
    waiter_id TEXT REFERENCES public.staff(id) ON DELETE SET NULL,
    waiter_name TEXT NOT NULL,
    guest_count INT DEFAULT 2,
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0,
    discount_rate NUMERIC(5, 2) DEFAULT 0,
    discount_amount NUMERIC(10, 2) DEFAULT 0,
    cover_charge NUMERIC(10, 2) DEFAULT 0,
    tax_rate NUMERIC(5, 2) DEFAULT 10,
    total NUMERIC(10, 2) NOT NULL DEFAULT 0,
    paid_amount NUMERIC(10, 2) DEFAULT 0,
    remaining_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'open', -- 'open', 'paid', 'cancelled'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    closed_at TIMESTAMPTZ
);

-- 7. ORDER ITEMS (Adisyon Satırları)
CREATE TABLE IF NOT EXISTS public.order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT REFERENCES public.orders(id) ON DELETE CASCADE,
    menu_item_id TEXT REFERENCES public.menu_items(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    selected_modifiers JSONB DEFAULT '[]'::JSONB,
    special_note TEXT,
    station TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'preparing', 'ready', 'served', 'cancelled'
    is_gift BOOLEAN DEFAULT FALSE,
    added_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. PAYMENTS (Ödemeler)
CREATE TABLE IF NOT EXISTS public.payments (
    id TEXT PRIMARY KEY,
    order_id TEXT REFERENCES public.orders(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    method TEXT NOT NULL, -- 'cash', 'credit_card', 'meal_voucher', 'online'
    tip_amount NUMERIC(10, 2) DEFAULT 0,
    note TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 9. INVENTORY (Stok Hammaddeleri)
CREATE TABLE IF NOT EXISTS public.inventory_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    unit TEXT NOT NULL, -- 'kg', 'gr', 'lt', 'ml', 'adet'
    current_stock NUMERIC(10, 3) NOT NULL DEFAULT 0,
    critical_stock NUMERIC(10, 3) NOT NULL DEFAULT 0,
    cost_per_unit NUMERIC(10, 2) NOT NULL DEFAULT 0,
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- 10. RECIPES (Reçeteler)
CREATE TABLE IF NOT EXISTS public.recipes (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    menu_item_id TEXT REFERENCES public.menu_items(id) ON DELETE CASCADE,
    inventory_item_id TEXT REFERENCES public.inventory_items(id) ON DELETE CASCADE,
    amount NUMERIC(10, 3) NOT NULL,
    unit TEXT NOT NULL
);

-- 11. Z REPORTS (Gün Sonu Z Raporları)
CREATE TABLE IF NOT EXISTS public.z_reports (
    id TEXT PRIMARY KEY,
    report_number TEXT NOT NULL UNIQUE,
    opened_at TIMESTAMPTZ NOT NULL,
    closed_at TIMESTAMPTZ NOT NULL,
    cash_total NUMERIC(10, 2) DEFAULT 0,
    credit_card_total NUMERIC(10, 2) DEFAULT 0,
    meal_voucher_total NUMERIC(10, 2) DEFAULT 0,
    discount_total NUMERIC(10, 2) DEFAULT 0,
    total_vat NUMERIC(10, 2) DEFAULT 0,
    grand_total NUMERIC(10, 2) DEFAULT 0,
    total_orders_count INT DEFAULT 0,
    total_guests_count INT DEFAULT 0,
    category_sales JSONB DEFAULT '[]'::JSONB,
    waiter_sales JSONB DEFAULT '[]'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.z_reports ENABLE ROW LEVEL SECURITY;

-- Allow public read/write for demo and authenticated operations
CREATE POLICY "Public read/write on sections" ON public.sections FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public read/write on tables" ON public.tables FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public read/write on categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public read/write on menu_items" ON public.menu_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public read/write on staff" ON public.staff FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public read/write on orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public read/write on order_items" ON public.order_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public read/write on payments" ON public.payments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public read/write on inventory_items" ON public.inventory_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public read/write on recipes" ON public.recipes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public read/write on z_reports" ON public.z_reports FOR ALL USING (true) WITH CHECK (true);
