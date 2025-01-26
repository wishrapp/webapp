-- Drop existing verification triggers
DROP TRIGGER IF EXISTS verify_new_profile_trigger ON profiles;
DROP TRIGGER IF EXISTS verify_profile_email_trigger ON profiles;
DROP TRIGGER IF EXISTS on_user_verification ON auth.users;

-- Drop existing verification functions
DROP FUNCTION IF EXISTS verify_new_profile();
DROP FUNCTION IF EXISTS verify_profile_email();
DROP FUNCTION IF EXISTS handle_user_verification();

-- Create a simpler profile creation function
CREATE OR REPLACE FUNCTION handle_new_profile()
RETURNS trigger AS $$
BEGIN
  -- Set basic defaults
  NEW.verified := false;
  NEW.suspended := false;
  NEW.reported := false;
  NEW.premium_member := false;
  NEW.email_notifications := true;
  
  -- Set timestamps
  IF NEW.created_at IS NULL THEN
    NEW.created_at := NOW();
  END IF;
  NEW.updated_at := NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create minimal trigger for new profiles
CREATE TRIGGER handle_new_profile_trigger
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_profile();