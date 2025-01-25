/*
  # Fix occasions setup

  1. Changes
    - Make only "No occasion" the default occasion
    - Update Birthday occasion to use user's date of birth
    - Add function to format date as Month Day (e.g., "January 1")
*/

-- Create a function to format date as Month Day
CREATE OR REPLACE FUNCTION format_date_md(date_value date)
RETURNS text AS $$
BEGIN
  RETURN to_char(date_value, 'FMMonth DD');
END;
$$ LANGUAGE plpgsql;

-- Drop existing function and trigger
DROP TRIGGER IF EXISTS add_default_occasions_trigger ON profiles;
DROP FUNCTION IF EXISTS add_default_occasions();

-- Create updated function to add occasions for new users
CREATE OR REPLACE FUNCTION add_default_occasions()
RETURNS trigger AS $$
BEGIN
  -- Insert "No occasion" as the default
  INSERT INTO occasions (user_id, name, is_default)
  VALUES (NEW.id, 'No occasion', true);

  -- Insert "Birthday" (not default) with the user's birth date
  INSERT INTO occasions (user_id, name, date, is_default)
  VALUES (NEW.id, 'Birthday (' || format_date_md(NEW.date_of_birth) || ')', NEW.date_of_birth, false);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger
CREATE TRIGGER add_default_occasions_trigger
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION add_default_occasions();

-- Update existing occasions
DO $$
DECLARE
  user_record RECORD;
BEGIN
  -- First, ensure only "No occasion" is set as default
  UPDATE occasions 
  SET is_default = false 
  WHERE name = 'Birthday';

  -- Update existing occasions for each user
  FOR user_record IN 
    SELECT p.id, p.date_of_birth 
    FROM profiles p
  LOOP
    -- Ensure "No occasion" exists and is default
    INSERT INTO occasions (user_id, name, is_default)
    SELECT user_record.id, 'No occasion', true
    WHERE NOT EXISTS (
      SELECT 1 FROM occasions 
      WHERE user_id = user_record.id 
      AND name = 'No occasion'
    );

    -- Update or insert Birthday occasion with formatted date
    UPDATE occasions 
    SET 
      name = 'Birthday (' || format_date_md(user_record.date_of_birth) || ')',
      date = user_record.date_of_birth,
      is_default = false
    WHERE user_id = user_record.id 
    AND name LIKE 'Birthday%';

    -- Insert Birthday if it doesn't exist
    INSERT INTO occasions (user_id, name, date, is_default)
    SELECT 
      user_record.id, 
      'Birthday (' || format_date_md(user_record.date_of_birth) || ')', 
      user_record.date_of_birth,
      false
    WHERE NOT EXISTS (
      SELECT 1 FROM occasions 
      WHERE user_id = user_record.id 
      AND name LIKE 'Birthday%'
    );
  END LOOP;
END;
$$;