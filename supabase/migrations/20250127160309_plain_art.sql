-- Create system user for admin messages
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'system@wishr.com',
  '',
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Create system profile
INSERT INTO public.profiles (
  id,
  email,
  username,
  first_name,
  last_name,
  verified,
  verified_at,
  created_at,
  updated_at,
  email_notifications,
  terms_accepted
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'system@wishr.com',
  'system',
  'System',
  'Notifications',
  true,
  NOW(),
  NOW(),
  NOW(),
  false,
  true
)
ON CONFLICT (id) DO NOTHING;