-- Allow guest (unauthenticated) bookings from the contact page
-- Run this after create_appointments_system.sql

-- 1. Make user_id nullable (guests have no account)
ALTER TABLE appointments ALTER COLUMN user_id DROP NOT NULL;

-- 2. Guest identity fields
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS guest_name  text;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS guest_email text;

-- 3. RLS: allow public/anon inserts for guest bookings
--    Server-side validation (API route) is the primary guard;
--    this policy is a secondary constraint at the DB level.
CREATE POLICY IF NOT EXISTS "Public can create guest appointments"
  ON appointments FOR INSERT
  WITH CHECK (
    user_id IS NULL
    AND guest_name  IS NOT NULL AND length(trim(guest_name))  > 1
    AND guest_email IS NOT NULL AND guest_email ~* '^[^@]+@[^@]+\.[^@]+$'
  );

-- 4. Allow anon to see active appointment_types (needed for public booking UI)
--    The existing policy already covers active=true for any role, so nothing needed here.

-- 5. Working hours are already publicly readable (existing policy).
