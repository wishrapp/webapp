/*
  # Add default occasions

  1. Changes
    - Add "No occasion" and "Birthday" as default occasions for all users
    - These will be automatically created when a user signs up
*/

-- Create a function to add default occasions for new users
CREATE OR REPLACE FUNCTION add_default_occasions()
RETURNS trigger AS $$
BEGIN
  -- Insert "No occasion"
  INSERT INTO occasions (user_id, name, is_default)
  VALUES (NEW.id, 'No occasion', true);

  -- Insert "Birthday"
  INSERT INTO occasions (user_id, name, is_default)
  VALUES (NEW.id, 'Birthday', true);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to add default occasions when a new profile is created
DROP TRIGGER IF EXISTS add_default_occasions_trigger ON profiles;
CREATE TRIGGER add_default_occasions_trigger
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION add_default_occasions();

-- Add default occasions for existing users who don't have them
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT id FROM profiles
  LOOP
    -- Add "No occasion" if it doesn't exist
    INSERT INTO occasions (user_id, name, is_default)
    SELECT user_record.id, 'No occasion', true
    WHERE NOT EXISTS (
      SELECT 1 FROM occasions 
      WHERE user_id = user_record.id 
      AND name = 'No occasion'
    );

    -- Add "Birthday" if it doesn't exist
    INSERT INTO occasions (user_id, name, is_default)
    SELECT user_record.id, 'Birthday', true
    WHERE NOT EXISTS (
      SELECT 1 FROM occasions 
      WHERE user_id = user_record.id 
      AND name = 'Birthday'
    );
  END LOOP;
END;
$$;