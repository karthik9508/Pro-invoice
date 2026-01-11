-- AI Invoice Maker - Complete Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- CUSTOMERS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);

-- ==========================================
-- INVOICES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue')),
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  tax_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
  total DECIMAL(12,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

-- ==========================================
-- INVOICE ITEMS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  amount DECIMAL(12,2) NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);

-- ==========================================
-- BUSINESS PROFILES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS business_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT,
  tax_id TEXT,
  website TEXT,
  invoice_template TEXT DEFAULT 'modern',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_business_profiles_user_id ON business_profiles(user_id);

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;

-- Customers policies
DROP POLICY IF EXISTS "Users can view their own customers" ON customers;
CREATE POLICY "Users can view their own customers"
  ON customers FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own customers" ON customers;
CREATE POLICY "Users can create their own customers"
  ON customers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own customers" ON customers;
CREATE POLICY "Users can update their own customers"
  ON customers FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own customers" ON customers;
CREATE POLICY "Users can delete their own customers"
  ON customers FOR DELETE
  USING (auth.uid() = user_id);

-- Invoices policies
DROP POLICY IF EXISTS "Users can view their own invoices" ON invoices;
CREATE POLICY "Users can view their own invoices"
  ON invoices FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own invoices" ON invoices;
CREATE POLICY "Users can create their own invoices"
  ON invoices FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own invoices" ON invoices;
CREATE POLICY "Users can update their own invoices"
  ON invoices FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own invoices" ON invoices;
CREATE POLICY "Users can delete their own invoices"
  ON invoices FOR DELETE
  USING (auth.uid() = user_id);

-- Invoice items policies
DROP POLICY IF EXISTS "Users can view items of their own invoices" ON invoice_items;
CREATE POLICY "Users can view items of their own invoices"
  ON invoice_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM invoices 
      WHERE invoices.id = invoice_items.invoice_id 
      AND invoices.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create items for their own invoices" ON invoice_items;
CREATE POLICY "Users can create items for their own invoices"
  ON invoice_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM invoices 
      WHERE invoices.id = invoice_items.invoice_id 
      AND invoices.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update items of their own invoices" ON invoice_items;
CREATE POLICY "Users can update items of their own invoices"
  ON invoice_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM invoices 
      WHERE invoices.id = invoice_items.invoice_id 
      AND invoices.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete items of their own invoices" ON invoice_items;
CREATE POLICY "Users can delete items of their own invoices"
  ON invoice_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM invoices 
      WHERE invoices.id = invoice_items.invoice_id 
      AND invoices.user_id = auth.uid()
    )
  );

-- Business profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON business_profiles;
CREATE POLICY "Users can view their own profile"
  ON business_profiles FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own profile" ON business_profiles;
CREATE POLICY "Users can create their own profile"
  ON business_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own profile" ON business_profiles;
CREATE POLICY "Users can update their own profile"
  ON business_profiles FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own profile" ON business_profiles;
CREATE POLICY "Users can delete their own profile"
  ON business_profiles FOR DELETE
  USING (auth.uid() = user_id);

-- ==========================================
-- SUBSCRIPTIONS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  razorpay_customer_id TEXT,
  razorpay_subscription_id TEXT,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due')),
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_razorpay_subscription_id ON subscriptions(razorpay_subscription_id);

-- Subscriptions policies
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own subscription" ON subscriptions;
CREATE POLICY "Users can view their own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own subscription" ON subscriptions;
CREATE POLICY "Users can create their own subscription"
  ON subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own subscription" ON subscriptions;
CREATE POLICY "Users can update their own subscription"
  ON subscriptions FOR UPDATE
  USING (auth.uid() = user_id);
