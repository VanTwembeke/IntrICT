-- ═══════════════════════════════════════════════════════════════════════════
-- CLIENT SYSTEM: dossiers · activity · invoices
-- Run AFTER create_appointments_system.sql (requires profiles + packages)
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. CLIENT DOSSIERS ─────────────────────────────────────────────────────
-- One dossier per registered user. Tracks lifecycle stage.

CREATE TABLE IF NOT EXISTS client_dossiers (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id  uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status      text        NOT NULL DEFAULT 'lead'
                          CHECK (status IN ('lead','prospect','klant','completed')),
  notes       text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id)
);

-- ── 2. DOSSIER PACKAGES ────────────────────────────────────────────────────
-- Which packages are active for a client dossier.

CREATE TABLE IF NOT EXISTS dossier_packages (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier_id   uuid        NOT NULL REFERENCES client_dossiers(id) ON DELETE CASCADE,
  package_id   uuid        NOT NULL REFERENCES packages(id) ON DELETE RESTRICT,
  is_active    boolean     NOT NULL DEFAULT true,
  is_recurring boolean     NOT NULL DEFAULT false,
  started_at   timestamptz NOT NULL DEFAULT now(),
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- ── 3. ACTIVITY LOGS ───────────────────────────────────────────────────────
-- Central feed for all important events.

CREATE TABLE IF NOT EXISTS activity_logs (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id  uuid        REFERENCES profiles(id)        ON DELETE SET NULL,
  dossier_id  uuid        REFERENCES client_dossiers(id) ON DELETE SET NULL,
  type        text        NOT NULL,   -- 'appointment_created' | 'package_request' | 'invoice_created' | 'status_change' | 'message_sent'
  title       text        NOT NULL,
  metadata    jsonb       NOT NULL DEFAULT '{}',
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ── 4. INVOICES ────────────────────────────────────────────────────────────

CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1;

CREATE TABLE IF NOT EXISTS invoices (
  id                 uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number     text        NOT NULL UNIQUE,
  dossier_id         uuid        REFERENCES client_dossiers(id) ON DELETE SET NULL,
  profile_id         uuid        NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  status             text        NOT NULL DEFAULT 'draft'
                                 CHECK (status IN ('draft','sent','paid','overdue','cancelled')),
  issue_date         date        NOT NULL DEFAULT CURRENT_DATE,
  due_date           date        NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '30 days'),
  subtotal           numeric(10,2) NOT NULL DEFAULT 0,
  vat_rate           numeric(5,2)  NOT NULL DEFAULT 21,
  vat_amount         numeric(10,2) NOT NULL DEFAULT 0,
  total              numeric(10,2) NOT NULL DEFAULT 0,
  notes              text,
  is_recurring       boolean     NOT NULL DEFAULT false,
  recurring_interval text        CHECK (recurring_interval IN ('monthly','quarterly','yearly')),
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

-- ── 5. INVOICE ITEMS ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS invoice_items (
  id           uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id   uuid          NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description  text          NOT NULL,
  quantity     numeric(10,2) NOT NULL DEFAULT 1,
  unit_price   numeric(10,2) NOT NULL DEFAULT 0,
  total        numeric(10,2) NOT NULL DEFAULT 0,
  package_id   uuid          REFERENCES packages(id) ON DELETE SET NULL,
  created_at   timestamptz   NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- TRIGGERS
-- ═══════════════════════════════════════════════════════════════════════════

-- updated_at triggers
CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS touch_client_dossiers ON client_dossiers;
CREATE TRIGGER touch_client_dossiers
  BEFORE UPDATE ON client_dossiers
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

DROP TRIGGER IF EXISTS touch_invoices ON invoices;
CREATE TRIGGER touch_invoices
  BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- Auto-create dossier when a new profile is inserted
CREATE OR REPLACE FUNCTION auto_create_dossier()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO client_dossiers (profile_id, status)
  VALUES (NEW.id, 'lead')
  ON CONFLICT (profile_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_create_dossier ON profiles;
CREATE TRIGGER trg_auto_create_dossier
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION auto_create_dossier();

-- Backfill dossiers for all existing profiles that don't have one
INSERT INTO client_dossiers (profile_id, status)
SELECT id, 'klant'
FROM profiles
WHERE id NOT IN (SELECT profile_id FROM client_dossiers)
ON CONFLICT (profile_id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE client_dossiers  ENABLE ROW LEVEL SECURITY;
ALTER TABLE dossier_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs    ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices         ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items    ENABLE ROW LEVEL SECURITY;

-- ── client_dossiers ────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Admin full access on client_dossiers"   ON client_dossiers;
DROP POLICY IF EXISTS "Users view own dossier"                 ON client_dossiers;

CREATE POLICY "Admin full access on client_dossiers"
  ON client_dossiers FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users view own dossier"
  ON client_dossiers FOR SELECT
  USING (profile_id = auth.uid());

-- ── dossier_packages ───────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Admin full access on dossier_packages"  ON dossier_packages;
DROP POLICY IF EXISTS "Users view own dossier_packages"        ON dossier_packages;

CREATE POLICY "Admin full access on dossier_packages"
  ON dossier_packages FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users view own dossier_packages"
  ON dossier_packages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM client_dossiers
      WHERE id = dossier_packages.dossier_id AND profile_id = auth.uid()
    )
  );

-- ── activity_logs ──────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Admin full access on activity_logs"     ON activity_logs;
DROP POLICY IF EXISTS "Users view own activity"                ON activity_logs;

CREATE POLICY "Admin full access on activity_logs"
  ON activity_logs FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users view own activity"
  ON activity_logs FOR SELECT
  USING (profile_id = auth.uid());

-- ── invoices ───────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Admin full access on invoices"          ON invoices;
DROP POLICY IF EXISTS "Users view own invoices"                ON invoices;

CREATE POLICY "Admin full access on invoices"
  ON invoices FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users view own invoices"
  ON invoices FOR SELECT
  USING (profile_id = auth.uid());

-- ── invoice_items ──────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Admin full access on invoice_items"     ON invoice_items;
DROP POLICY IF EXISTS "Users view own invoice_items"           ON invoice_items;

CREATE POLICY "Admin full access on invoice_items"
  ON invoice_items FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users view own invoice_items"
  ON invoice_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE id = invoice_items.invoice_id AND profile_id = auth.uid()
    )
  );
