/*
  # Create user items table

  1. New Tables
    - `user_items`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `price` (numeric)
      - `completed` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `user_items` table
    - Add policies for authenticated users to:
      - Read their own items
      - Create new items
      - Update their own items
      - Delete their own items
*/

CREATE TABLE IF NOT EXISTS user_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  price numeric DEFAULT 0,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_items ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to read their own items
CREATE POLICY "Users can read own items"
  ON user_items
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy to allow users to create items
CREATE POLICY "Users can create items"
  ON user_items
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update their own items
CREATE POLICY "Users can update own items"
  ON user_items
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to delete their own items
CREATE POLICY "Users can delete own items"
  ON user_items
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);