/*
  # Add User Favorites Feature

  1. New Tables
    - `user_favorites`
      - `id` (uuid, primary key)
      - `user_id` (uuid) - The user who created the favorite
      - `favorite_user_id` (uuid) - The user being favorited
      - `created_at` (timestamptz)
      - `favorite_username` (text) - Denormalized username for easier querying

  2. Security
    - Enable RLS
    - Add policies for CRUD operations
    - Add indexes for performance

  3. Changes
    - Add trigger to update favorite_username when profile username changes
*/

-- Create user favorites table
CREATE TABLE user_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  favorite_user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  favorite_username text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, favorite_user_id)
);

-- Enable RLS
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own favorites"
ON user_favorites FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites"
ON user_favorites FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own favorites"
ON user_favorites FOR DELETE
USING (auth.uid() = user_id);

-- Create function to update favorite username
CREATE OR REPLACE FUNCTION update_favorite_username()
RETURNS trigger AS $$
BEGIN
  SELECT username INTO NEW.favorite_username
  FROM profiles WHERE id = NEW.favorite_user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update favorite username on insert or update
CREATE TRIGGER update_favorite_username_trigger
  BEFORE INSERT OR UPDATE ON user_favorites
  FOR EACH ROW
  EXECUTE FUNCTION update_favorite_username();

-- Create trigger to update favorite usernames when profile username changes
CREATE OR REPLACE FUNCTION update_favorite_usernames_on_profile_update()
RETURNS trigger AS $$
BEGIN
  UPDATE user_favorites
  SET favorite_username = NEW.username
  WHERE favorite_user_id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_favorite_usernames_on_profile_update_trigger
  AFTER UPDATE OF username ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_favorite_usernames_on_profile_update();

-- Add indexes
CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX idx_user_favorites_favorite_user_id ON user_favorites(favorite_user_id);
CREATE INDEX idx_user_favorites_favorite_username ON user_favorites(favorite_username);