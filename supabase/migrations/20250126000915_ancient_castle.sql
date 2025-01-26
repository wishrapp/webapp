-- Drop existing triggers and functions
DROP TRIGGER IF EXISTS verify_new_profile_trigger ON profiles;
DROP TRIGGER IF EXISTS verify_profile_email_trigger ON profiles;
DROP TRIGGER IF EXISTS on_user_verification ON auth.users;
DROP TRIGGER IF EXISTS handle_email_verification_trigger ON auth.users;
DROP TRIGGER IF EXISTS handle_new_profile_trigger ON profiles;

DROP FUNCTION IF EXISTS verify_new_profile() CASCADE;
DROP FUNCTION IF EXISTS verify_profile_email() CASCADE;
DROP FUNCTION IF EXISTS handle_user_verification() CASCADE;
DROP FUNCTION IF EXISTS handle_email_verification() CASCADE;
DROP FUNCTION IF EXISTS handle_new_profile() CASCADE;

-- Create a simple profile handler function
CREATE OR REPLACE FUNCTION handle_profile()
RETURNS trigger AS $$
BEGIN
  -- Set basic defaults for new profiles
  IF TG_OP = 'INSERT' THEN
    NEW.verified := COALESCE(NEW.verified, false);
    NEW.suspended := COALESCE(NEW.suspended, false);
    NEW.reported := COALESCE(NEW.reported, false);
    NEW.premium_member := COALESCE(NEW.premium_member, false);
    NEW.email_notifications := COALESCE(NEW.email_notifications, true);
    NEW.created_at := COALESCE(NEW.created_at, NOW());
  END IF;
  
  -- Always update timestamp
  NEW.updated_at := NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for profile handling
CREATE TRIGGER handle_profile_trigger
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_profile();