-- Drop existing profile policies
DROP POLICY IF EXISTS "profiles_allow_select" ON profiles;
DROP POLICY IF EXISTS "profiles_allow_insert" ON profiles;
DROP POLICY IF EXISTS "profiles_allow_update" ON profiles;
DROP POLICY IF EXISTS "profiles_allow_delete" ON profiles;

-- Create new policies with proper access control
CREATE POLICY "profiles_allow_select"
ON profiles FOR SELECT
USING (true);

CREATE POLICY "profiles_allow_insert"
ON profiles FOR INSERT
WITH CHECK (
  -- Allow insert if the user is authenticated and matches auth metadata
  auth.uid() = id AND
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid()
    AND email = profiles.email
    AND raw_user_meta_data->>'username' = profiles.username
  )
);

CREATE POLICY "profiles_allow_update"
ON profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_allow_delete"
ON profiles FOR DELETE
USING (auth.uid() = id);

-- Add admin policy
CREATE POLICY "profiles_allow_admin"
ON profiles
USING (is_admin());

-- Update verify_new_profile function to handle auth metadata
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

  -- Verify username matches metadata
  IF NEW.username != auth_user.raw_user_meta_data->>'username' THEN
    RAISE EXCEPTION 'Username must match auth metadata';
  END IF;

  -- Set verified status based on email confirmation
  NEW.verified := auth_user.email_confirmed_at IS NOT NULL;
  
  -- Set verified_at timestamp
  IF NEW.verified THEN
    NEW.verified_at := auth_user.email_confirmed_at;
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