/*
  # Fix shared lists table structure

  1. Changes
    - Make shared_with column nullable
    - Add NOT NULL constraint to shared_email
    - Add validation trigger for sharing requirements

  2. Security
    - Maintain existing RLS policies
    - Ensure at least one sharing method is used
*/

-- Modify shared_lists table constraints
ALTER TABLE shared_lists
ALTER COLUMN shared_with DROP NOT NULL,
ALTER COLUMN shared_email SET NOT NULL;

-- Create validation trigger
CREATE OR REPLACE FUNCTION validate_share_requirements()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure we have at least an email for sharing
  IF NEW.shared_email IS NULL THEN
    RAISE EXCEPTION 'shared_email is required';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_share_requirements
  BEFORE INSERT OR UPDATE ON shared_lists
  FOR EACH ROW
  EXECUTE FUNCTION validate_share_requirements();