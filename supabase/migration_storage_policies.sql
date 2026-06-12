-- Drop existing policies if they exist to prevent duplicates
DROP POLICY IF EXISTS "Allow authenticated upload to chat-media" ON storage.objects;
DROP POLICY IF EXISTS "Allow anon upload to chat-media" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read from chat-media" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated modification of chat-media" ON storage.objects;
DROP POLICY IF EXISTS "Allow public modification of chat-media" ON storage.objects;

-- Policy to allow authenticated users to upload files to 'chat-media' bucket
CREATE POLICY "Allow authenticated upload to chat-media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'chat-media');

-- Policy to allow anonymous uploads (in case session is loading/treated as anon)
CREATE POLICY "Allow anon upload to chat-media"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'chat-media');

-- Policy to allow anyone to read files from 'chat-media' bucket (public read access)
CREATE POLICY "Allow public read from chat-media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'chat-media');

-- Policy to allow authenticated users to update/delete files in 'chat-media' bucket
CREATE POLICY "Allow authenticated modification of chat-media"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'chat-media');

-- Policy to allow anon users to update/delete files in 'chat-media' bucket
CREATE POLICY "Allow public modification of chat-media"
ON storage.objects FOR ALL
TO anon
USING (bucket_id = 'chat-media');

