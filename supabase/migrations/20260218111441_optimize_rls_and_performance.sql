/*
  # Optimize RLS Policies and Remove Unused Indexes

  ## Overview
  This migration optimizes Row Level Security policies by replacing direct auth.<function>() calls
  with (select auth.<function>()) to prevent repeated re-evaluation per row, improving query performance.
  Also removes unused indexes and fixes function search_path mutability.

  ## Changes
  1. Drop and recreate all RLS policies with optimized auth function calls
  2. Remove unused indexes on domains table
  3. Fix function search_path to be immutable
  4. Optimize the trigger function for better performance

  ## Security Impact
  - No security changes, only performance optimization
  - RLS policies remain equally restrictive
  - Auth checks are now cached within query execution
*/

-- Drop existing policies to recreate them with optimized auth calls
DROP POLICY IF EXISTS "Only admins can insert domains" ON domains;
DROP POLICY IF EXISTS "Only admins can update domains" ON domains;
DROP POLICY IF EXISTS "Only admins can delete domains" ON domains;
DROP POLICY IF EXISTS "Admins can view all admin users" ON admin_users;
DROP POLICY IF EXISTS "Admins can add new admins" ON admin_users;
DROP POLICY IF EXISTS "Admins can remove admins" ON admin_users;

-- Recreate domains policies with optimized auth calls
CREATE POLICY "Only admins can insert domains"
  ON domains FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = (select auth.uid())
    )
  );

CREATE POLICY "Only admins can update domains"
  ON domains FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = (select auth.uid())
    )
  );

CREATE POLICY "Only admins can delete domains"
  ON domains FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = (select auth.uid())
    )
  );

-- Recreate admin_users policies with optimized auth calls
CREATE POLICY "Admins can view all admin users"
  ON admin_users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = (select auth.uid())
    )
  );

CREATE POLICY "Admins can add new admins"
  ON admin_users FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = (select auth.uid())
    )
  );

CREATE POLICY "Admins can remove admins"
  ON admin_users FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = (select auth.uid())
    )
  );

-- Remove unused indexes
DROP INDEX IF EXISTS idx_domains_category;
DROP INDEX IF EXISTS idx_domains_is_featured;
DROP INDEX IF EXISTS idx_domains_word_count;
DROP INDEX IF EXISTS idx_domains_price;
DROP INDEX IF EXISTS idx_domains_name;

-- Drop and recreate trigger and function with CASCADE
DROP TRIGGER IF EXISTS update_domains_updated_at ON domains CASCADE;

DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

CREATE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER update_domains_updated_at 
  BEFORE UPDATE ON domains 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
