-- Create storage bucket for Chef Vito images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chef-vito-images',
  'chef-vito-images',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update images" ON storage.objects;

-- Allow anyone to upload images
CREATE POLICY "Anyone can upload images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'chef-vito-images');

-- Allow anyone to read images (public bucket)
CREATE POLICY "Anyone can read images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'chef-vito-images');

-- Allow anyone to update images (for retries)
CREATE POLICY "Anyone can update images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'chef-vito-images');
