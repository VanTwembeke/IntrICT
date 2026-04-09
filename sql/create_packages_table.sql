-- IntrICT: Packages table
-- Run this in Supabase SQL editor (Dashboard → SQL editor → New query)

CREATE TABLE IF NOT EXISTS packages (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  name          text        NOT NULL,
  price         integer     NOT NULL DEFAULT 0,       -- price in euros (no cents)
  description   text        NOT NULL DEFAULT '',
  features      text[]      NOT NULL DEFAULT '{}',
  color         text        NOT NULL DEFAULT 'blue',  -- blue | purple | indigo | green | orange
  highlight     boolean     NOT NULL DEFAULT false,
  active        boolean     NOT NULL DEFAULT true,
  sort_order    integer     NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Row-level security
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read active packages
CREATE POLICY "Active packages readable by authenticated users"
  ON packages FOR SELECT TO authenticated
  USING (active = true);

-- Admins can read all packages (including inactive)
CREATE POLICY "Admins can read all packages"
  ON packages FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Admins can insert, update, delete
CREATE POLICY "Admins can insert packages"
  ON packages FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE POLICY "Admins can update packages"
  ON packages FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE POLICY "Admins can delete packages"
  ON packages FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS packages_updated_at ON packages;
CREATE TRIGGER packages_updated_at
  BEFORE UPDATE ON packages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed default packages
INSERT INTO packages (name, price, description, features, color, highlight, sort_order) VALUES
  (
    'Starter', 499,
    'Ideaal voor starters en kleine bedrijven die online willen gaan.',
    ARRAY[
      '5-pagina statische website',
      'Responsief design (mobiel + desktop)',
      'Contactformulier',
      'Google Maps integratie',
      'SSL-certificaat',
      '1 maand ondersteuning'
    ],
    'blue', false, 0
  ),
  (
    'Business', 999,
    'Voor groeiende bedrijven die een krachtige online aanwezigheid nodig hebben.',
    ARRAY[
      'Tot 10 pagina''s',
      'CMS (inhoud zelf beheren)',
      'Blog & nieuwssectie',
      'SEO-optimalisatie',
      'Google Analytics koppeling',
      'SSL-certificaat',
      '3 maanden ondersteuning'
    ],
    'purple', true, 1
  ),
  (
    'Pro', 1999,
    'Volledige maatwerk webapplicatie of geavanceerde bedrijfswebsite.',
    ARRAY[
      'Onbeperkt pagina''s',
      'Volledig maatwerk design',
      'Geavanceerde functionaliteit',
      'API-koppelingen',
      'Dashboard & gebruikersbeheer',
      'Performance-optimalisatie',
      'SSL-certificaat',
      '6 maanden ondersteuning'
    ],
    'indigo', false, 2
  ),
  (
    'E-commerce', 2999,
    'Complete webshop met alle functionaliteiten om online te verkopen.',
    ARRAY[
      'Volledig ingerichte webshop',
      'Productbeheer & categorieën',
      'Betaalgateways (Mollie, Stripe)',
      'Voorraadbeheer',
      'Orderverwerking & e-mails',
      'Klantaccounts',
      'SSL-certificaat',
      '6 maanden ondersteuning'
    ],
    'green', false, 3
  )
ON CONFLICT DO NOTHING;
