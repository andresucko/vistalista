/*
  # Fix saved lists and shared lists policies

  1. Changes
    - Drop all existing policies to start fresh
    - Create separate policies for owners and shared users
    - Ensure no circular dependencies in policy definitions

  2. Security
    - Maintain strict row level security
    - Separate read and write permissions
    - Clear ownership boundaries
*/

-- First, drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can manage their own lists" ON saved_lists;
DROP POLICY IF EXISTS "Users can view lists shared with them" ON saved_lists;
DROP POLICY IF EXISTS "Users can view shared lists" ON saved_lists;
DROP POLICY IF EXISTS "Users can share their own lists" ON shared_lists;
DROP POLICY IF EXISTS "Users can view lists shared with them" ON shared_lists;

-- Create basic ownership policy for saved_lists
CREATE POLICY "Users can manage own lists"
  ON saved_lists
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create read-only policy for shared lists
CREATE POLICY "Shared lists access"
  ON saved_lists
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM shared_lists
      WHERE shared_lists.list_id = saved_lists.id
      AND shared_lists.shared_with = auth.uid()
    )
  );

-- Create policies for shared_lists table
CREATE POLICY "Manage shared lists"
  ON shared_lists
  FOR ALL
  TO authenticated
  USING (shared_by = auth.uid())
  WITH CHECK (shared_by = auth.uid());

CREATE POLICY "View received shares"
  ON shared_lists
  FOR SELECT
  TO authenticated
  USING (shared_with = auth.uid());

-- Create policies for saved_list_items
CREATE POLICY "Manage own list items"
  ON saved_list_items
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM saved_lists
      WHERE saved_lists.id = saved_list_items.list_id
      AND saved_lists.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM saved_lists
      WHERE saved_lists.id = saved_list_items.list_id
      AND saved_lists.user_id = auth.uid()
    )
  );

CREATE POLICY "View shared list items"
  ON saved_list_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM shared_lists
      WHERE shared_lists.list_id = saved_list_items.list_id
      AND shared_lists.shared_with = auth.uid()
    )
  );