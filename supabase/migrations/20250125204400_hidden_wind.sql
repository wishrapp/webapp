/*
  # Update Profile Verification Logic

  1. Changes
    - Simplify profile verification trigger
    - Remove validation of profile fields
    - Only validate email and auth consistency
    - Set verified status based on email_confirmed_at
    - Add verified_at timestamp

  2. Security
    - Maintain RLS policies
    - Ensure data consistency with auth.users
*/

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS verify_new_profile_trigger ON profiles;
DROP FUNCTION IF EXISTS verify_new_profile();

-- Create new simplified verification function
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

  -- Only verify email matches
  IF NEW.email != auth_user.email THEN
    RAISE EXCEPTION 'Email must match auth.users email';
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

-- Create new trigger
CREATE TRIGGER verify_new_profile_trigger
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION verify_new_profile();

-- Add index for email lookups if not exists
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);