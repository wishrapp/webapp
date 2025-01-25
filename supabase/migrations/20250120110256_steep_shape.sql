/*
  # Add Purchase and Group Purchase Tables

  1. New Tables
    - `purchase_notifications`
      - `id` (uuid, primary key)
      - `item_id` (uuid, references items)
      - `purchaser_id` (uuid, references profiles)
      - `inform_owner` (boolean)
      - `reveal_identity` (boolean)
      - `created_at` (timestamptz)

    - `group_purchase_contributions`
      - `id` (uuid, primary key)
      - `item_id` (uuid, references items)
      - `contributor_id` (uuid, references profiles)
      - `amount` (decimal)
      - `show_email` (boolean)
      - `show_phone` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

-- Create purchase notifications table
CREATE TABLE purchase_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  purchaser_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  inform_owner boolean NOT NULL DEFAULT false,
  reveal_identity boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create group purchase contributions table
CREATE TABLE group_purchase_contributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  contributor_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount decimal(10,2) NOT NULL CHECK (amount > 0),
  show_email boolean NOT NULL DEFAULT false,
  show_phone boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(item_id, contributor_id)
);

-- Enable RLS
ALTER TABLE purchase_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_purchase_contributions ENABLE ROW LEVEL SECURITY;

-- Purchase notifications policies
CREATE POLICY "Users can view their own purchase notifications"
ON purchase_notifications
FOR SELECT
USING (
  purchaser_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM items
    WHERE items.id = purchase_notifications.item_id
    AND items.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create purchase notifications"
ON purchase_notifications
FOR INSERT
WITH CHECK (purchaser_id = auth.uid());

-- Group purchase contributions policies
CREATE POLICY "Users can view group purchase contributions for accessible items"
ON group_purchase_contributions
FOR SELECT
USING (
  contributor_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM items i
    LEFT JOIN access_requests ar ON ar.target_id = i.user_id
    WHERE i.id = group_purchase_contributions.item_id
    AND (
      i.user_id = auth.uid() OR
      (ar.requester_id = auth.uid() AND ar.status = 'approved')
    )
  )
);

CREATE POLICY "Users can create their own group purchase contributions"
ON group_purchase_contributions
FOR INSERT
WITH CHECK (contributor_id = auth.uid());

CREATE POLICY "Users can update their own group purchase contributions"
ON group_purchase_contributions
FOR UPDATE
USING (contributor_id = auth.uid());

CREATE POLICY "Users can delete their own group purchase contributions"
ON group_purchase_contributions
FOR DELETE
USING (contributor_id = auth.uid());

-- Add trigger for updated_at
CREATE TRIGGER update_group_purchase_contributions_updated_at
  BEFORE UPDATE ON group_purchase_contributions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add indexes
CREATE INDEX idx_purchase_notifications_item_id ON purchase_notifications(item_id);
CREATE INDEX idx_purchase_notifications_purchaser_id ON purchase_notifications(purchaser_id);
CREATE INDEX idx_group_purchase_contributions_item_id ON group_purchase_contributions(item_id);
CREATE INDEX idx_group_purchase_contributions_contributor_id ON group_purchase_contributions(contributor_id);