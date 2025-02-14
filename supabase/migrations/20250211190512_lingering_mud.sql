/*
  # Fix sharing functionality

  1. Changes
    - Add shared_email column to shared_lists table
    - Update policies to work with email-based sharing
    - Add indexes for better performance

  2. Security
    - Maintain RLS policies for proper access control
    - Ensure shared lists can only be accessed by intended recipients
*/

-- Add email column to shared_lists
ALTER TABLE shared_lists
ADD COLUMN IF NOT EXISTS shared_email text;

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_shared_lists_email 
ON shared_lists(shared_email);

-- Update shared_lists policies
DROP POLICY IF EXISTS "Manage shared lists" ON shared_lists;
DROP POLICY IF EXISTS "View received shares" ON shared_lists;

CREATE POLICY "Manage shared lists"
  ON shared_lists
  FOR ALL
  TO authenticated
  USING (shared_by = auth.uid())
  WITH CHECK (shared_by = auth.uid());

CREATE POLICY "Access shared lists by email"
  ON shared_lists
  FOR SELECT
  TO authenticated
  USING (
    shared_email = auth.jwt()->>'email'
    OR shared_with = auth.uid()
  );

-- Update saved_lists policies for token-based sharing
CREATE POLICY "Access via share token or email"
  ON saved_lists
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT list_id
      FROM shared_lists
      WHERE shared_email = auth.jwt()->>'email'
      OR shared_with = auth.uid()
    )
    OR (
      share_token IS NOT NULL 
      AND (share_expires_at IS NULL OR share_expires_at > now())
    )
  );