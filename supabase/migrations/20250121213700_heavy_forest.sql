-- Grant necessary permissions to authenticated users for auth.users table
GRANT SELECT ON auth.users TO authenticated;

-- Update the profile creation policy to handle auth properly
DROP POLICY IF EXISTS "Users can create their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

CREATE POLICY "Users can create their own profile"
ON profiles FOR INSERT
WITH CHECK (
  auth.uid() = id AND
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = profiles.id
  )
);

-- Add index to improve performance
CREATE INDEX IF NOT EXISTS idx_auth_users_id ON auth.users(id);