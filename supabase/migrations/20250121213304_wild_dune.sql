-- Drop existing policies for profiles table
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON profiles;
DROP POLICY IF EXISTS "Admin users can manage profiles" ON profiles;
DROP POLICY IF EXISTS "Admin users have full access to profiles" ON profiles;

-- Create new policies with proper access control
CREATE POLICY "Profiles are viewable by everyone"
ON profiles FOR SELECT
USING (true);

CREATE POLICY "Users can create their own profile"
ON profiles FOR INSERT
WITH CHECK (
  auth.uid() = id OR 
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = profiles.id
  )
);

CREATE POLICY "Users can modify their own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can remove their own profile"
ON profiles FOR DELETE
USING (auth.uid() = id);

CREATE POLICY "Admins have full profile access"
ON profiles
USING (is_admin());

-- Add rate limiting function
CREATE OR REPLACE FUNCTION check_email_rate_limit(user_email text)
RETURNS boolean AS $$
DECLARE
  recent_attempts integer;
BEGIN
  -- Count attempts in the last hour
  SELECT COUNT(*)
  INTO recent_attempts
  FROM auth.users
  WHERE email = user_email
  AND created_at > NOW() - INTERVAL '1 hour';

  -- Allow up to 3 attempts per hour
  RETURN recent_attempts < 3;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;