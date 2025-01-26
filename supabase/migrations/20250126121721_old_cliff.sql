-- Create storage buckets for profile and wishlist images
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('profile-images', 'profile-images', true),
  ('wishlist-images', 'wishlist-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up security policies for profile images bucket
CREATE POLICY "Public profile images are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-images');

CREATE POLICY "Users can upload their own profile image"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profile-images'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own profile image"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'profile-images'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own profile image"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'profile-images'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Set up security policies for wishlist images bucket
CREATE POLICY "Public wishlist images are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'wishlist-images');

CREATE POLICY "Users can upload their own wishlist images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'wishlist-images'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own wishlist images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'wishlist-images'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own wishlist images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'wishlist-images'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);