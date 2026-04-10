-- ─── Appointment types ─────────────────────────────────────────────────────────
-- Defines what kinds of meetings are available
CREATE TABLE IF NOT EXISTS appointment_types (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text    NOT NULL,
  duration_minutes int    NOT NULL,
  description     text,
  requires_package boolean DEFAULT false,  -- must have accepted package_request
  max_per_user    int     DEFAULT NULL,    -- NULL = unlimited; 1 = free session
  color           text    DEFAULT '#3b82f6',
  active          boolean DEFAULT true,
  sort_order      int     DEFAULT 0,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- ─── Package → appointment type entitlements ────────────────────────────────────
-- Links packages to which session types they unlock and how many
CREATE TABLE IF NOT EXISTS package_appointment_types (
  package_id          uuid REFERENCES packages(id) ON DELETE CASCADE,
  appointment_type_id uuid REFERENCES appointment_types(id) ON DELETE CASCADE,
  sessions_included   int DEFAULT NULL, -- NULL = unlimited
  PRIMARY KEY (package_id, appointment_type_id)
);

-- ─── Working hours ──────────────────────────────────────────────────────────────
-- Admin's weekly availability schedule
CREATE TABLE IF NOT EXISTS working_hours (
  day_of_week  smallint PRIMARY KEY CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sun, 1=Mon … 6=Sat
  start_time   time    NOT NULL DEFAULT '09:00',
  end_time     time    NOT NULL DEFAULT '18:00',
  is_active    boolean DEFAULT true,
  break_start  time    DEFAULT NULL,
  break_end    time    DEFAULT NULL,
  updated_at   timestamptz DEFAULT now()
);

-- ─── Appointments ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS appointments (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  appointment_type_id uuid REFERENCES appointment_types(id),
  type_name           text NOT NULL,           -- denormalized for display
  duration_minutes    int  NOT NULL,
  starts_at           timestamptz NOT NULL,
  ends_at             timestamptz NOT NULL,
  status              text NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending','confirmed','cancelled','completed','no_show')),
  notes               text,                    -- user message
  admin_notes         text,
  meeting_link        text,
  location            text,
  color               text DEFAULT '#3b82f6',
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

-- ─── Time logs ──────────────────────────────────────────────────────────────────
-- Admin tracks billable / non-billable time per customer per day
CREATE TABLE IF NOT EXISTS time_logs (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  logged_date      date NOT NULL,
  duration_minutes int  NOT NULL,
  description      text,
  billable         boolean DEFAULT true,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

-- ─── Calendar token (for iCal feed URLs) ───────────────────────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS calendar_token uuid DEFAULT gen_random_uuid();

-- ─── Triggers: keep updated_at fresh ───────────────────────────────────────────
CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'appointments_updated_at') THEN
    CREATE TRIGGER appointments_updated_at
      BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'time_logs_updated_at') THEN
    CREATE TRIGGER time_logs_updated_at
      BEFORE UPDATE ON time_logs FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'appointment_types_updated_at') THEN
    CREATE TRIGGER appointment_types_updated_at
      BEFORE UPDATE ON appointment_types FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
  END IF;
END $$;

-- ─── Row Level Security ─────────────────────────────────────────────────────────
ALTER TABLE appointment_types       ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_appointment_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE working_hours           ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments            ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_logs               ENABLE ROW LEVEL SECURITY;

-- appointment_types: everyone can read active types; only admins can write
CREATE POLICY "Anyone reads active appointment types"
  ON appointment_types FOR SELECT USING (active = true);
CREATE POLICY "Admins manage appointment types"
  ON appointment_types FOR ALL
  USING  ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- package_appointment_types: public read, admin write
CREATE POLICY "Anyone reads package appointment types"
  ON package_appointment_types FOR SELECT USING (true);
CREATE POLICY "Admins manage package appointment types"
  ON package_appointment_types FOR ALL
  USING  ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- working_hours: public read, admin write
CREATE POLICY "Anyone reads working hours"
  ON working_hours FOR SELECT USING (true);
CREATE POLICY "Admins manage working hours"
  ON working_hours FOR ALL
  USING  ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- appointments: user sees own; admin sees all
CREATE POLICY "Users read own appointments"
  ON appointments FOR SELECT
  USING (user_id = auth.uid());
CREATE POLICY "Admin reads all appointments"
  ON appointments FOR SELECT
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Authenticated users create appointments"
  ON appointments FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());
CREATE POLICY "Admin updates any appointment"
  ON appointments FOR UPDATE
  USING  ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Users cancel own appointment"
  ON appointments FOR UPDATE
  USING (user_id = auth.uid() AND status = 'pending')
  WITH CHECK (user_id = auth.uid() AND status = 'cancelled');

-- time_logs: admin only
CREATE POLICY "Admin manages time logs"
  ON time_logs FOR ALL
  USING  ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Users read own time logs"
  ON time_logs FOR SELECT
  USING (user_id = auth.uid());

-- ─── Seed data ──────────────────────────────────────────────────────────────────

-- Default appointment types
INSERT INTO appointment_types (name, duration_minutes, description, requires_package, max_per_user, color, sort_order)
VALUES
  ('Gratis kennismaking', 20,
   'Een gratis kennismakingsgesprek van 20 minuten. Eenmalig beschikbaar voor iedereen.',
   false, 1, '#10b981', 0),
  ('Standaard sessie (Teams/Live)', 50,
   'Een uitgebreide sessie van 50 minuten via Microsoft Teams of live in Gent.',
   true, NULL, '#3b82f6', 1)
ON CONFLICT DO NOTHING;

-- Default working hours (Mon–Fri active, Sat–Sun inactive)
INSERT INTO working_hours (day_of_week, start_time, end_time, is_active, break_start, break_end)
VALUES
  (0, '09:00', '18:00', false, NULL,    NULL),    -- Sunday
  (1, '09:00', '18:00', true,  '12:00', '13:00'), -- Monday
  (2, '09:00', '18:00', true,  '12:00', '13:00'), -- Tuesday
  (3, '09:00', '18:00', true,  '12:00', '13:00'), -- Wednesday
  (4, '09:00', '18:00', true,  '12:00', '13:00'), -- Thursday
  (5, '09:00', '18:00', true,  '12:00', '13:00'), -- Friday
  (6, '09:00', '14:00', false, NULL,    NULL)      -- Saturday
ON CONFLICT (day_of_week) DO NOTHING;
