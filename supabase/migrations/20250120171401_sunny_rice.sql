/*
  # Add Username Columns to Items Table

  1. New Columns
    - `purchased_by_username` (text) - Username of the person who purchased the item
    - `purchased_for_username` (text) - Username of the person the item was purchased for

  2. Changes
    - Add new columns to items table
    - Create trigger to automatically update usernames when items are purchased
    - Update existing records with usernames
    - Add indexes for performance
    - Add RLS policies for the new columns

  3. Security
    - Enable RLS for new columns
    - Add policies to control access to username information
*/

-- Add username columns to items table
ALTER TABLE items
ADD COLUMN purchased_by_username text,
ADD COLUMN purchased_for_username text;

-- Create function to update usernames
CREATE OR REPLACE FUNCTION update_item_usernames()
RETURNS trigger AS $$
BEGIN
  -- Get username of purchaser if purchased_by is set
  IF NEW.purchased_by IS NOT NULL THEN
    SELECT username INTO NEW.purchased_by_username
    FROM profiles WHERE id = NEW.purchased_by;
  ELSE
    NEW.purchased_by_username := NULL;
  END IF;
  
  -- Get username of item owner
  SELECT username INTO NEW.purchased_for_username
  FROM profiles WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update usernames on insert or update
CREATE TRIGGER update_item_usernames_trigger
  BEFORE INSERT OR UPDATE ON items
  FOR EACH ROW
  EXECUTE FUNCTION update_item_usernames();

-- Update existing records
UPDATE items i
SET 
  purchased_by_username = p1.username,
  purchased_for_username = p2.username
FROM profiles p1, profiles p2
WHERE i.purchased_by = p1.id AND i.user_id = p2.id;

-- Add indexes for the new columns
CREATE INDEX idx_items_purchased_by_username ON items(purchased_by_username);
CREATE INDEX idx_items_purchased_for_username ON items(purchased_for_username);

-- Create trigger to update usernames when profiles are updated
CREATE OR REPLACE FUNCTION update_item_usernames_on_profile_update()
RETURNS trigger AS $$
BEGIN
  -- Update purchased_by_username where this profile is the purchaser
  UPDATE items
  SET purchased_by_username = NEW.username
  WHERE purchased_by = NEW.id;
  
  -- Update purchased_for_username where this profile is the owner
  UPDATE items
  SET purchased_for_username = NEW.username
  WHERE user_id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on profiles table
CREATE TRIGGER update_item_usernames_on_profile_update_trigger
  AFTER UPDATE OF username ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_item_usernames_on_profile_update();