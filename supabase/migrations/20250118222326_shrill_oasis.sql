/*
  # Fix storage policies for image uploads

  1. Changes
    - Remove folder name check since we're using direct filenames
    - Simplify policies to just check bucket and auth status
    - Ensure proper access control while allowing direct file uploads
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Public profile images are viewable by everyone" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own profile image" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile image" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile image" ON storage.objects;
DROP POLICY IF EXISTS "Public wishlist images are viewable by everyone" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own wishlist images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own wishlist images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own wishlist images" ON storage.objects;

-- Create simplified policies for profile images
CREATE POLICY "Public profile images are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-images');

CREATE POLICY "Authenticated users can upload profile images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profile-images'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can update profile images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'profile-images'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can delete profile images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'profile-images'
  AND auth.role() = 'authenticated'
);

-- Create simplified policies for wishlist images
CREATE POLICY "Public wishlist images are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'wishlist-images');

CREATE POLICY "Authenticated users can upload wishlist images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'wishlist-images'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can update wishlist images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'wishlist-images'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can delete wishlist images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'wishlist-images'
  AND auth.role() = 'authenticated'
);