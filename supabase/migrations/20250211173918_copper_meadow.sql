/*
  # Shopping List Schema

  1. New Tables
    - `shopping_items`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `price` (numeric)
      - `completed` (boolean)
      - `created_at` (timestamp)
    - `saved_lists`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `created_at` (timestamp)
    - `saved_list_items`
      - `id` (uuid, primary key)
      - `list_id` (uuid, references saved_lists)
      - `name` (text)
      - `price` (numeric)
      - `completed` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create shopping_items table
CREATE TABLE IF NOT EXISTS shopping_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  price numeric DEFAULT 0,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create saved_lists table
CREATE TABLE IF NOT EXISTS saved_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create saved_list_items table
CREATE TABLE IF NOT EXISTS saved_list_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id uuid REFERENCES saved_lists ON DELETE CASCADE,
  name text NOT NULL,
  price numeric DEFAULT 0,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE shopping_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_list_items ENABLE ROW LEVEL SECURITY;

-- Policies for shopping_items
CREATE POLICY "Users can manage their own shopping items"
  ON shopping_items
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policies for saved_lists
CREATE POLICY "Users can manage their own saved lists"
  ON saved_lists
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policies for saved_list_items
CREATE POLICY "Users can manage items in their saved lists"
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