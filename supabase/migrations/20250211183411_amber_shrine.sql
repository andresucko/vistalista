/*
  # Add list sharing functionality

  1. New Tables
    - `shared_lists`
      - `id` (uuid, primary key)
      - `list_id` (uuid, references saved_lists)
      - `shared_by` (uuid, references auth.users)
      - `shared_with` (uuid, references auth.users)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `shared_lists` table
    - Add policies for:
      - Owners can share their lists
      - Recipients can view shared lists
*/

-- Create shared_lists table
CREATE TABLE IF NOT EXISTS shared_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id uuid REFERENCES saved_lists ON DELETE CASCADE,
  shared_by uuid REFERENCES auth.users NOT NULL,
  shared_with uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE shared_lists ENABLE ROW LEVEL SECURITY;

-- Policy for list owners
CREATE POLICY "Users can share their own lists"
  ON shared_lists
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM saved_lists
      WHERE saved_lists.id = list_id
      AND saved_lists.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM saved_lists
      WHERE saved_lists.id = list_id
      AND saved_lists.user_id = auth.uid()
    )
  );

-- Policy for recipients to view shared lists
CREATE POLICY "Users can view lists shared with them"
  ON shared_lists
  FOR SELECT
  TO authenticated
  USING (shared_with = auth.uid());

-- Update saved_lists policies to allow viewing shared lists
CREATE POLICY "Users can view lists shared with them"
  ON saved_lists
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM shared_lists
      WHERE shared_lists.list_id = id
      AND shared_lists.shared_with = auth.uid()
    )
  );

-- Update saved_list_items policies to allow viewing shared items
CREATE POLICY "Users can view items in lists shared with them"
  ON saved_list_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM shared_lists
      WHERE shared_lists.list_id = list_id
      AND shared_lists.shared_with = auth.uid()
    )
  );