-- First re-enable the profile verification trigger
ALTER TABLE profiles ENABLE TRIGGER verify_new_profile_trigger;

-- Then re-enable the email sync triggers
ALTER TABLE profiles ENABLE TRIGGER sync_email_to_auth_users_trigger;
ALTER TABLE auth.users ENABLE TRIGGER sync_email_from_auth_users_trigger;

-- Finally re-enable the occasions trigger
ALTER TABLE profiles ENABLE TRIGGER add_default_occasions_trigger;

-- Add a function to handle email verification
CREATE OR REPLACE FUNCTION handle_email_verification()
RETURNS trigger AS $$
BEGIN
  -- Only proceed if email is being confirmed
  IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
    -- Update profile verification status
    UPDATE profiles
    SET verified = true,
        verified_at = NEW.email_confirmed_at
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for email verification
DROP TRIGGER IF EXISTS handle_email_verification_trigger ON auth.users;
CREATE TRIGGER handle_email_verification_trigger
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_email_verification();