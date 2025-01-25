/*
  # Fix Occasions Table Case Sensitivity

  1. Changes
    - Use double quotes for table name to ensure case sensitivity
    - Update all references to use quoted table name
    - Keep existing policies and triggers
    
  2. Security
    - Maintain same security rules
    - Ensure proper access control
*/

-- First drop existing triggers and functions to avoid conflicts
DROP TRIGGER IF EXISTS add_default_occasions_trigger ON "profiles";
DROP FUNCTION IF EXISTS add_default_occasions() CASCADE;

-- Create occasions table if it doesn't exist
CREATE TABLE IF NOT EXISTS "occasions" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES "profiles"(id) ON DELETE CASCADE,
  name text NOT NULL,
  date date,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE "occasions" ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_occasions_user_id ON "occasions"(user_id);
CREATE INDEX IF NOT EXISTS idx_occasions_date ON "occasions"(date);

-- Create policies with proper table references
CREATE POLICY "occasions_policy_select_own"
ON "occasions" FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "occasions_policy_select_shared"
ON "occasions" FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM "access_requests"
    WHERE requester_id = auth.uid()
    AND target_id = "occasions".user_id
    AND status = 'approved'
  )
);

CREATE POLICY "occasions_policy_insert"
ON "occasions" FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "occasions_policy_update"
ON "occasions" FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "occasions_policy_delete"
ON "occasions" FOR DELETE
USING (auth.uid() = user_id AND NOT is_default);

CREATE POLICY "occasions_policy_admin"
ON "occasions"
USING (is_admin());

-- Create function to add default occasions
CREATE OR REPLACE FUNCTION add_default_occasions()
RETURNS trigger AS $$
BEGIN
  -- Only add default occasions if they don't exist for this user
  IF NOT EXISTS (
    SELECT 1 FROM "occasions" 
    WHERE user_id = NEW.id AND is_default = true
  ) THEN
    -- Insert "No occasion" as default
    INSERT INTO "occasions" (user_id, name, is_default)
    VALUES (NEW.id, 'No occasion', true);

    -- Insert "Birthday" with user's birth date
    INSERT INTO "occasions" (user_id, name, date, is_default)
    VALUES (
      NEW.id,
      'Birthday (' || to_char(NEW.date_of_birth::date, 'FMMonth DD') || ')',
      NEW.date_of_birth,
      false
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new users
CREATE TRIGGER add_default_occasions_trigger
  AFTER INSERT ON "profiles"
  FOR EACH ROW
  EXECUTE FUNCTION add_default_occasions();

-- Add default occasions for existing users
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT id, date_of_birth FROM "profiles"
  LOOP
    -- Only add if user doesn't have any default occasions
    IF NOT EXISTS (
      SELECT 1 FROM "occasions" 
      WHERE user_id = user_record.id AND is_default = true
    ) THEN
      -- Add "No occasion"
      INSERT INTO "occasions" (user_id, name, is_default)
      VALUES (user_record.id, 'No occasion', true);

      -- Add "Birthday"
      INSERT INTO "occasions" (user_id, name, date, is_default)
      VALUES (
        user_record.id,
        'Birthday (' || to_char(user_record.date_of_birth::date, 'FMMonth DD') || ')',
        user_record.date_of_birth,
        false
      );
    END IF;
  END LOOP;
END $$;