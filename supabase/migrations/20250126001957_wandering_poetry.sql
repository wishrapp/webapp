-- Add function to validate username format
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