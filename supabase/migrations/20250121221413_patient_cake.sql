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
  -- Allow insert if authenticated and matches auth ID
  auth.uid() = id AND
  -- Verify email matches auth.users
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid()
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

-- Update verify_new_profile function to be more lenient during initial creation
CREATE OR REPLACE FUNCTION verify_new_profile()
RETURNS TRIGGER AS $$
DECLARE
  auth_user auth.users%ROWTYPE;
BEGIN
  -- Get the auth user record
  SELECT * INTO auth_user
  FROM auth.users
  WHERE id = NEW.id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User must exist in auth.users';
  END IF;

  -- Verify email matches
  IF NEW.email != auth_user.email THEN
    RAISE EXCEPTION 'Email must match auth.users email';
  END IF;

  -- Set verified status based on email confirmation
  NEW.verified := auth_user.email_confirmed_at IS NOT NULL;
  
  -- Set verified_at timestamp if verified
  IF NEW.verified AND NEW.verified_at IS NULL THEN
    NEW.verified_at := auth_user.email_confirmed_at;
  END IF;

  -- Set created_at if not set
  IF NEW.created_at IS NULL THEN
    NEW.created_at := NOW();
  END IF;

  -- Set updated_at
  NEW.updated_at := NOW();

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

-- Add function to check if username is available
CREATE OR REPLACE FUNCTION is_username_available(username text)
RETURNS boolean AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.username = is_username_available.username
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;