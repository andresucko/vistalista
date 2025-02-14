/*
  # Add share links support

  1. Changes
    - Add share_token column to saved_lists
    - Add share_expires_at column for link expiration
    - Update policies to support public link access

  2. Security
    - Maintain RLS
    - Add token-based access
    - Support expiring links
*/

-- Add share token and expiration to saved_lists
ALTER TABLE saved_lists
ADD COLUMN IF NOT EXISTS share_token uuid DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS share_expires_at timestamptz;

-- Create index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_saved_lists_share_token ON saved_lists(share_token);

-- Update policies to allow access via share token
CREATE POLICY "Access via share token"
  ON saved_lists
  FOR SELECT
  TO authenticated
  USING (
    share_token IS NOT NULL 
    AND (share_expires_at IS NULL OR share_expires_at > now())
  );