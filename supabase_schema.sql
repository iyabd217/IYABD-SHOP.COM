-- Run this script in the Supabase SQL Editor to create the required tables

-- Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uid UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    "displayName" TEXT,
    "photoURL" TEXT,
    "phoneNumber" TEXT,
    address TEXT,
    division TEXT,
    district TEXT,
    area TEXT,
    street TEXT,
    coins INTEGER DEFAULT 0,
    "registrationDate" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    "discountPrice" NUMERIC,
    image TEXT,
    category TEXT,
    rating NUMERIC DEFAULT 0,
    reviews INTEGER DEFAULT 0,
    colors TEXT[],
    sizes TEXT[],
    "isNew" BOOLEAN DEFAULT false,
    "isTrending" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    image TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" TEXT, -- Can be 'guest' or a UUID
    items JSONB NOT NULL,
    total NUMERIC NOT NULL,
    subtotal NUMERIC NOT NULL,
    address TEXT NOT NULL,
    phone TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "deliveryMethod" TEXT,
    "deliveryFee" NUMERIC,
    "userEmail" TEXT,
    status TEXT DEFAULT 'Pending',
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) policies
-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create policies (modify for stricter production use)
-- Public read access for products and categories
CREATE POLICY "Public products are viewable by everyone" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public categories are viewable by everyone" ON public.categories FOR SELECT USING (true);

-- Allow anyone (including guests) to create orders
CREATE POLICY "Anyone can insert orders" ON public.orders FOR INSERT WITH CHECK (true);

-- Users can view their own orders
CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING (
  auth.uid()::text = "userId" 
  OR "userId" = 'guest'
);

-- Users can manage their own profile
CREATE POLICY "Users can manage their own profile" ON public.users FOR ALL USING (auth.uid() = uid);

-- Note:
-- To allow admins to manage everything, you'd want to add admin policies,
-- or handle admin actions through a secure backend or Supabase service role.
-- For local development/testing, you can optionally disable RLS:
-- ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
