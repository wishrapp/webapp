-- Add verified_at column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verified_at timestamptz;

-- Create function to handle profile creation/update after verification
CREATE OR REPLACE FUNCTION handle_user_verification()
RETURNS trigger AS $$
BEGIN
  -- Update or create profile when user is verified
  INSERT INTO public.profiles (
    id,
    email,
    first_name,
    last_name,
    username,
    date_of_birth,
    country,
    telephone,
    email_notifications,
    terms_accepted,
    verified,
    verified_at,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'username',
    (NEW.raw_user_meta_data->>'date_of_birth')::date,
    NEW.raw_user_meta_data->>'country',
    NEW.raw_user_meta_data->>'telephone',
    (NEW.raw_user_meta_data->>'email_notifications')::boolean,
    (NEW.raw_user_meta_data->>'terms_accepted')::boolean,
    NEW.email_confirmed_at IS NOT NULL,
    NEW.email_confirmed_at,
    NEW.created_at,
    NEW.updated_at
  )
  ON CONFLICT (id) DO UPDATE SET
    verified = NEW.email_confirmed_at IS NOT NULL,
    verified_at = NEW.email_confirmed_at,
    updated_at = NEW.updated_at;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for user verification
DROP TRIGGER IF EXISTS on_user_verification ON auth.users;
CREATE TRIGGER on_user_verification
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
  EXECUTE FUNCTION handle_user_verification();