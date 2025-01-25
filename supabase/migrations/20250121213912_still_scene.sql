-- Drop all existing profile policies first
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can modify their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can remove their own profile" ON profiles;
DROP POLICY IF EXISTS "Admin users have full access to profiles" ON profiles;
DROP POLICY IF EXISTS "Admin users can manage profiles" ON profiles;
DROP POLICY IF EXISTS "Admins have full profile access" ON profiles;

-- Create new policies with unique names
CREATE POLICY "allow_public_profiles_select"
ON profiles FOR SELECT
USING (true);

CREATE POLICY "allow_user_profile_insert"
ON profiles FOR INSERT
WITH CHECK (
  auth.uid() = id AND
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = profiles.id
  )
);

CREATE POLICY "allow_user_profile_update"
ON profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "allow_user_profile_delete"
ON profiles FOR DELETE
USING (auth.uid() = id);

-- Create admin policy
CREATE POLICY "allow_admin_full_access"
ON profiles
USING (is_admin());