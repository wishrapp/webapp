-- Create a simpler profile creation function
CREATE OR REPLACE FUNCTION handle_new_profile()
RETURNS trigger AS $$
BEGIN
  -- Set basic defaults
  NEW.verified := COALESCE(NEW.verified, false);
  NEW.suspended := COALESCE(NEW.suspended, false);
  NEW.reported := COALESCE(NEW.reported, false);
  NEW.premium_member := COALESCE(NEW.premium_member, false);
  NEW.email_notifications := COALESCE(NEW.email_notifications, true);
  
  -- Set timestamps
  IF NEW.created_at IS NULL THEN
    NEW.created_at := NOW();
  END IF;
  NEW.updated_at := NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS handle_new_profile_trigger ON profiles;

-- Create minimal trigger for new profiles
CREATE TRIGGER handle_new_profile_trigger
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_profile();