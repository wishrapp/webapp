-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  username text NOT NULL UNIQUE,
  email text NOT NULL UNIQUE,
  date_of_birth date NOT NULL,
  country text NOT NULL,
  telephone text NOT NULL,
  profile_image_url text,
  email_notifications boolean NOT NULL DEFAULT true,
  terms_accepted boolean NOT NULL DEFAULT false,
  verified boolean NOT NULL DEFAULT false,
  verified_at timestamptz,
  suspended boolean NOT NULL DEFAULT false,
  reported boolean NOT NULL DEFAULT false,
  premium_member boolean NOT NULL DEFAULT false,
  premium_expiry timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_verified ON profiles(verified);

-- Create policies
CREATE POLICY "profiles_allow_select"
ON profiles FOR SELECT
USING (true);

CREATE POLICY "profiles_allow_insert"
ON profiles FOR INSERT
WITH CHECK (
  auth.uid() = id AND
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid()
    AND email = profiles.email
  )
);

CREATE POLICY "profiles_allow_update"
ON profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_allow_delete"
ON profiles FOR DELETE
USING (auth.uid() = id);

CREATE POLICY "profiles_allow_admin"
ON profiles
USING (is_admin());

-- Create function to verify new profiles
CREATE OR REPLACE FUNCTION verify_new_profile()
RETURNS TRIGGER AS $$
DECLARE
  auth_user auth.users%ROWTYPE;
BEGIN
  -- Get the auth user record
  SELECT * INTO auth_user
  FROM auth.users
  WHERE id = NEW.id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User must exist in auth.users';
  END IF;

  -- Ensure email matches auth.users
  IF NEW.email != auth_user.email THEN
    NEW.email := auth_user.email;
  END IF;

  -- Set verified status based on email confirmation
  NEW.verified := auth_user.email_confirmed_at IS NOT NULL;
  
  -- Set verified_at timestamp if verified
  IF NEW.verified AND NEW.verified_at IS NULL THEN
    NEW.verified_at := auth_user.email_confirmed_at;
  END IF;

  -- Set timestamps if not set
  IF NEW.created_at IS NULL THEN
    NEW.created_at := NOW();
  END IF;
  NEW.updated_at := NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for profile verification
CREATE TRIGGER verify_new_profile_trigger
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION verify_new_profile();