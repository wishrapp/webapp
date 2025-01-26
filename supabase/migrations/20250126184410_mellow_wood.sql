-- First drop any existing policies
DO $$ 
BEGIN
  -- Drop policies for profile-images bucket if they exist
  DROP POLICY IF EXISTS "Public profile images are viewable by everyone" ON storage.objects;
  DROP POLICY IF EXISTS "Users can upload their own profile image" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update their own profile image" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete their own profile image" ON storage.objects;
  DROP POLICY IF EXISTS "profile_images_select_policy" ON storage.objects;
  DROP POLICY IF EXISTS "profile_images_insert_policy" ON storage.objects;
  DROP POLICY IF EXISTS "profile_images_update_policy" ON storage.objects;
  DROP POLICY IF EXISTS "profile_images_delete_policy" ON storage.objects;

  -- Drop policies for wishlist-images bucket if they exist
  DROP POLICY IF EXISTS "Public wishlist images are viewable by everyone" ON storage.objects;
  DROP POLICY IF EXISTS "Users can upload their own wishlist images" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update their own wishlist images" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete their own wishlist images" ON storage.objects;
  DROP POLICY IF EXISTS "wishlist_images_select_policy" ON storage.objects;
  DROP POLICY IF EXISTS "wishlist_images_insert_policy" ON storage.objects;
  DROP POLICY IF EXISTS "wishlist_images_update_policy" ON storage.objects;
  DROP POLICY IF EXISTS "wishlist_images_delete_policy" ON storage.objects;
END $$;

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('profile-images', 'profile-images', true),
  ('wishlist-images', 'wishlist-images', true)
ON CONFLICT (id) DO UPDATE 
SET 
  public = EXCLUDED.public;

-- Create new policies with unique names
CREATE POLICY "storage_objects_profile_images_select_20250126"
ON storage.objects FOR SELECT 
USING (bucket_id = 'profile-images');

CREATE POLICY "storage_objects_profile_images_insert_20250126"
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'profile-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "storage_objects_profile_images_update_20250126"
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'profile-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "storage_objects_profile_images_delete_20250126"
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'profile-images' 
  AND auth.role() = 'authenticated'
);

-- Create new policies for wishlist images with unique names
CREATE POLICY "storage_objects_wishlist_images_select_20250126"
ON storage.objects FOR SELECT 
USING (bucket_id = 'wishlist-images');

CREATE POLICY "storage_objects_wishlist_images_insert_20250126"
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'wishlist-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "storage_objects_wishlist_images_update_20250126"
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'wishlist-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "storage_objects_wishlist_images_delete_20250126"
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'wishlist-images' 
  AND auth.role() = 'authenticated'
);