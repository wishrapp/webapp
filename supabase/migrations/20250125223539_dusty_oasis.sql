-- First drop existing triggers if they exist
DROP TRIGGER IF EXISTS sync_email_to_auth_users_trigger ON profiles;
DROP TRIGGER IF EXISTS sync_email_from_auth_users_trigger ON auth.users;
DROP FUNCTION IF EXISTS sync_email_to_auth_users();
DROP FUNCTION IF EXISTS sync_email_from_auth_users();

-- Create function to sync email from profiles to auth.users
CREATE OR REPLACE FUNCTION sync_email_to_auth_users()
RETURNS trigger AS $$
BEGIN
  -- Only sync if email has changed
  IF NEW.email IS DISTINCT FROM OLD.email THEN
    -- Update email in auth.users
    UPDATE auth.users
    SET email = NEW.email,
        email_confirmed_at = NULL -- Reset verification when email changes
    WHERE id = NEW.id;

    -- Reset verified status in profiles
    NEW.verified := false;
    NEW.verified_at := NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to sync email from auth.users to profiles
CREATE OR REPLACE FUNCTION sync_email_from_auth_users()
RETURNS trigger AS $$
BEGIN
  -- Only sync if email has changed
  IF NEW.email IS DISTINCT FROM OLD.email THEN
    UPDATE profiles
    SET email = NEW.email,
        verified = (NEW.email_confirmed_at IS NOT NULL),
        verified_at = NEW.email_confirmed_at,
        updated_at = NOW()
    WHERE id = NEW.id;
  -- Update verification status if only email_confirmed_at changed
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

-- Create trigger to sync email from profiles to auth.users
CREATE TRIGGER sync_email_to_auth_users_trigger
  BEFORE UPDATE OF email ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_email_to_auth_users();

-- Create trigger to sync email from auth.users to profiles
CREATE TRIGGER sync_email_from_auth_users_trigger
  AFTER UPDATE OF email, email_confirmed_at ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_email_from_auth_users();

-- Add unique constraint on email if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_constraint 
    WHERE conname = 'profiles_email_key'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_email_key UNIQUE (email);
  END IF;
END $$;

-- Update verify_new_profile function to handle email syncing
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

  -- Ensure email matches auth.users
  IF NEW.email != auth_user.email THEN
    NEW.email := auth_user.email;
  END IF;

  -- Set verified status based on email confirmation
  NEW.verified := auth_user.email_confirmed_at IS NOT NULL;
  
  -- Set verified_at timestamp if verified
  IF NEW.verified AND NEW.verified_at IS NULL THEN
    NEW.verified_at := auth_user.email_confirmed_at;
  END IF;

  -- Set timestamps if not set
  IF NEW.created_at IS NULL THEN
    NEW.created_at := NOW();
  END IF;
  NEW.updated_at := NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate the verify_new_profile trigger
DROP TRIGGER IF EXISTS verify_new_profile_trigger ON profiles;
CREATE TRIGGER verify_new_profile_trigger
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION verify_new_profile();