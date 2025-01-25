/*
  # Admin System Enhancements

  1. Changes
    - Add RLS policies for admin users to manage all tables
    - Add helper functions for admin operations
    - Add indexes for better query performance

  2. Security
    - Ensure admin users have full access to all tables
    - Maintain existing RLS policies for non-admin users
*/

-- Function to check if a user has admin access with caching
CREATE OR REPLACE FUNCTION has_admin_access()
RETURNS boolean AS $$
DECLARE
  admin_status boolean;
BEGIN
  -- Check if result is already cached in session
  admin_status := current_setting('app.is_admin', true)::boolean;
  IF admin_status IS NOT NULL THEN
    RETURN admin_status;
  END IF;

  -- If not cached, check admin status
  SELECT EXISTS (
    SELECT 1 FROM admin_users
    WHERE email = auth.email()
  ) INTO admin_status;

  -- Cache the result for this session
  PERFORM set_config('app.is_admin', admin_status::text, true);

  RETURN admin_status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add admin policies to all tables
CREATE POLICY "Admin users have full access to profiles"
ON profiles FOR ALL
USING (has_admin_access());

CREATE POLICY "Admin users have full access to occasions"
ON occasions FOR ALL
USING (has_admin_access());

CREATE POLICY "Admin users have full access to items"
ON items FOR ALL
USING (has_admin_access());

CREATE POLICY "Admin users have full access to access_requests"
ON access_requests FOR ALL
USING (has_admin_access());

CREATE POLICY "Admin users have full access to messages"
ON messages FOR ALL
USING (has_admin_access());

CREATE POLICY "Admin users have full access to group_purchases"
ON group_purchases FOR ALL
USING (has_admin_access());

CREATE POLICY "Admin users have full access to affiliate_settings"
ON affiliate_settings FOR ALL
USING (has_admin_access());

-- Add indexes for admin queries
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_username_trgm ON profiles USING gin(username gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_profiles_suspended ON profiles(suspended);
CREATE INDEX IF NOT EXISTS idx_profiles_verified ON profiles(verified);
CREATE INDEX IF NOT EXISTS idx_profiles_premium_member ON profiles(premium_member);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);

-- Function to get user statistics
CREATE OR REPLACE FUNCTION get_user_stats(days integer DEFAULT 30)
RETURNS TABLE (
  date date,
  new_users bigint
) AS $$
BEGIN
  RETURN QUERY
  WITH dates AS (
    SELECT generate_series(
      current_date - (days - 1)::interval,
      current_date,
      '1 day'::interval
    )::date AS date
  )
  SELECT
    d.date,
    COUNT(p.created_at)::bigint
  FROM dates d
  LEFT JOIN profiles p ON date_trunc('day', p.created_at::timestamp) = d.date
  GROUP BY d.date
  ORDER BY d.date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;