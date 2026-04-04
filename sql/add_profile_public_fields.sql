-- Add public profile fields for profile pictures, public usernames, customer numbers and privacy settings.
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS profile_picture_url TEXT,
  ADD COLUMN IF NOT EXISTS public_username TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS customer_number INTEGER UNIQUE,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS show_public_email BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS show_public_company BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS show_public_location BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS show_public_review BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS review_score INTEGER CHECK (review_score >= 1 AND review_score <= 5),
  ADD COLUMN IF NOT EXISTS review_text TEXT;

-- If your `role` column is a text column, no additional SQL is needed for the new Klant role.
-- If your `role` column is a PostgreSQL enum, add the new value like this:
-- ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'klant';

-- Optional: backfill customer numbers for existing rows without one.
-- UPDATE profiles
-- SET customer_number = nextval('profiles_customer_number_seq')
-- WHERE customer_number IS NULL;
