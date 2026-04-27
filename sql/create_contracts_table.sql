-- ─────────────────────────────────────────────────────────────────────────────
-- Contracts table — IntrICT overname overeenkomsten
-- Run this in the Supabase SQL editor before using the contracts module.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS contracts (
  id                     UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_number        TEXT        NOT NULL UNIQUE,

  -- Client linkage (mirrors invoices pattern)
  dossier_id             UUID        REFERENCES client_dossiers(id) ON DELETE SET NULL,
  profile_id             UUID        REFERENCES profiles(id)        ON DELETE SET NULL,

  -- Guest client fields (populated when profile_id is null)
  guest_name             TEXT,
  guest_email            TEXT,
  guest_company          TEXT,
  guest_vat_number       TEXT,
  guest_address          TEXT,
  guest_postal_code      TEXT,
  guest_city             TEXT,

  -- Service details
  service_type           TEXT        NOT NULL CHECK (service_type IN ('website', 'hosting', 'domain', 'other')),
  service_description    TEXT        NOT NULL,

  -- Pricing (excl. BTW)
  monthly_price_excl_vat NUMERIC(10,2) NOT NULL CHECK (monthly_price_excl_vat >= 0),
  vat_rate               INTEGER     NOT NULL DEFAULT 21 CHECK (vat_rate IN (0, 6, 12, 21)),

  -- Dates
  start_date             DATE        NOT NULL,
  first_invoice_date     DATE        NOT NULL, -- first day of the month following start_date

  -- Contract duration & cancellation
  status                 TEXT        NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled')),
  notice_period_months   INTEGER     NOT NULL DEFAULT 3,
  cancellation_date      DATE,
  cancellation_reason    TEXT,

  -- Linked recurring invoice template (the "parent" invoice the cron clones)
  recurring_invoice_id   UUID        REFERENCES invoices(id) ON DELETE SET NULL,

  -- Full contract document text (generated on creation)
  contract_text          TEXT,
  notes                  TEXT,

  created_at             TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at             TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS contracts_dossier_id_idx  ON contracts (dossier_id);
CREATE INDEX IF NOT EXISTS contracts_profile_id_idx  ON contracts (profile_id);
CREATE INDEX IF NOT EXISTS contracts_status_idx      ON contracts (status);

-- ── updated_at trigger ────────────────────────────────────────────────────────
-- Reuse if the function already exists from another migration.
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_contracts_updated_at ON contracts;
CREATE TRIGGER update_contracts_updated_at
  BEFORE UPDATE ON contracts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Row Level Security ────────────────────────────────────────────────────────
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

-- Only admins can read/write contracts
CREATE POLICY "Admins can manage contracts"
  ON contracts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );
