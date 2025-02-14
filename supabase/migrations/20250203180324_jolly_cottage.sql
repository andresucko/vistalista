/*
  # Fix saved lists foreign key constraint

  1. Changes
    - Drop existing foreign key constraint
    - Add correct foreign key constraint to auth.users table
*/

-- Drop existing foreign key constraint
ALTER TABLE IF EXISTS saved_lists
  DROP CONSTRAINT IF EXISTS saved_lists_user_id_fkey;

-- Add correct foreign key constraint
ALTER TABLE saved_lists
  ADD CONSTRAINT saved_lists_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;