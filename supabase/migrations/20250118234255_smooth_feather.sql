/*
  # Update Admin Email

  1. Changes
    - Delete existing admin user (admin@wishr.com)
    - Insert new admin user (jeff@wishr.com)

  2. Security
    - Maintain existing security model
    - Only change the admin email address
*/

-- Delete the old admin user
DELETE FROM admin_users WHERE email = 'admin@wishr.com';

-- Insert the new admin user
INSERT INTO admin_users (email)
VALUES ('jeff@wishr.com')
ON CONFLICT (email) DO NOTHING;