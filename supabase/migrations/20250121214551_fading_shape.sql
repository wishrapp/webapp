-- First drop all existing profile policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can modify their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can remove their own profile" ON profiles;
DROP POLICY IF EXISTS "Admin users have full access to profiles" ON profiles;
DROP POLICY IF EXISTS "Admin users can manage profiles" ON profiles;
DROP POLICY IF EXISTS "Admins have full profile access" ON profiles;
DROP POLICY IF EXISTS "allow_public_profiles_select" ON profiles;
DROP POLICY IF EXISTS "allow_user_profile_insert" ON profiles;
DROP POLICY IF EXISTS "allow_user_profile_update" ON profiles;
DROP POLICY IF EXISTS "allow_user_profile_delete" ON profiles;
DROP POLICY IF EXISTS "allow_admin_full_access" ON profiles;

-- Create new policies with proper access control
CREATE POLICY "profiles_allow_select"
ON profiles FOR SELECT
USING (true);

CREATE POLICY "profiles_allow_insert"
ON profiles FOR INSERT
WITH CHECK (
  auth.uid() = id AND
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = id
    AND email = profiles.email
  )
);

CREATE POLICY "profiles_allow_update"
ON profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_allow_delete"
ON profiles FOR DELETE
USING (auth.uid() = id);

CREATE POLICY "profiles_allow_admin"
ON profiles
USING (is_admin());

-- Add index to improve email lookup performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Add trigger to ensure email matches auth.users
CREATE OR REPLACE FUNCTION verify_profile_email()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = NEW.id 
    AND email = NEW.email
  ) THEN
    RAISE EXCEPTION 'Profile email must match auth.users email';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS verify_profile_email_trigger ON profiles;

-- Create new trigger
CREATE TRIGGER verify_profile_email_trigger
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION verify_profile_email();