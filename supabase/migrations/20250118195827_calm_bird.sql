/*
  # Fix profiles RLS policies

  1. Changes
    - Add INSERT policy for profiles table to allow new users to create their profile
    - Keep existing policies intact
  
  2. Security
    - Only allows users to insert their own profile (where id matches their auth.uid())
    - Maintains existing RLS policies for other operations
*/

-- Add INSERT policy for profiles
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);