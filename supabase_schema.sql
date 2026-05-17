-- PostgreSQL tables for the application as requested

-- Enable RLS on all tables
ALTER TABLE IF EXISTS products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS flash_sale ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ai_training ENABLE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS website_settings ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE IF EXISTS website_settings ADD COLUMN IF NOT EXISTS banner_desktop TEXT;
ALTER TABLE IF EXISTS website_settings ADD COLUMN IF NOT EXISTS banner_mobile TEXT;

-- Website Settings Table
CREATE TABLE IF NOT EXISTS website_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    website_name TEXT DEFAULT 'IYABD',
    contact_email TEXT,
    contact_phone TEXT,
    address TEXT,
    logo_url TEXT,
    favicon_url TEXT,
    banner_desktop TEXT,
    banner_mobile TEXT,
    banner_title TEXT,
    banner_subtitle TEXT,
    whatsapp TEXT,
    bkash TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT one_row CHECK (id = 1)
);
ALTER TABLE website_settings ENABLE ROW LEVEL SECURITY;

-- Users Table (for profiles)
CREATE TABLE IF NOT EXISTS users (
    uid UUID PRIMARY KEY,
    email TEXT,
    display_name TEXT,
    photo_url TEXT,
    phone_number TEXT,
    address TEXT,
    coins INTEGER DEFAULT 0,
    registration_date TIMESTAMPTZ DEFAULT NOW(),
    division TEXT,
    district TEXT,
    area TEXT,
    street TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- POLICIES

-- Website Settings: Anyone can read, only authenticated can update (ideally restricted to admins)
CREATE POLICY "Public website settings are viewable by everyone" ON website_settings FOR SELECT USING (true);
CREATE POLICY "Admin can update website settings" ON website_settings FOR ALL USING (true); -- In production, restrict this!

-- Users: Users can read and update their own data
CREATE POLICY "Users can view their own profile" ON users FOR SELECT USING (auth.uid() = uid);
CREATE POLICY "Users can insert their own profile" ON users FOR INSERT WITH CHECK (auth.uid() = uid);
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.uid() = uid);

-- Products: Anyone can read, only authenticated can write
CREATE POLICY "Anyone can view products" ON products FOR SELECT USING (true);
CREATE POLICY "Admins can manage products" ON products FOR ALL USING (true);

-- Categories
CREATE POLICY "Anyone can view categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON categories FOR ALL USING (true);

-- Banners
CREATE POLICY "Anyone can view banners" ON banners FOR SELECT USING (true);
CREATE POLICY "Admins can manage banners" ON banners FOR ALL USING (true);

-- Orders
CREATE POLICY "Users can view their own orders" ON orders FOR SELECT USING (true); -- Should be restricted by customer_id
CREATE POLICY "Users can insert orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage orders" ON orders FOR ALL USING (true);

-- General catch-all for development (Allow everything if RLS is enabled but no specific policy matches)
-- Note: It is better to have specific policies as above.

-- Initial Default Row for settings
INSERT INTO website_settings (id, company_name)
VALUES (1, 'IYABD')
ON CONFLICT (id) DO UPDATE SET updated_at = NOW();

-- STORAGE POLICIES
-- Setup logos bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('logos', 'logos', true) 
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('website-assets', 'website-assets', true) 
ON CONFLICT (id) DO UPDATE SET public = true;

-- Specific user-requested policies for logos bucket
DROP POLICY IF EXISTS "Public Access Logos" ON storage.objects;
DROP POLICY IF EXISTS "Upload Logos" ON storage.objects;
DROP POLICY IF EXISTS "Update Logos" ON storage.objects;
DROP POLICY IF EXISTS "Delete Logos" ON storage.objects;

CREATE POLICY "Public Access Logos" ON storage.objects FOR SELECT USING ( bucket_id = 'logos' );
CREATE POLICY "Upload Logos" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'logos' );
CREATE POLICY "Update Logos" ON storage.objects FOR UPDATE USING ( bucket_id = 'logos' );
CREATE POLICY "Delete Logos" ON storage.objects FOR DELETE USING ( bucket_id = 'logos' );

-- Policies for website-assets bucket
CREATE POLICY "Public Access Assets" ON storage.objects FOR SELECT USING ( bucket_id = 'website-assets' );
CREATE POLICY "Upload Assets" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'website-assets' );
CREATE POLICY "Update Assets" ON storage.objects FOR UPDATE USING ( bucket_id = 'website-assets' );
CREATE POLICY "Delete Assets" ON storage.objects FOR DELETE USING ( bucket_id = 'website-assets' );

