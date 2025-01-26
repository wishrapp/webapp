-- First drop ALL existing triggers
DROP TRIGGER IF EXISTS add_default_occasions_trigger ON profiles;
DROP TRIGGER IF EXISTS sync_email_to_auth_users_trigger ON profiles;
DROP TRIGGER IF EXISTS sync_email_from_auth_users_trigger ON auth.users;
DROP TRIGGER IF EXISTS verify_new_profile_trigger ON profiles;
DROP TRIGGER IF EXISTS verify_profile_email_trigger ON profiles;
DROP TRIGGER IF EXISTS update_profile_email_trigger ON profiles;
DROP TRIGGER IF EXISTS update_access_request_usernames_trigger ON access_requests;
DROP TRIGGER IF EXISTS update_access_request_usernames_on_profile_update_trigger ON profiles;
DROP TRIGGER IF EXISTS update_item_usernames_trigger ON items;
DROP TRIGGER IF EXISTS update_item_usernames_on_profile_update_trigger ON profiles;
DROP TRIGGER IF EXISTS update_favorite_username_trigger ON user_favorites;
DROP TRIGGER IF EXISTS update_favorite_usernames_on_profile_update_trigger ON profiles;

-- Drop ALL existing functions
DROP FUNCTION IF EXISTS add_default_occasions() CASCADE;
DROP FUNCTION IF EXISTS sync_email_to_auth_users() CASCADE;
DROP FUNCTION IF EXISTS sync_email_from_auth_users() CASCADE;
DROP FUNCTION IF EXISTS verify_new_profile() CASCADE;
DROP FUNCTION IF EXISTS verify_profile_email() CASCADE;
DROP FUNCTION IF EXISTS update_access_request_usernames() CASCADE;
DROP FUNCTION IF EXISTS update_access_request_usernames_on_profile_update() CASCADE;
DROP FUNCTION IF EXISTS update_item_usernames() CASCADE;
DROP FUNCTION IF EXISTS update_item_usernames_on_profile_update() CASCADE;
DROP FUNCTION IF EXISTS update_favorite_username() CASCADE;
DROP FUNCTION IF EXISTS update_favorite_usernames_on_profile_update() CASCADE;

-- Drop ALL existing policies
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
DROP POLICY IF EXISTS "profiles_select_225725" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_225725" ON profiles;
DROP POLICY IF EXISTS "profiles_update_225725" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_225725" ON profiles;
DROP POLICY IF EXISTS "profiles_admin_225725" ON profiles;
DROP POLICY IF EXISTS "profiles_select_230012" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_230012" ON profiles;
DROP POLICY IF EXISTS "profiles_update_230012" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_230012" ON profiles;
DROP POLICY IF EXISTS "profiles_admin_230012" ON profiles;

DROP POLICY IF EXISTS "occasions_allow_select" ON occasions;
DROP POLICY IF EXISTS "occasions_allow_insert" ON occasions;
DROP POLICY IF EXISTS "occasions_allow_update" ON occasions;
DROP POLICY IF EXISTS "occasions_allow_delete" ON occasions;
DROP POLICY IF EXISTS "occasions_allow_admin" ON occasions;
DROP POLICY IF EXISTS "occasions_select_own_223035" ON occasions;
DROP POLICY IF EXISTS "occasions_select_shared_223035" ON occasions;
DROP POLICY IF EXISTS "occasions_insert_223035" ON occasions;
DROP POLICY IF EXISTS "occasions_update_223035" ON occasions;
DROP POLICY IF EXISTS "occasions_delete_223035" ON occasions;
DROP POLICY IF EXISTS "occasions_admin_223035" ON occasions;
DROP POLICY IF EXISTS "occasions_select_225655" ON occasions;
DROP POLICY IF EXISTS "occasions_select_shared_225655" ON occasions;
DROP POLICY IF EXISTS "occasions_insert_225655" ON occasions;
DROP POLICY IF EXISTS "occasions_update_225655" ON occasions;
DROP POLICY IF EXISTS "occasions_delete_225655" ON occasions;
DROP POLICY IF EXISTS "occasions_admin_225655" ON occasions;
DROP POLICY IF EXISTS "occasions_select_230012" ON occasions;
DROP POLICY IF EXISTS "occasions_select_shared_230012" ON occasions;
DROP POLICY IF EXISTS "occasions_insert_230012" ON occasions;
DROP POLICY IF EXISTS "occasions_update_230012" ON occasions;
DROP POLICY IF EXISTS "occasions_delete_230012" ON occasions;
DROP POLICY IF EXISTS "occasions_admin_230012" ON occasions;

