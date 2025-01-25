/*
  # Add profile images configuration

  1. Changes
    - Add configuration for profile image constraints
    - Add trigger to validate profile image URLs
    - Add function to validate image URLs
*/

-- Create a function to validate image URLs
CREATE OR REPLACE FUNCTION validate_image_url()
RETURNS trigger AS $$
BEGIN
  -- Skip validation if URL is null
  IF NEW.profile_image_url IS NULL THEN
    RETURN NEW;
  END IF;

  -- Basic URL validation
  IF NEW.profile_image_url !~ '^https?://.+\.(jpg|jpeg|png|gif|webp)$' THEN
    RAISE EXCEPTION 'Invalid image URL format. Must be a valid HTTP(S) URL ending with jpg, jpeg, png, gif, or webp';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for image URL validation
DROP TRIGGER IF EXISTS validate_profile_image_url ON profiles;
CREATE TRIGGER validate_profile_image_url
  BEFORE INSERT OR UPDATE OF profile_image_url ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION validate_image_url();