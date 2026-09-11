CREATE TABLE IF NOT EXISTS swipe_references (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_name text NOT NULL,
  video_number int NOT NULL,
  product text NOT NULL,
  drive_url text,
  drive_file_id text,
  duration_seconds numeric,
  hook_type text,
  hook_text text,
  hook_headline text,
  hook_visual text,
  body_text text,
  cta_text text,
  transcription text,
  why_it_works text,
  visual_pattern text,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE swipe_references ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for anon" ON swipe_references;
CREATE POLICY "Allow all for anon" ON swipe_references FOR ALL USING (true) WITH CHECK (true);