-- Create new functions
CREATE OR REPLACE FUNCTION verify_new_profile()
RETURNS TRIGGER AS $$
DECLARE
  auth_user auth.users%ROWTYPE;
BEGIN
  SELECT * INTO auth_user
  FROM auth.users
  WHERE id = NEW.id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User must exist in auth.users';
  END IF;

  IF NEW.email != auth_user.email THEN
    NEW.email := auth_user.email;
  END IF;

  NEW.verified := auth_user.email_confirmed_at IS NOT NULL;
  
  IF NEW.verified AND NEW.verified_at IS NULL THEN
    NEW.verified_at := auth_user.email_confirmed_at;
  END IF;

  IF NEW.created_at IS NULL THEN
    NEW.created_at := NOW();
  END IF;
  NEW.updated_at := NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION sync_email_to_auth_users()
RETURNS TRIGGER AS $$
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

CREATE OR REPLACE FUNCTION sync_email_from_auth_users()
RETURNS TRIGGER AS $$
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

CREATE OR REPLACE FUNCTION add_default_occasions()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM occasions 
    WHERE user_id = NEW.id AND is_default = true
  ) THEN
    INSERT INTO occasions (user_id, name, is_default)
    VALUES (NEW.id, 'No occasion', true);

    IF NEW.date_of_birth IS NOT NULL THEN
      INSERT INTO occasions (user_id, name, date, is_default)
      VALUES (
        NEW.id,
        'Birthday (' || to_char(NEW.date_of_birth::date, 'FMMonth DD') || ')',
        NEW.date_of_birth,
        false
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new triggers
CREATE TRIGGER verify_new_profile_trigger
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION verify_new_profile();

CREATE TRIGGER sync_email_to_auth_users_trigger
  BEFORE UPDATE OF email ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_email_to_auth_users();

CREATE TRIGGER sync_email_from_auth_users_trigger
  AFTER UPDATE OF email, email_confirmed_at ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_email_from_auth_users();

CREATE TRIGGER add_default_occasions_trigger
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION add_default_occasions();

-- Create new policies with unique timestamp
CREATE POLICY "profiles_select_230112"
ON profiles FOR SELECT
USING (true);

CREATE POLICY "profiles_insert_230112"
ON profiles FOR INSERT
WITH CHECK (
  auth.uid() = id AND
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid()
    AND email = profiles.email
  )
);

CREATE POLICY "profiles_update_230112"
ON profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_delete_230112"
ON profiles FOR DELETE
USING (auth.uid() = id);

CREATE POLICY "profiles_admin_230112"
ON profiles
USING (is_admin());

CREATE POLICY "occasions_select_230112"
ON occasions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "occasions_select_shared_230112"
ON occasions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM access_requests
    WHERE requester_id = auth.uid()
    AND target_id = occasions.user_id
    AND status = 'approved'
  )
);

CREATE POLICY "occasions_insert_230112"
ON occasions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "occasions_update_230112"
ON occasions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "occasions_delete_230112"
ON occasions FOR DELETE
USING (auth.uid() = user_id AND NOT is_default);

CREATE POLICY "occasions_admin_230112"
ON occasions
USING (is_admin());