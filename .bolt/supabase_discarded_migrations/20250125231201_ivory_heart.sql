-- First create occasions table if it doesn't exist
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
CREATE POLICY "occasions_select_231500"
ON occasions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "occasions_select_shared_231500"
ON occasions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM access_requests
    WHERE requester_id = auth.uid()
    AND target_id = occasions.user_id
    AND status = 'approved'
  )
);

CREATE POLICY "occasions_insert_231500"
ON occasions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "occasions_update_231500"
ON occasions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "occasions_delete_231500"
ON occasions FOR DELETE
USING (auth.uid() = user_id AND NOT is_default);

CREATE POLICY "occasions_admin_231500"
ON occasions
USING (is_admin());

-- Re-enable triggers in correct order
ALTER TABLE profiles ENABLE TRIGGER verify_new_profile_trigger;
ALTER TABLE profiles ENABLE TRIGGER sync_email_to_auth_users_trigger;
ALTER TABLE auth.users ENABLE TRIGGER sync_email_from_auth_users_trigger;
ALTER TABLE profiles ENABLE TRIGGER add_default_occasions_trigger;