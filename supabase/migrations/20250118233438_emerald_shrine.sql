/*
  # Add RLS policies for admin users table

  1. Security
    - Add RLS policies to allow admin users to manage the admin_users table
    - Only allow authenticated users to view admin users list
*/

-- Policy to allow authenticated users to view admin users
CREATE POLICY "Authenticated users can view admin users"
ON admin_users
FOR SELECT
TO authenticated
USING (true);

-- Policy to allow admin users to manage admin users
CREATE POLICY "Admin users can manage admin users"
ON admin_users
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE email = auth.email()
  )
);