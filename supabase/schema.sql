-- Run this entire file in Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS settings (id BIGSERIAL PRIMARY KEY, key TEXT UNIQUE NOT NULL, value JSONB NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS categories (id BIGSERIAL PRIMARY KEY, name TEXT NOT NULL, description TEXT, image_url TEXT, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS products (id BIGSERIAL PRIMARY KEY, code TEXT UNIQUE NOT NULL, name TEXT NOT NULL, description TEXT, price NUMERIC(10,2) NOT NULL CHECK (price >= 0), discount_price NUMERIC(10,2) CHECK (discount_price IS NULL OR (discount_price >= 0 AND discount_price <= price)), image_url TEXT, category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL, stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0), active BOOLEAN NOT NULL DEFAULT TRUE, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS cities (id BIGSERIAL PRIMARY KEY, name TEXT UNIQUE NOT NULL, delivery_fee NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (delivery_fee >= 0), created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS orders (id BIGSERIAL PRIMARY KEY, order_number TEXT UNIQUE NOT NULL, customer_name TEXT NOT NULL, customer_phone TEXT NOT NULL, customer_email TEXT, city_id BIGINT REFERENCES cities(id) ON DELETE RESTRICT, address TEXT NOT NULL, total_amount NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0), delivery_fee NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (delivery_fee >= 0), status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','shipped','completed','cancelled')), notes TEXT, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS order_items (id BIGSERIAL PRIMARY KEY, order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE, product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE RESTRICT, quantity INT NOT NULL CHECK (quantity > 0), price NUMERIC(10,2) NOT NULL CHECK (price >= 0), created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS admins (id BIGSERIAL PRIMARY KEY, user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, email TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW());

INSERT INTO settings(key,value) VALUES ('store_name','"فولتكس"'),('store_phone','""'),('store_email','""'),('store_description','""') ON CONFLICT(key) DO NOTHING;

ALTER TABLE settings ENABLE ROW LEVEL SECURITY; ALTER TABLE categories ENABLE ROW LEVEL SECURITY; ALTER TABLE products ENABLE ROW LEVEL SECURITY; ALTER TABLE cities ENABLE ROW LEVEL SECURITY; ALTER TABLE orders ENABLE ROW LEVEL SECURITY; ALTER TABLE order_items ENABLE ROW LEVEL SECURITY; ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$ SELECT EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid()) $$;
DROP POLICY IF EXISTS "public read active products" ON products; CREATE POLICY "public read active products" ON products FOR SELECT USING (active = true OR public.is_admin());
DROP POLICY IF EXISTS "public read categories" ON categories; CREATE POLICY "public read categories" ON categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "public read cities" ON cities; CREATE POLICY "public read cities" ON cities FOR SELECT USING (true);
DROP POLICY IF EXISTS "public create orders" ON orders; CREATE POLICY "public create orders" ON orders FOR INSERT WITH CHECK (status = 'pending');
DROP POLICY IF EXISTS "admin read orders" ON orders; CREATE POLICY "admin read orders" ON orders FOR SELECT USING (public.is_admin());
DROP POLICY IF EXISTS "public create order items" ON order_items; CREATE POLICY "public create order items" ON order_items FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_id AND orders.status = 'pending'));

CREATE POLICY "admins manage products" ON products FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admins manage categories" ON categories FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admins manage cities" ON cities FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admins manage settings" ON settings FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admins manage order items" ON order_items FOR SELECT USING (public.is_admin());
CREATE POLICY "admins manage admins" ON admins FOR SELECT USING (public.is_admin());

CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS TRIGGER LANGUAGE plpgsql AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$;
DO $$ DECLARE t TEXT; BEGIN FOREACH t IN ARRAY ARRAY['settings','categories','products','cities','orders'] LOOP EXECUTE format('DROP TRIGGER IF EXISTS %I_updated_at ON %I', t, t); EXECUTE format('CREATE TRIGGER %I_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at()', t, t); END LOOP; END $$;
