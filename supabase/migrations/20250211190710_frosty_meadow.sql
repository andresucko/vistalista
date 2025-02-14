/*
  # Fix share token generation

  1. Changes
    - Add function to generate share tokens
    - Update share token column to use the function
    - Add trigger to handle token generation

  2. Security
    - Maintain RLS policies
    - Ensure secure token generation
*/

-- Create function to generate share tokens
CREATE OR REPLACE FUNCTION generate_share_token()
RETURNS uuid
LANGUAGE sql
AS $$
  SELECT gen_random_uuid();
$$;

-- Update share_token column to use the function
ALTER TABLE saved_lists
ALTER COLUMN share_token SET DEFAULT generate_share_token();

-- Create trigger to ensure share token is set
CREATE OR REPLACE FUNCTION ensure_share_token()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.share_token IS NULL THEN
    NEW.share_token := generate_share_token();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_share_token
  BEFORE INSERT OR UPDATE ON saved_lists
  FOR EACH ROW
  EXECUTE FUNCTION ensure_share_token();