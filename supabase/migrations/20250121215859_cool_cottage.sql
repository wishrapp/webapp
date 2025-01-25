-- Drop existing profile policies
DROP POLICY IF EXISTS "profiles_allow_select" ON profiles;
DROP POLICY IF EXISTS "profiles_allow_insert" ON profiles;
DROP POLICY IF EXISTS "profiles_allow_update" ON profiles;
DROP POLICY IF EXISTS "profiles_allow_delete" ON profiles;
DROP POLICY IF EXISTS "profiles_allow_admin" ON profiles;

-- Create new policies with proper access control
CREATE POLICY "profiles_allow_select"
ON profiles FOR SELECT
USING (true);

CREATE POLICY "profiles_allow_insert"
ON profiles FOR INSERT
WITH CHECK (
  -- Allow insert if the user is authenticated and the profile ID matches their auth ID
  auth.uid() = id OR
  -- Or if they're an admin
  is_admin()
);

CREATE POLICY "profiles_allow_update"
ON profiles FOR UPDATE
USING (
  -- Allow update if the user owns the profile
  auth.uid() = id OR
  -- Or if they're an admin
  is_admin()
);

CREATE POLICY "profiles_allow_delete"
ON profiles FOR DELETE
USING (
  -- Allow delete if the user owns the profile
  auth.uid() = id OR
  -- Or if they're an admin
  is_admin()
);

-- Add trigger to ensure email matches auth.users
CREATE OR REPLACE FUNCTION verify_new_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Verify the user exists in auth.users
  IF NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = NEW.id
  ) THEN
    RAISE EXCEPTION 'User must exist in auth.users';
  END IF;

  -- Set verified status based on email confirmation
  SELECT (email_confirmed_at IS NOT NULL)
  INTO NEW.verified
  FROM auth.users
  WHERE id = NEW.id;

  -- Set verified_at timestamp
  IF NEW.verified THEN
    NEW.verified_at = NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS verify_new_profile_trigger ON profiles;

-- Create new trigger
CREATE TRIGGER verify_new_profile_trigger
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION verify_new_profile();

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_auth_id ON profiles(id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_verified ON profiles(verified);