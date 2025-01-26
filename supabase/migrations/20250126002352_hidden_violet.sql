-- Drop all existing triggers first
DO $$ 
BEGIN
  -- Drop profile triggers
  DROP TRIGGER IF EXISTS handle_new_profile_trigger ON profiles;
  DROP TRIGGER IF EXISTS validate_username_trigger ON profiles;
  DROP TRIGGER IF EXISTS verify_new_profile_trigger ON profiles;
  DROP TRIGGER IF EXISTS verify_profile_email_trigger ON profiles;
  DROP TRIGGER IF EXISTS sync_email_to_auth_users_trigger ON profiles;
  DROP TRIGGER IF EXISTS sync_email_from_auth_users_trigger ON auth.users;
  DROP TRIGGER IF EXISTS handle_email_verification_trigger ON auth.users;
  DROP TRIGGER IF EXISTS create_basic_profile_trigger ON auth.users;
  
  -- Drop functions
  DROP FUNCTION IF EXISTS handle_new_profile() CASCADE;
  DROP FUNCTION IF EXISTS validate_username() CASCADE;
  DROP FUNCTION IF EXISTS verify_new_profile() CASCADE;
  DROP FUNCTION IF EXISTS verify_profile_email() CASCADE;
  DROP FUNCTION IF EXISTS sync_email_to_auth_users() CASCADE;
  DROP FUNCTION IF EXISTS sync_email_from_auth_users() CASCADE;
  DROP FUNCTION IF EXISTS handle_email_verification() CASCADE;
  DROP FUNCTION IF EXISTS create_basic_profile() CASCADE;
END $$;

-- Create simplified profile handler
CREATE OR REPLACE FUNCTION handle_profile_creation()
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

-- Create new trigger for profile creation
CREATE TRIGGER handle_profile_creation_trigger
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_profile_creation();

-- Create simplified username validator
CREATE OR REPLACE FUNCTION validate_username()
RETURNS trigger AS $$
BEGIN
  -- Only validate if username is being set or changed
  IF NEW.username IS NOT NULL THEN
    -- Check username format
    IF NEW.username !~ '^[a-zA-Z0-9_-]+$' THEN
      RAISE EXCEPTION 'Username can only contain letters, numbers, underscores, and hyphens';
    END IF;
    
    -- Check length
    IF length(NEW.username) < 3 OR length(NEW.username) > 30 THEN
      RAISE EXCEPTION 'Username must be between 3 and 30 characters';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new trigger for username validation
CREATE TRIGGER validate_username_trigger
  BEFORE INSERT OR UPDATE OF username ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION validate_username();

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