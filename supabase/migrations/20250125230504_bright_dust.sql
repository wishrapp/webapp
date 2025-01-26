-- First ensure occasions table exists
CREATE TABLE IF NOT EXISTS occasions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  date date,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE occasions ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_occasions_user_id ON occasions(user_id);
CREATE INDEX IF NOT EXISTS idx_occasions_date ON occasions(date);

-- Create policies
CREATE POLICY "occasions_select_230200"
ON occasions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "occasions_select_shared_230200"
ON occasions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM access_requests
    WHERE requester_id = auth.uid()
    AND target_id = occasions.user_id
    AND status = 'approved'
  )
);

CREATE POLICY "occasions_insert_230200"
ON occasions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "occasions_update_230200"
ON occasions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "occasions_delete_230200"
ON occasions FOR DELETE
USING (auth.uid() = user_id AND NOT is_default);

CREATE POLICY "occasions_admin_230200"
ON occasions
USING (is_admin());

-- Add default occasions for existing users
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT id, date_of_birth FROM profiles
  LOOP
    -- Only add if user doesn't have any default occasions
    IF NOT EXISTS (
      SELECT 1 FROM occasions 
      WHERE user_id = user_record.id AND is_default = true
    ) THEN
      -- Add "No occasion"
      INSERT INTO occasions (user_id, name, is_default)
      VALUES (user_record.id, 'No occasion', true);

      -- Add "Birthday" only if date_of_birth is not null
      IF user_record.date_of_birth IS NOT NULL THEN
        INSERT INTO occasions (user_id, name, date, is_default)
        VALUES (
          user_record.id,
          'Birthday (' || to_char(user_record.date_of_birth::date, 'FMMonth DD') || ')',
          user_record.date_of_birth,
          false
        );
      END IF;
    END IF;
  END LOOP;
END $$;