-- Products Table
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY, -- Changed from UUID to TEXT for Firebase compatibility
    name TEXT NOT NULL,
    slug TEXT,
    sku TEXT,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    discountPrice DECIMAL(10, 2),
    tax DECIMAL(10, 2) DEFAULT 0,
    category TEXT,
    subCategory TEXT,
    brand TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    stock INTEGER DEFAULT 0,
    lowStockAlert INTEGER DEFAULT 5,
    status TEXT DEFAULT 'active',
    video_url TEXT,
    featured BOOLEAN DEFAULT false,
    bestSeller BOOLEAN DEFAULT false,
    newArrival BOOLEAN DEFAULT false,
    image TEXT, -- Changed from image_url to image for service compatibility
    gallery JSONB DEFAULT '[]'::jsonb,
    variants JSONB DEFAULT '[]'::jsonb,
    sizes JSONB DEFAULT '[]'::jsonb,
    colors JSONB DEFAULT '[]'::jsonb,
    weight TEXT,
    dimensions JSONB,
    shippingClass TEXT,
    metaTitle TEXT,
    metaDescription TEXT,
    keywords TEXT,
    fabric_type TEXT,
    gsm TEXT,
    fit_type TEXT,
    wash_instruction TEXT,
    material TEXT,
    stretch_type TEXT,
    country TEXT,
    stitch_quality TEXT,
    rating DECIMAL(3, 2) DEFAULT 5.0,
    sold INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- STORAGE BUCKETS
INSERT INTO storage.buckets (id, name, public) 
VALUES ('products', 'products', true) 
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true) 
ON CONFLICT (id) DO UPDATE SET public = true;

-- POLICIES FOR PRODUCT-IMAGES BUCKET
CREATE POLICY "Public Access Product Images" ON storage.objects FOR SELECT USING ( bucket_id = 'product-images' );
CREATE POLICY "Upload Product Images" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'product-images' );
CREATE POLICY "Update Product Images" ON storage.objects FOR UPDATE USING ( bucket_id = 'product-images' );
CREATE POLICY "Delete Product Images" ON storage.objects FOR DELETE USING ( bucket_id = 'product-images' );

INSERT INTO storage.buckets (id, name, public) 
VALUES ('banners', 'banners', true) 
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('categories', 'categories', true) 
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-data', 'product-data', true) 
ON CONFLICT (id) DO UPDATE SET public = true;

-- POLICIES FOR PRODUCTS BUCKET
CREATE POLICY "Public Access Products" ON storage.objects FOR SELECT USING ( bucket_id = 'products' );
CREATE POLICY "Upload Products" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'products' );
CREATE POLICY "Update Products" ON storage.objects FOR UPDATE USING ( bucket_id = 'products' );
CREATE POLICY "Delete Products" ON storage.objects FOR DELETE USING ( bucket_id = 'products' );

-- POLICIES FOR BANNERS BUCKET
CREATE POLICY "Public Access Banners" ON storage.objects FOR SELECT USING ( bucket_id = 'banners' );
CREATE POLICY "Upload Banners" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'banners' );
CREATE POLICY "Update Banners" ON storage.objects FOR UPDATE USING ( bucket_id = 'banners' );
CREATE POLICY "Delete Banners" ON storage.objects FOR DELETE USING ( bucket_id = 'banners' );

-- POLICIES FOR CATEGORIES BUCKET
CREATE POLICY "Public Access Categories" ON storage.objects FOR SELECT USING ( bucket_id = 'categories' );
CREATE POLICY "Upload Categories" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'categories' );
CREATE POLICY "Update Categories" ON storage.objects FOR UPDATE USING ( bucket_id = 'categories' );
CREATE POLICY "Delete Categories" ON storage.objects FOR DELETE USING ( bucket_id = 'categories' );

-- POLICIES FOR PRODUCT-DATA BUCKET
CREATE POLICY "Public Access Product Data" ON storage.objects FOR SELECT USING ( bucket_id = 'product-data' );
CREATE POLICY "Upload Product Data" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'product-data' );
CREATE POLICY "Update Product Data" ON storage.objects FOR UPDATE USING ( bucket_id = 'product-data' );
CREATE POLICY "Delete Product Data" ON storage.objects FOR DELETE USING ( bucket_id = 'product-data' );

CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id TEXT UNIQUE NOT NULL,
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    address TEXT,
    profile_image TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id),
    total DECIMAL(10, 2) NOT NULL,
    shipping_status TEXT DEFAULT 'PENDING',
    payment_status TEXT DEFAULT 'UNPAID',
    payment_method TEXT,
    items JSONB NOT NULL,
    shipping_address JSONB,
    invoice_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    banner_image TEXT,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS flash_sale (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id),
    discount_percentage DECIMAL(5, 2) NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    discount_percentage DECIMAL(5, 2),
    discount_amount DECIMAL(10, 2),
    min_purchase DECIMAL(10, 2) DEFAULT 0,
    max_uses INTEGER,
    used_count INTEGER DEFAULT 0,
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS support_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id),
    message TEXT NOT NULL,
    reply TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    replied_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS ai_training (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic TEXT NOT NULL,
    knowledge_data TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT,
    subtitle TEXT,
    banner_url TEXT NOT NULL,
    redirect_url TEXT,
    type TEXT DEFAULT 'Hero Banner',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
