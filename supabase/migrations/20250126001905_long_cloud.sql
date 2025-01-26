-- Remove telephone column and modify other columns
ALTER TABLE profiles
  DROP COLUMN IF EXISTS telephone,
  ALTER COLUMN first_name DROP NOT NULL,
  ALTER COLUMN last_name DROP NOT NULL,
  ALTER COLUMN date_of_birth DROP NOT NULL,
  ALTER COLUMN email_notifications SET DEFAULT true,
  ALTER COLUMN terms_accepted SET NOT NULL,
  ALTER COLUMN username SET NOT NULL;

-- Add unique constraint on username if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_constraint 
    WHERE conname = 'profiles_username_key'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_username_key UNIQUE (username);
  END IF;
END $$;

-- Create function to validate username format
CREATE OR REPLACE FUNCTION validate_username()
RETURNS trigger AS $$
BEGIN
  -- Check username format (letters, numbers, underscores, hyphens only)
  IF NEW.username !~ '^[a-zA-Z0-9_-]+$' THEN
    RAISE EXCEPTION 'Username can only contain letters, numbers, underscores, and hyphens';
  END IF;
  
  -- Check username length (3-30 characters)
  IF length(NEW.username) < 3 OR length(NEW.username) > 30 THEN
    RAISE EXCEPTION 'Username must be between 3 and 30 characters';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for username validation
DROP TRIGGER IF EXISTS validate_username_trigger ON profiles;
CREATE TRIGGER validate_username_trigger
  BEFORE INSERT OR UPDATE OF username ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION validate_username();

-- Create function to handle basic profile creation
CREATE OR REPLACE FUNCTION create_basic_profile()
RETURNS trigger AS $$
BEGIN
  -- Only create profile if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = NEW.id) THEN
    INSERT INTO profiles (
      id,
      email,
      verified,
      verified_at,
      email_notifications,
      terms_accepted,
      created_at,
      updated_at
    ) VALUES (
      NEW.id,
      NEW.email,
      NEW.email_confirmed_at IS NOT NULL,
      NEW.email_confirmed_at,
      true, -- Default to true for email_notifications
      false, -- Default to false for terms_accepted (must be explicitly accepted)
      NOW(),
      NOW()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create minimal trigger for basic profile creation
DROP TRIGGER IF EXISTS create_basic_profile_trigger ON auth.users;
CREATE TRIGGER create_basic_profile_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_basic_profile();

-- Create function to handle email verification
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