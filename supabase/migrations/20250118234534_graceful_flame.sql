/*
  # Fix Admin Users Policies

  1. Changes
    - Drop existing policies on admin_users table
    - Create new non-recursive policies
    - Ensure proper access control for admin users

  2. Security
    - Allow authenticated users to view admin_users
    - Allow admin users to manage admin_users without recursion
*/

-- First drop existing policies
DROP POLICY IF EXISTS "Authenticated users can view admin users" ON admin_users;
DROP POLICY IF EXISTS "Admin users can manage admin users" ON admin_users;

-- Create new policies without recursion
CREATE POLICY "Anyone can view admin users"
ON admin_users FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admin users can insert"
ON admin_users FOR INSERT
WITH CHECK (auth.email() IN (SELECT email FROM admin_users));

CREATE POLICY "Admin users can update"
ON admin_users FOR UPDATE
USING (auth.email() IN (SELECT email FROM admin_users));

CREATE POLICY "Admin users can delete"
ON admin_users FOR DELETE
USING (auth.email() IN (SELECT email FROM admin_users));