-- Drop existing policies for items table
DROP POLICY IF EXISTS "Users can view their own items" ON items;
DROP POLICY IF EXISTS "Users can view items they have access to" ON items;
DROP POLICY IF EXISTS "Users can insert their own items" ON items;
DROP POLICY IF EXISTS "Users can update their own items" ON items;
DROP POLICY IF EXISTS "Users can delete their own items" ON items;

-- Create new policies with proper access control
CREATE POLICY "Users can view their own items"
ON items FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can view items they have access to"
ON items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM access_requests
    WHERE requester_id = auth.uid()
    AND target_id = items.user_id
    AND status = 'approved'
  )
);

CREATE POLICY "Users can insert their own items"
ON items FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update items they have access to"
ON items FOR UPDATE
USING (
  auth.uid() = user_id OR
  (
    auth.uid() = purchased_by OR
    EXISTS (
      SELECT 1 FROM access_requests
      WHERE requester_id = auth.uid()
      AND target_id = items.user_id
      AND status = 'approved'
    )
  )
);

CREATE POLICY "Users can delete their own items"
ON items FOR DELETE
USING (auth.uid() = user_id);

-- Add index to improve performance
CREATE INDEX IF NOT EXISTS idx_items_purchased_by ON items(purchased_by);