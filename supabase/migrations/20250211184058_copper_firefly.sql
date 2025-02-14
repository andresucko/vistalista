/*
  # Fix saved lists policies

  1. Changes
    - Remove recursive policies that were causing infinite recursion
    - Simplify policies to use direct user ID checks
    - Add separate policies for shared lists access

  2. Security
    - Maintain row level security
    - Ensure users can only access their own lists and lists shared with them
*/

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Users can manage their own lists" ON saved_lists;
DROP POLICY IF EXISTS "Users can view lists shared with them" ON saved_lists;

-- Create new, simplified policies
CREATE POLICY "Users can manage their own lists"
  ON saved_lists
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Separate policy for viewing shared lists
CREATE POLICY "Users can view shared lists"
  ON saved_lists
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT list_id 
      FROM shared_lists 
      WHERE shared_with = auth.uid()
    )
  );