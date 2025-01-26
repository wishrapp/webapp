-- Drop existing profile triggers safely
DROP TRIGGER IF EXISTS handle_new_profile_trigger ON profiles;
DROP FUNCTION IF EXISTS handle_new_profile() CASCADE;

-- Create a simpler profile handler that doesn't interfere with system triggers
CREATE OR REPLACE FUNCTION handle_new_profile()
RETURNS trigger AS $$
DECLARE
  auth_user auth.users%ROWTYPE;
BEGIN
  -- Get the auth user record
  SELECT * INTO auth_user
  FROM auth.users
  WHERE id = NEW.id;

  -- Set basic defaults without modifying system-managed fields
  NEW.verified := COALESCE(NEW.verified, auth_user.email_confirmed_at IS NOT NULL);
  NEW.suspended := COALESCE(NEW.suspended, false);
  NEW.reported := COALESCE(NEW.reported, false);
  NEW.premium_member := COALESCE(NEW.premium_member, false);
  NEW.email_notifications := COALESCE(NEW.email_notifications, true);
  NEW.terms_accepted := COALESCE(NEW.terms_accepted, false);
  
  -- Set timestamps
  IF TG_OP = 'INSERT' THEN
    NEW.created_at := NOW();
  END IF;
  NEW.updated_at := NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new trigger that runs after system triggers
CREATE TRIGGER handle_new_profile_trigger
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_profile();