/*
  # Create Domains Management System

  ## Overview
  This migration sets up a complete domain marketplace database with admin-only write access
  and public read access for browsing available domains.

  ## 1. New Tables
    - `domains`
      - `id` (uuid, primary key) - Unique identifier for each domain
      - `name` (text, unique, required) - The domain name (e.g., "premium.com")
      - `price` (numeric, required) - Domain price in USD
      - `word_count` (integer) - Number of words in the domain
      - `category` (text) - Domain category (e.g., "Business", "Technology", "Finance")
      - `description` (text) - Optional description of the domain
      - `is_featured` (boolean, default false) - Flag for featured domains
      - `created_at` (timestamptz) - When the domain was added
      - `updated_at` (timestamptz) - Last update timestamp
    
    - `admin_users`
      - `id` (uuid, primary key) - References auth.users
      - `email` (text, required) - Admin email address
      - `created_at` (timestamptz) - When admin was added

  ## 2. Security
    - Enable RLS on both tables
    - Public read access for domains table (anyone can browse)
    - Admin-only write access for domains (insert, update, delete)
    - Admin users can only be managed by other admins

  ## 3. Important Notes
    - All users can search and view domains without authentication
    - Only authenticated admin users can modify domain data
    - CSV bulk upload will be handled through admin interface
    - Prices stored as numeric type for precise decimal handling
*/

-- Create domains table
CREATE TABLE IF NOT EXISTS domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  price numeric NOT NULL CHECK (price >= 0),
  word_count integer CHECK (word_count > 0),
  category text,
  description text,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Domains policies: Public read, admin-only write
CREATE POLICY "Anyone can view domains"
  ON domains FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert domains"
  ON domains FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Only admins can update domains"
  ON domains FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Only admins can delete domains"
  ON domains FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Admin users policies: Admins can manage other admins
CREATE POLICY "Admins can view all admin users"
  ON admin_users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Admins can add new admins"
  ON admin_users FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Admins can remove admins"
  ON admin_users FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_domains_category ON domains(category);
CREATE INDEX IF NOT EXISTS idx_domains_is_featured ON domains(is_featured);
CREATE INDEX IF NOT EXISTS idx_domains_price ON domains(price);
CREATE INDEX IF NOT EXISTS idx_domains_word_count ON domains(word_count);
CREATE INDEX IF NOT EXISTS idx_domains_name ON domains(name);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_domains_updated_at 
  BEFORE UPDATE ON domains 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
