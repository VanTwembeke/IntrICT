-- IntrICT: Package requests table
-- Run this in Supabase SQL editor after create_packages_table.sql

CREATE TABLE IF NOT EXISTS package_requests (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       uuid        REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  package_name  text        NOT NULL,
  package_price integer     NOT NULL DEFAULT 0,
  status        text        NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending', 'contacted', 'accepted', 'rejected')),
  notes         text,       -- user's optional message
  admin_notes   text,       -- internal admin notes
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE package_requests ENABLE ROW LEVEL SECURITY;

-- Users can read their own requests
CREATE POLICY "Users can read own requests"
  ON package_requests FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Users can create requests for themselves
CREATE POLICY "Users can create requests"
  ON package_requests FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Admins can read all requests
CREATE POLICY "Admins can read all requests"
  ON package_requests FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Auto-update updated_at (reuses function from packages table if already created)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS package_requests_updated_at ON package_requests;
CREATE TRIGGER package_requests_updated_at
  BEFORE UPDATE ON package_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
