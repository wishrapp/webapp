/*
  # Add Initial Admin User
  
  1. Changes
    - Inserts the initial admin user email into admin_users table
*/

-- Insert the admin user
INSERT INTO admin_users (email)
VALUES ('admin@wishr.com')
ON CONFLICT (email) DO NOTHING;