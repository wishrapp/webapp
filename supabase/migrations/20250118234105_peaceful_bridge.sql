/*
  # Admin System Fixes

  1. Changes
    - Drop existing policies that depend on has_admin_access()
    - Drop has_admin_access() function
    - Create new is_admin() function
    - Add admin dashboard view
    - Recreate policies using new is_admin() function

  2. Security
    - Maintain existing security model
    - Add additional checks for admin access
*/

-- First drop all policies that depend on has_admin_access()
DROP POLICY IF EXISTS "Admin users have full access to profiles" ON profiles;
DROP POLICY IF EXISTS "Admin users have full access to occasions" ON occasions;
DROP POLICY IF EXISTS "Admin users have full access to items" ON items;
DROP POLICY IF EXISTS "Admin users have full access to access_requests" ON access_requests;
DROP POLICY IF EXISTS "Admin users have full access to messages" ON messages;
DROP POLICY IF EXISTS "Admin users have full access to group_purchases" ON group_purchases;
DROP POLICY IF EXISTS "Admin users have full access to affiliate_settings" ON affiliate_settings;

-- Now we can safely drop the function
DROP FUNCTION IF EXISTS has_admin_access();

-- Create a simpler is_admin function that doesn't rely on session variables
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE email = auth.email()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a view for admin dashboard statistics
CREATE OR REPLACE VIEW admin_dashboard_stats AS
SELECT
  (SELECT COUNT(*) FROM profiles) as total_users,
  (SELECT COUNT(*) FROM profiles WHERE verified = true) as verified_users,
  (SELECT COUNT(*) FROM profiles WHERE premium_member = true) as premium_users,
  (SELECT COUNT(*) FROM profiles WHERE suspended = true) as suspended_users,
  (SELECT COUNT(*) FROM profiles WHERE reported = true) as reported_users,
  (SELECT COUNT(*) FROM profiles WHERE created_at > NOW() - INTERVAL '24 hours') as new_users_24h,
  (SELECT COUNT(*) FROM profiles WHERE created_at > NOW() - INTERVAL '7 days') as new_users_7d,
  (SELECT COUNT(*) FROM profiles WHERE created_at > NOW() - INTERVAL '30 days') as new_users_30d;

-- Grant access to admin dashboard stats view
GRANT SELECT ON admin_dashboard_stats TO authenticated;

-- Recreate admin policies using the simpler is_admin() function
CREATE POLICY "Admin users have full access to profiles"
ON profiles FOR ALL
USING (is_admin());

CREATE POLICY "Admin users have full access to occasions"
ON occasions FOR ALL
USING (is_admin());

CREATE POLICY "Admin users have full access to items"
ON items FOR ALL
USING (is_admin());

CREATE POLICY "Admin users have full access to access_requests"
ON access_requests FOR ALL
USING (is_admin());

CREATE POLICY "Admin users have full access to messages"
ON messages FOR ALL
USING (is_admin());

CREATE POLICY "Admin users have full access to group_purchases"
ON group_purchases FOR ALL
USING (is_admin());

CREATE POLICY "Admin users have full access to affiliate_settings"
ON affiliate_settings FOR ALL
USING (is_admin());