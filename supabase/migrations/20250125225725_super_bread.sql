-- Drop all existing profile policies first
DROP POLICY IF EXISTS "profiles_allow_select" ON profiles;
DROP POLICY IF EXISTS "profiles_allow_insert" ON profiles;
DROP POLICY IF EXISTS "profiles_allow_update" ON profiles;
DROP POLICY IF EXISTS "profiles_allow_delete" ON profiles;
DROP POLICY IF EXISTS "profiles_allow_admin" ON profiles;
DROP POLICY IF EXISTS "profiles_select_225512" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_225512" ON profiles;
DROP POLICY IF EXISTS "profiles_update_225512" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_225512" ON profiles;
DROP POLICY IF EXISTS "profiles_admin_225512" ON profiles;

-- Create new policies with unique timestamps
CREATE POLICY "profiles_select_230012"
ON profiles FOR SELECT
USING (true);

CREATE POLICY "profiles_insert_230012"
ON profiles FOR INSERT
WITH CHECK (
  auth.uid() = id AND
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid()
    AND email = profiles.email
  )
);

CREATE POLICY "profiles_update_230012"
ON profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_delete_230012"
ON profiles FOR DELETE
USING (auth.uid() = id);

CREATE POLICY "profiles_admin_230012"
ON profiles
USING (is_admin());

-- Drop existing triggers and functions
DROP TRIGGER IF EXISTS sync_email_to_auth_users_trigger ON profiles;
DROP TRIGGER IF EXISTS sync_email_from_auth_users_trigger ON auth.users;
DROP FUNCTION IF EXISTS sync_email_to_auth_users();
DROP FUNCTION IF EXISTS sync_email_from_auth_users();

-- Create function to sync email to auth.users
CREATE OR REPLACE FUNCTION sync_email_to_auth_users()
RETURNS trigger AS $$
BEGIN
  IF NEW.email IS DISTINCT FROM OLD.email THEN
    UPDATE auth.users
    SET email = NEW.email,
        email_confirmed_at = NULL
    WHERE id = NEW.id;
      
    NEW.verified := false;
    NEW.verified_at := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to sync email from auth.users
CREATE OR REPLACE FUNCTION sync_email_from_auth_users()
RETURNS trigger AS $$
BEGIN
  IF NEW.email IS DISTINCT FROM OLD.email THEN
    UPDATE profiles
    SET email = NEW.email,
        verified = (NEW.email_confirmed_at IS NOT NULL),
        verified_at = NEW.email_confirmed_at,
        updated_at = NOW()
    WHERE id = NEW.id;
  ELSIF NEW.email_confirmed_at IS DISTINCT FROM OLD.email_confirmed_at THEN
    UPDATE profiles
    SET verified = (NEW.email_confirmed_at IS NOT NULL),
        verified_at = NEW.email_confirmed_at,
        updated_at = NOW()
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
CREATE TRIGGER sync_email_to_auth_users_trigger
  BEFORE UPDATE OF email ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_email_to_auth_users();

CREATE TRIGGER sync_email_from_auth_users_trigger
  AFTER UPDATE OF email, email_confirmed_at ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_email_from_auth_users();