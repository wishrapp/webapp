/*
  # Fix Occasions Table Policies

  1. Changes
    - Drop existing policies first
    - Recreate policies with unique names
    - Keep table and triggers intact
    
  2. Security
    - Maintain same security rules
    - Ensure proper access control
*/

-- First drop all existing policies for occasions table
DROP POLICY IF EXISTS "occasions_allow_select" ON occasions;
DROP POLICY IF EXISTS "occasions_allow_insert" ON occasions;
DROP POLICY IF EXISTS "occasions_allow_update" ON occasions;
DROP POLICY IF EXISTS "occasions_allow_delete" ON occasions;
DROP POLICY IF EXISTS "occasions_allow_admin" ON occasions;
DROP POLICY IF EXISTS "Public occasions are viewable by everyone" ON occasions;
DROP POLICY IF EXISTS "Users can view their own occasions" ON occasions;
DROP POLICY IF EXISTS "Users can insert their own occasions" ON occasions;
DROP POLICY IF EXISTS "Users can update their own occasions" ON occasions;
DROP POLICY IF EXISTS "Users can delete their own occasions" ON occasions;

-- Create new policies with unique names
CREATE POLICY "occasions_policy_select_own"
ON occasions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "occasions_policy_select_shared"
ON occasions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM access_requests
    WHERE requester_id = auth.uid()
    AND target_id = occasions.user_id
    AND status = 'approved'
  )
);

CREATE POLICY "occasions_policy_insert"
ON occasions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "occasions_policy_update"
ON occasions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "occasions_policy_delete"
ON occasions FOR DELETE
USING (auth.uid() = user_id AND NOT is_default);

CREATE POLICY "occasions_policy_admin"
ON occasions
USING (is_admin());