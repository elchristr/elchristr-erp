-- Supabase Schema for ELIE GROUP INVENTORY

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Products Table
CREATE TABLE products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  sku TEXT NOT NULL UNIQUE,
  purchase_price NUMERIC(10, 2) NOT NULL,
  selling_price NUMERIC(10, 2) NOT NULL,
  current_stock INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('Active', 'Inactive')),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Contributors Table (Investment Pool)
CREATE TABLE contributors (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  reference_id TEXT NOT NULL UNIQUE,
  amount_available NUMERIC(10, 2) NOT NULL DEFAULT 0,
  amount_used NUMERIC(10, 2) NOT NULL DEFAULT 0,
  date_added DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Purchases Table
CREATE TABLE purchases (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  po_number TEXT NOT NULL UNIQUE,
  supplier_name TEXT NOT NULL,
  date DATE NOT NULL,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  total_cost NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Pending', 'Completed')),
  funding_source TEXT NOT NULL CHECK (funding_source IN ('Business Cash', 'Investment Pool')),
  contributor_id UUID REFERENCES contributors(id),
  receipt_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Sales Table
CREATE TABLE sales (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  selling_price NUMERIC(10, 2) NOT NULL,
  profit NUMERIC(10, 2) NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Invoices Table
CREATE TABLE invoices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  invoice_number TEXT NOT NULL UNIQUE,
  sale_id UUID NOT NULL REFERENCES sales(id),
  customer_name TEXT NOT NULL,
  date DATE NOT NULL,
  total NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Expenses Table
CREATE TABLE expenses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('Transport', 'Fuel', 'Packaging', 'Warehouse', 'Marketing', 'Repairs', 'Internet', 'Electricity', 'Other')),
  amount NUMERIC(10, 2) NOT NULL,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributors ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Allow authenticated users full access to products" ON products FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated users full access to contributors" ON contributors FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated users full access to purchases" ON purchases FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated users full access to sales" ON sales FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated users full access to invoices" ON invoices FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated users full access to expenses" ON expenses FOR ALL TO authenticated USING (true) WITH CHECK (true);
