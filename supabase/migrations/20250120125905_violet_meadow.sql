-- Add username columns
ALTER TABLE access_requests
ADD COLUMN requester_username text,
ADD COLUMN target_username text;

-- Create function to update usernames
CREATE OR REPLACE FUNCTION update_access_request_usernames()
RETURNS trigger AS $$
BEGIN
  -- Get usernames from profiles table
  SELECT username INTO NEW.requester_username
  FROM profiles WHERE id = NEW.requester_id;
  
  SELECT username INTO NEW.target_username
  FROM profiles WHERE id = NEW.target_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update usernames on insert or update
CREATE TRIGGER update_access_request_usernames_trigger
  BEFORE INSERT OR UPDATE ON access_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_access_request_usernames();

-- Update existing records
UPDATE access_requests ar
SET 
  requester_username = p1.username,
  target_username = p2.username
FROM profiles p1, profiles p2
WHERE ar.requester_id = p1.id AND ar.target_id = p2.id;

-- Add indexes for the new columns
CREATE INDEX idx_access_requests_requester_username ON access_requests(requester_username);
CREATE INDEX idx_access_requests_target_username ON access_requests(target_username);

-- Add policy to allow reading username columns
CREATE POLICY "Allow reading username columns" ON access_requests
  FOR SELECT
  USING (true);

-- Create trigger to update usernames when profiles are updated
CREATE OR REPLACE FUNCTION update_access_request_usernames_on_profile_update()
RETURNS trigger AS $$
BEGIN
  -- Update requester_username where this profile is the requester
  UPDATE access_requests
  SET requester_username = NEW.username
  WHERE requester_id = NEW.id;
  
  -- Update target_username where this profile is the target
  UPDATE access_requests
  SET target_username = NEW.username
  WHERE target_id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on profiles table
CREATE TRIGGER update_access_request_usernames_on_profile_update_trigger
  AFTER UPDATE OF username ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_access_request_usernames_on_profile_update();