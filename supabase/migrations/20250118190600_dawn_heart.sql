/*
  # Initial Wishr Database Schema

  1. New Tables
    - `profiles`
      - Core user profile information
      - Includes verification, suspension, and premium status
    - `occasions`
      - User-specific occasions/events
    - `items`
      - Wishlist items with details and purchase status
    - `access_requests`
      - Manages wishlist viewing permissions
    - `messages`
      - System for user-to-user communication
    - `group_purchases`
      - Tracks group buying intentions and contributions
    - `admin_users`
      - Stores approved admin email addresses
    - `affiliate_settings`
      - Manages affiliate program configurations

  2. Security
    - RLS policies for all tables
    - Strict access control based on user roles
    - Protected admin-only tables

  3. Indexes
    - Optimized queries for frequent operations
    - B-tree indexes for foreign keys and common queries
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  username citext UNIQUE NOT NULL,
  email citext UNIQUE NOT NULL,
  date_of_birth date NOT NULL,
  country text NOT NULL,
  telephone text NOT NULL,
  profile_image_url text,
  email_notifications boolean NOT NULL DEFAULT true,
  terms_accepted boolean NOT NULL DEFAULT false,
  verified boolean NOT NULL DEFAULT false,
  suspended boolean NOT NULL DEFAULT false,
  reported boolean NOT NULL DEFAULT false,
  premium_member boolean NOT NULL DEFAULT false,
  premium_expiry timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Occasions table
CREATE TABLE occasions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  date date,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Items table
CREATE TABLE items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL,
  price decimal(10,2),
  occasion_id uuid REFERENCES occasions(id) ON DELETE SET NULL,
  image_url text,
  item_url text,
  purchased boolean NOT NULL DEFAULT false,
  purchased_by uuid REFERENCES profiles(id),
  purchased_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Access requests table
CREATE TABLE access_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(requester_id, target_id)
);

-- Messages table
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject text NOT NULL,
  content text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  related_item_id uuid REFERENCES items(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Group purchases table
CREATE TABLE group_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  max_contribution decimal(10,2) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(item_id, user_id)
);

-- Admin users table
CREATE TABLE admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email citext UNIQUE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Affiliate settings table
CREATE TABLE affiliate_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL,
  settings jsonb NOT NULL DEFAULT '{}',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(platform)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE occasions ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Occasions
CREATE POLICY "Users can view their own occasions" ON occasions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own occasions" ON occasions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own occasions" ON occasions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own occasions" ON occasions
  FOR DELETE USING (auth.uid() = user_id);

-- Items
CREATE POLICY "Users can view their own items" ON items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view items they have access to" ON items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM access_requests
      WHERE requester_id = auth.uid()
      AND target_id = items.user_id
      AND status = 'approved'
    )
  );

CREATE POLICY "Users can insert their own items" ON items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own items" ON items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own items" ON items
  FOR DELETE USING (auth.uid() = user_id);

-- Access Requests
CREATE POLICY "Users can view their own access requests" ON access_requests
  FOR SELECT USING (
    auth.uid() = requester_id OR
    auth.uid() = target_id
  );

CREATE POLICY "Users can create access requests" ON access_requests
  FOR INSERT WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update received access requests" ON access_requests
  FOR UPDATE USING (auth.uid() = target_id);

-- Messages
CREATE POLICY "Users can view their own messages" ON messages
  FOR SELECT USING (
    auth.uid() = sender_id OR
    auth.uid() = recipient_id
  );

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Recipients can update message read status" ON messages
  FOR UPDATE USING (auth.uid() = recipient_id);

CREATE POLICY "Users can delete their received messages" ON messages
  FOR DELETE USING (auth.uid() = recipient_id);

-- Group Purchases
CREATE POLICY "Users can view group purchases for accessible items" ON group_purchases
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM items i
      LEFT JOIN access_requests ar ON ar.target_id = i.user_id
      WHERE i.id = group_purchases.item_id
      AND (
        i.user_id = auth.uid() OR
        (ar.requester_id = auth.uid() AND ar.status = 'approved')
      )
    )
  );

CREATE POLICY "Users can create group purchase intentions" ON group_purchases
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their group purchase intentions" ON group_purchases
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their group purchase intentions" ON group_purchases
  FOR DELETE USING (auth.uid() = user_id);

-- Admin Users
CREATE POLICY "Admin emails are viewable by authenticated users" ON admin_users
  FOR SELECT USING (auth.role() = 'authenticated');

-- Affiliate Settings
CREATE POLICY "Affiliate settings are viewable by authenticated users" ON affiliate_settings
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can modify affiliate settings" ON affiliate_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE email = auth.email()
    )
  );

-- Functions

-- Function to check if a user is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE email = auth.email()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_items_updated_at
  BEFORE UPDATE ON items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_access_requests_updated_at
  BEFORE UPDATE ON access_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_affiliate_settings_updated_at
  BEFORE UPDATE ON affiliate_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX idx_profiles_username_trgm ON profiles USING gist (username gist_trgm_ops);
CREATE INDEX idx_items_user_id ON items(user_id);
CREATE INDEX idx_occasions_user_id ON occasions(user_id);
CREATE INDEX idx_access_requests_target_id ON access_requests(target_id);
CREATE INDEX idx_access_requests_requester_id ON access_requests(requester_id);
CREATE INDEX idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_group_purchases_item_id ON group_purchases(item_id);