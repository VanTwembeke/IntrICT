// ─── IntrICT company details used on invoices ────────────────────────────────
// Update these when you have the final details.
// These appear on every generated PDF invoice.

export const COMPANY = {
  name:       'IntrICT',
  legal_form: 'BV',                              // BV / NV / eenmanszaak …
  address:    'Adres 1',                         // straat + nr
  postal:     '0000',
  city:       'Stad',
  country:    'België',
  vat:        'BE 0000.000.000',                 // BTW-nummer
  kbo:        '0000.000.000',                    // KBO/BCE ondernemingsnummer
  iban:       'BE00 0000 0000 0000',
  bic:        'GEBABEBB',
  email:      'info@intrict.be',
  phone:      '+32 000 00 00 00',
  website:    'https://intrict.be',
  terms_url:  'https://intrict.be/algemene-voorwaarden',   // update when live
  payment_days: 30,                              // standaard betaaltermijn
};
