-- Drop all existing policies first
DROP POLICY IF EXISTS "occasions_allow_select" ON occasions;
DROP POLICY IF EXISTS "occasions_allow_insert" ON occasions;
DROP POLICY IF EXISTS "occasions_allow_update" ON occasions;
DROP POLICY IF EXISTS "occasions_allow_delete" ON occasions;
DROP POLICY IF EXISTS "occasions_allow_admin" ON occasions;
DROP POLICY IF EXISTS "occasions_select_own_223035" ON occasions;
DROP POLICY IF EXISTS "occasions_select_shared_223035" ON occasions;
DROP POLICY IF EXISTS "occasions_insert_223035" ON occasions;
DROP POLICY IF EXISTS "occasions_update_223035" ON occasions;
DROP POLICY IF EXISTS "occasions_delete_223035" ON occasions;
DROP POLICY IF EXISTS "occasions_admin_223035" ON occasions;

-- Create new policies with unique timestamps
CREATE POLICY "occasions_select_225655"
ON occasions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "occasions_select_shared_225655"
ON occasions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM access_requests
    WHERE requester_id = auth.uid()
    AND target_id = occasions.user_id
    AND status = 'approved'
  )
);

CREATE POLICY "occasions_insert_225655"
ON occasions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "occasions_update_225655"
ON occasions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "occasions_delete_225655"
ON occasions FOR DELETE
USING (auth.uid() = user_id AND NOT is_default);

CREATE POLICY "occasions_admin_225655"
ON occasions
USING (is_admin());

-- Create function to add default occasions
CREATE OR REPLACE FUNCTION add_default_occasions()
RETURNS trigger AS $$
BEGIN
  -- Only add default occasions if they don't exist for this user
  IF NOT EXISTS (
    SELECT 1 FROM occasions 
    WHERE user_id = NEW.id AND is_default = true
  ) THEN
    -- Insert "No occasion" as default
    INSERT INTO occasions (user_id, name, is_default)
    VALUES (NEW.id, 'No occasion', true);

    -- Insert "Birthday" with user's birth date
    IF NEW.date_of_birth IS NOT NULL THEN
      INSERT INTO occasions (user_id, name, date, is_default)
      VALUES (
        NEW.id,
        'Birthday (' || to_char(NEW.date_of_birth::date, 'FMMonth DD') || ')',
        NEW.date_of_birth,
        false
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new users
CREATE TRIGGER add_default_occasions_trigger
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION add_default_occasions();

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