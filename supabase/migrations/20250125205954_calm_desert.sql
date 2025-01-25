/*
  # Create Occasions Table

  1. Changes
    - Create occasions table if it doesn't exist
    - Add required columns and constraints
    - Enable RLS
    - Add policies
    - Add indexes

  2. Security
    - Enable RLS
    - Add policies for user access
*/

-- Create occasions table if it doesn't exist
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

-- Create policies
CREATE POLICY "occasions_allow_select"
ON occasions FOR SELECT
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM access_requests
    WHERE requester_id = auth.uid()
    AND target_id = occasions.user_id
    AND status = 'approved'
  )
);

CREATE POLICY "occasions_allow_insert"
ON occasions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "occasions_allow_update"
ON occasions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "occasions_allow_delete"
ON occasions FOR DELETE
USING (auth.uid() = user_id AND NOT is_default);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_occasions_user_id ON occasions(user_id);
CREATE INDEX IF NOT EXISTS idx_occasions_date ON occasions(date);

-- Add admin policy
CREATE POLICY "occasions_allow_admin"
ON occasions
USING (is_admin());

-- Function to add default occasions for new users
CREATE OR REPLACE FUNCTION add_default_occasions()
RETURNS trigger AS $$
BEGIN
  -- Insert "No occasion" as default
  INSERT INTO occasions (user_id, name, is_default)
  VALUES (NEW.id, 'No occasion', true);

  -- Insert "Birthday" with user's birth date
  INSERT INTO occasions (user_id, name, date, is_default)
  VALUES (
    NEW.id,
    'Birthday (' || to_char(NEW.date_of_birth::date, 'FMMonth DD') || ')',
    NEW.date_of_birth,
    false
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new users
DROP TRIGGER IF EXISTS add_default_occasions_trigger ON profiles;
CREATE TRIGGER add_default_occasions_trigger
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION add_default_occasions();