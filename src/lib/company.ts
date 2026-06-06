// ─── IntrICT company details used on invoices ────────────────────────────────
// Update these when you have the final details.
// These appear on every generated PDF invoice.

export const COMPANY = {
  name:       'IntrICT',
  legal_form: 'Eenmanszaak',                      // BV / NV / eenmanszaak …
  address:    'Langemunt 29',                         // straat + nr
  postal:     '9850',
  city:       'Nevele',
  country:    'België',
  vat:        'BE 0800.856.942',                 // BTW-nummer
  kbo:        '0800.856.942',                    // KBO/BCE ondernemingsnummer
  iban:       'BE36650770408581',
  bic:        'GEBABEBB',
  email:      'info@intrict.com',
  phone:      '+32 470 63 14 75',
  website:    'https://intrict.com',
  terms_url:  'https://intrict.com/algemene-voorwaarden',   // update when live
  payment_days: 30,                              // standaard betaaltermijn
};
