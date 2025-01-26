-- First drop any existing policies
DO $$ 
BEGIN
  -- Drop policies for profile-images bucket if they exist
  DROP POLICY IF EXISTS "Public profile images are viewable by everyone" ON storage.objects;
  DROP POLICY IF EXISTS "Users can upload their own profile image" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update their own profile image" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete their own profile image" ON storage.objects;

  -- Drop policies for wishlist-images bucket if they exist
  DROP POLICY IF EXISTS "Public wishlist images are viewable by everyone" ON storage.objects;
  DROP POLICY IF EXISTS "Users can upload their own wishlist images" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update their own wishlist images" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete their own wishlist images" ON storage.objects;
END $$;

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('profile-images', 'profile-images', true),
  ('wishlist-images', 'wishlist-images', true)
ON CONFLICT (id) DO UPDATE 
SET 
  public = EXCLUDED.public;

-- Create simplified policies for profile images
CREATE POLICY "profile_images_select_policy" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'profile-images');

CREATE POLICY "profile_images_insert_policy" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'profile-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "profile_images_update_policy" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'profile-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "profile_images_delete_policy" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'profile-images' 
  AND auth.role() = 'authenticated'
);

-- Create simplified policies for wishlist images
CREATE POLICY "wishlist_images_select_policy" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'wishlist-images');

CREATE POLICY "wishlist_images_insert_policy" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'wishlist-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "wishlist_images_update_policy" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'wishlist-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "wishlist_images_delete_policy" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'wishlist-images' 
  AND auth.role() = 'authenticated'
);