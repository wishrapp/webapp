-- Disable ALL triggers on profiles table
ALTER TABLE profiles DISABLE TRIGGER ALL;

-- Disable ALL triggers on auth.users table
ALTER TABLE auth.users DISABLE TRIGGER ALL;

-- Disable ALL triggers on related tables to prevent cascading effects
ALTER TABLE occasions DISABLE TRIGGER ALL;
ALTER TABLE access_requests DISABLE TRIGGER ALL;
ALTER TABLE items DISABLE TRIGGER ALL;
ALTER TABLE user_favorites DISABLE TRIGGER ALL;
ALTER TABLE messages DISABLE TRIGGER ALL;
ALTER TABLE group_purchase_contributions DISABLE TRIGGER ALL;
ALTER TABLE purchase_notifications DISABLE TRIGGER ALL;

-- Create a function to handle basic profile creation without triggers
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
      created_at,
      updated_at
    ) VALUES (
      NEW.id,
      NEW.email,
      NEW.email_confirmed_at IS NOT NULL,
      NEW.email_confirmed_at,
      NOW(),
      NOW()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create minimal trigger for basic profile creation
CREATE TRIGGER create_basic_profile_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_basic_profile();