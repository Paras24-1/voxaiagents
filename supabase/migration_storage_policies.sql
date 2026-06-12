-- Allow authenticated users to upload files to 'chat-media' bucket
CREATE POLICY "Allow authenticated upload to chat-media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'chat-media');

-- Allow anyone to read files from 'chat-media' bucket (public read access)
CREATE POLICY "Allow public read from chat-media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'chat-media');

-- Allow authenticated users to update/delete files in 'chat-media' bucket
CREATE POLICY "Allow authenticated modification of chat-media"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'chat-media');
