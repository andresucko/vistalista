/*
  # Fix cascade delete for saved lists

  1. Changes
    - Create saved_lists table if it doesn't exist
    - Create saved_list_items table if it doesn't exist
    - Add ON DELETE CASCADE to foreign key constraints
    - Enable RLS on both tables
    - Add appropriate policies

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their lists and items
*/

-- Create saved_lists table if it doesn't exist
CREATE TABLE IF NOT EXISTS saved_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create saved_list_items table if it doesn't exist
CREATE TABLE IF NOT EXISTS saved_list_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id uuid REFERENCES saved_lists(id) ON DELETE CASCADE,
  name text NOT NULL,
  price numeric DEFAULT 0,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE saved_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_list_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can manage their own lists" ON saved_lists;
  DROP POLICY IF EXISTS "Users can manage items in their lists" ON saved_list_items;
END $$;

-- Policies for saved_lists
CREATE POLICY "Users can manage their own lists"
  ON saved_lists
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policies for saved_list_items
CREATE POLICY "Users can manage items in their lists"
  ON saved_list_items
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