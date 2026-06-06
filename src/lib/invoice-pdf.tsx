// Server-side only — do not import in client components.
// Generates a Belgian-compliant invoice PDF using @react-pdf/renderer.

import React from 'react';
import path from 'path';
import {
  Document, Page, Text, View, StyleSheet, Link, Image, Font,
} from '@react-pdf/renderer';
import { COMPANY } from './company';
import type { Invoice } from './types';

// ─── Fonts ───────────────────────────────────────────────────────────────────
const FONTS_DIR = path.join(process.cwd(), 'public', 'fonts');

Font.register({
  family: 'Inter',
  fonts: [
    { src: path.join(FONTS_DIR, 'Inter-Regular.ttf'),  fontWeight: 400 },
    { src: path.join(FONTS_DIR, 'Inter-SemiBold.ttf'), fontWeight: 600 },
    { src: path.join(FONTS_DIR, 'Inter-Bold.ttf'),     fontWeight: 700 },
  ],
});

// ─── Palette ─────────────────────────────────────────────────────────────────
const BLUE    = '#1d4ed8';
const BLUE_LT = '#eff6ff';
const BLUE_BD = '#bfdbfe';
const DARK    = '#0f172a';
const MID     = '#64748b';
const LIGHT   = '#94a3b8';
const BORDER  = '#e2e8f0';
const BG      = '#f8fafc';
const GREEN   = '#15803d';
const RED     = '#dc2626';

// ─── Translations ─────────────────────────────────────────────────────────────
const T = {
  nl: {
    tagline:         'IT-diensten & weboplossingen',
    invoiceTitle:    'FACTUUR',
    creditNoteTitle: 'CREDITNOTA',
    creditNoteRef:   'Verwijst naar factuur:',
    clientLabel:     'KLANT',
    invoiceDetails:  'FACTUURGEGEVENS',
    issueDateLabel:  'Factuurdatum',
    dueDateLabel:    'Vervaldatum',
    referenceLabel:  'Mededeling',
    typeLabel:       'Type',
    recurringLabel:  'Terugkerend',
    monthly:         '(maandelijks)',
    quarterly:       '(kwartaal)',
    yearly:          '(jaarlijks)',
    colDesc:         'OMSCHRIJVING',
    colQty:          'AANTAL',
    colPrice:        'PRIJS (EXCL.)',
    colTotal:        'TOTAAL (EXCL.)',
    subtotalLabel:   'Subtotaal excl. BTW',
    vatLabel:        'BTW',
    totalDue:        'TOTAAL VERSCHULDIGD',
    paymentTitle:    'BETALINGSINSTRUCTIES',
    beneficiary:     'Begunstigde',
    iban:            'IBAN',
    bic:             'BIC',
    communication:   'Mededeling',
    paymentNote: (days: number, dueDate: string | null) =>
      `Gelieve te betalen binnen ${days} dagen${dueDate ? ` (voor ${dueDate})` : ' na factuurdatum'}. Bij laattijdige betaling is van rechtswege en zonder ingebrekestelling een intrest van 10% per jaar verschuldigd.`,
    notesLabel:      'OPMERKINGEN',
    termsLabel:      'Voorwaarden:',
    vatPrefix:       'BTW:',
    kboPrefix:       'KBO:',
    buildRef: (n: string) => `Factuur ${n}`,
    docSubject:      'Factuur',
    statuses: {
      draft: 'CONCEPT', sent: 'VERZONDEN', paid: 'BETAALD',
      overdue: 'VERVALLEN', cancelled: 'GEANNULEERD',
    },
    dateLocale: 'nl-BE',
  },
  en: {
    tagline:         'IT services & web solutions',
    invoiceTitle:    'INVOICE',
    creditNoteTitle: 'CREDIT NOTE',
    creditNoteRef:   'Refers to invoice:',
    clientLabel:     'CLIENT',
    invoiceDetails:  'INVOICE DETAILS',
    issueDateLabel:  'Issue date',
    dueDateLabel:    'Due date',
    referenceLabel:  'Reference',
    typeLabel:       'Type',
    recurringLabel:  'Recurring',
    monthly:         '(monthly)',
    quarterly:       '(quarterly)',
    yearly:          '(yearly)',
    colDesc:         'DESCRIPTION',
    colQty:          'QTY',
    colPrice:        'UNIT PRICE',
    colTotal:        'TOTAL (EXCL.)',
    subtotalLabel:   'Subtotal excl. VAT',
    vatLabel:        'VAT',
    totalDue:        'TOTAL DUE',
    paymentTitle:    'PAYMENT INSTRUCTIONS',
    beneficiary:     'Beneficiary',
    iban:            'IBAN',
    bic:             'BIC',
    communication:   'Reference',
    paymentNote: (days: number, dueDate: string | null) =>
      `Please pay within ${days} days${dueDate ? ` (before ${dueDate})` : ' after invoice date'}. In case of late payment, interest of 10% per year is due by operation of law without prior notice.`,
    notesLabel:      'NOTES',
    termsLabel:      'Terms & conditions:',
    vatPrefix:       'VAT:',
    kboPrefix:       'Company nr:',
    buildRef: (n: string) => `Invoice ${n}`,
    docSubject:      'Invoice',
    statuses: {
      draft: 'DRAFT', sent: 'SENT', paid: 'PAID',
      overdue: 'OVERDUE', cancelled: 'CANCELLED',
    },
    dateLocale: 'en-GB',
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtEur(n: number, locale: string) {
  return `€ ${n.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtDate(iso: string, locale: string) {
  return new Date(iso).toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function fmtIban(raw: string) {
  return raw.replace(/(.{4})/g, '$1 ').trim();
}

function statusStyle(status: string): { bg: string; fg: string } {
  switch (status) {
    case 'paid':      return { bg: '#dcfce7', fg: GREEN };
    case 'overdue':   return { bg: '#fee2e2', fg: RED };
    case 'sent':      return { bg: '#dbeafe', fg: BLUE };
    case 'cancelled': return { bg: '#f1f5f9', fg: LIGHT };
    default:          return { bg: '#f1f5f9', fg: MID };
  }
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  page: {
    fontFamily:        'Inter',
    fontWeight:        400,
    fontSize:          9,
    color:             DARK,
    paddingTop:        0,
    paddingBottom:     56,
    paddingHorizontal: 0,
    lineHeight:        1.5,
    backgroundColor:   '#ffffff',
  },

  // ── Accent bar ──
  accentBar: {
    height:          4,
    backgroundColor: BLUE,
    width:           '100%',
  },

  // ── Inner page padding wrapper ──
  inner: {
    paddingHorizontal: 44,
    paddingTop:        32,
  },

  // ── Header ──
  header: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'flex-start',
    marginBottom:   28,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems:    'flex-start',
    gap:           10,
  },
  logoImage: {
    width:  28,
    height: 28,
    marginTop: 2,
  },
  companyName: {
    fontSize:      22,
    fontWeight:    700,
    color:         BLUE,
    letterSpacing: 0.5,
    lineHeight:    1.1,
  },
  companyTagline: {
    fontSize:  8,
    color:     MID,
    marginTop: 3,
    fontWeight: 400,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  invoiceTitle: {
    fontSize:      26,
    fontWeight:    700,
    color:         DARK,
    letterSpacing: 2,
    lineHeight:    1,
  },
  invoiceNumber: {
    fontSize:      11,
    fontWeight:    600,
    color:         BLUE,
    marginTop:     5,
    letterSpacing: 0.3,
  },
  statusBadge: {
    marginTop:         7,
    paddingHorizontal: 10,
    paddingVertical:   4,
    borderRadius:      20,
    alignSelf:         'flex-end',
  },
  statusText: {
    fontSize:   7.5,
    fontWeight: 700,
    letterSpacing: 0.3,
  },

  // ── Divider ──
  divider: {
    borderBottom:  `1.5 solid ${BORDER}`,
    marginBottom:  24,
  },

  // ── Info row ──
  infoRow: {
    flexDirection: 'row',
    gap:           16,
    marginBottom:  24,
  },
  infoCol: {
    flex: 1,
  },
  infoSectionLabel: {
    fontSize:      7,
    fontWeight:    700,
    color:         BLUE,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom:  8,
    paddingBottom: 4,
    borderBottom:  `1 solid ${BLUE_BD}`,
  },
  infoName: {
    fontSize:   10,
    fontWeight: 700,
    color:      DARK,
    marginBottom: 1,
  },
  infoLine: {
    fontSize:   8,
    color:      MID,
    fontWeight: 400,
    marginBottom: 1.5,
  },

  // Dates table inside infoCol
  dateRow: {
    flexDirection: 'row',
    marginBottom:  5,
    alignItems:    'flex-start',
  },
  dateLabel: {
    fontSize:  8,
    color:     LIGHT,
    width:     90,
    fontWeight: 400,
  },
  dateValue: {
    fontSize:   8,
    fontWeight: 600,
    color:      DARK,
    flex:       1,
  },
  dateValueRed: {
    fontSize:   8,
    fontWeight: 600,
    color:      RED,
    flex:       1,
  },
  recurringBadge: {
    backgroundColor: '#f3e8ff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  recurringText: {
    fontSize: 7,
    color: '#7c3aed',
    fontWeight: 600,
  },

  // ── Items table ──
  table: {
    marginBottom: 14,
    borderRadius: 6,
    overflow: 'hidden',
    border: `1 solid ${BORDER}`,
  },
  tableHeader: {
    flexDirection:     'row',
    backgroundColor:   DARK,
    paddingVertical:   8,
    paddingHorizontal: 12,
  },
  tableRow: {
    flexDirection:     'row',
    paddingVertical:   7,
    paddingHorizontal: 12,
    borderBottom:      `1 solid ${BORDER}`,
    backgroundColor:   '#ffffff',
  },
  tableRowAlt: {
    flexDirection:     'row',
    paddingVertical:   7,
    paddingHorizontal: 12,
    borderBottom:      `1 solid ${BORDER}`,
    backgroundColor:   BG,
  },

  cellDesc:  { flex: 5, fontWeight: 400 },
  cellDescText:  { fontSize: 8.5, color: DARK },
  cellDescNotes: { fontSize: 7.5, color: MID, marginTop: 1.5 },
  cellQty:   { flex: 1, fontSize: 8.5, color: MID,  textAlign: 'center', fontWeight: 400 },
  cellPrice: { flex: 2, fontSize: 8.5, color: MID,  textAlign: 'right',  fontWeight: 400 },
  cellTotal: { flex: 2, fontSize: 8.5, color: DARK, textAlign: 'right',  fontWeight: 600 },

  cellDescH:  { flex: 5, fontSize: 7,   color: '#ffffff', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 },
  cellQtyH:   { flex: 1, fontSize: 7,   color: '#94a3b8', textAlign: 'center', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 },
  cellPriceH: { flex: 2, fontSize: 7,   color: '#94a3b8', textAlign: 'right',  fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 },
  cellTotalH: { flex: 2, fontSize: 7,   color: '#94a3b8', textAlign: 'right',  fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 },

  // ── Totals ──
  totalsWrapper: {
    flexDirection:  'row',
    justifyContent: 'flex-end',
    marginBottom:   16,
  },
  totalsBlock: {
    width: 240,
  },
  totalLine: {
    flexDirection:   'row',
    justifyContent:  'space-between',
    alignItems:      'center',
    paddingVertical: 4,
    borderBottom:    `1 solid ${BORDER}`,
  },
  totalLabel: {
    fontSize: 8,
    color:    MID,
    fontWeight: 400,
  },
  totalValue: {
    fontSize:   8,
    fontWeight: 600,
    color:      DARK,
  },
  totalGrand: {
    flexDirection:     'row',
    justifyContent:    'space-between',
    alignItems:        'center',
    paddingVertical:   8,
    paddingHorizontal: 12,
    backgroundColor:   DARK,
    borderRadius:      6,
    marginTop:         6,
  },
  totalGrandLabel: {
    fontSize:      8.5,
    fontWeight:    700,
    color:         '#ffffff',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  totalGrandValue: {
    fontSize:   12,
    fontWeight: 700,
    color:      '#ffffff',
  },

  // ── Payment box ──
  paymentBox: {
    marginTop:        0,
    padding:          14,
    backgroundColor:  BLUE_LT,
    border:           `1 solid ${BLUE_BD}`,
    borderRadius:     6,
    marginBottom:     14,
  },
  paymentTitle: {
    fontSize:      7,
    fontWeight:    700,
    color:         BLUE,
    marginBottom:  10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  paymentGrid: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    marginBottom:  8,
  },
  paymentItem: {
    width:         '50%',
    flexDirection: 'row',
    marginBottom:  5,
  },
  paymentLabel: {
    fontSize:  7.5,
    color:     MID,
    width:     72,
    fontWeight: 400,
  },
  paymentValue: {
    fontSize:   7.5,
    fontWeight: 600,
    color:      DARK,
    flex:       1,
  },
  paymentNote: {
    fontSize:   7,
    color:      MID,
    lineHeight: 1.5,
    fontWeight: 400,
    marginTop:  4,
    paddingTop: 8,
    borderTop:  `1 solid ${BLUE_BD}`,
  },

  // ── Notes ──
  notesBox: {
    padding:          10,
    backgroundColor:  BG,
    border:           `1 solid ${BORDER}`,
    borderRadius:     6,
    marginBottom:     14,
  },
  notesLabel: {
    fontSize:      7,
    fontWeight:    700,
    color:         LIGHT,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom:  4,
  },
  notesText: {
    fontSize:  8,
    color:     MID,
    fontWeight: 400,
  },

  // ── Footer ──
  footer: {
    position:          'absolute',
    bottom:            0,
    left:              0,
    right:             0,
    paddingHorizontal: 44,
    paddingVertical:   12,
    borderTop:         `1 solid ${BORDER}`,
    flexDirection:     'row',
    justifyContent:    'space-between',
    alignItems:        'center',
    backgroundColor:   '#ffffff',
  },
  footerLeft: {
    fontSize:  7,
    color:     LIGHT,
    fontWeight: 400,
  },
  footerRight: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           3,
  },
  footerRightText: {
    fontSize:  7,
    color:     LIGHT,
    fontWeight: 400,
  },
  footerLink: {
    fontSize:  7,
    color:     BLUE,
    fontWeight: 400,
  },
});

// ─── Logo path ────────────────────────────────────────────────────────────────
const LOGO_PATH = path.join(process.cwd(), 'public', 'brand', 'icon_light_v2.png');

// ─── PDF Document ─────────────────────────────────────────────────────────────

export function InvoicePDF({ invoice }: { invoice: Invoice }) {
  const lang        = invoice.language ?? 'nl';
  const t           = T[lang];
  const locale      = t.dateLocale;
  const isCreditNote = invoice.type === 'credit_note';

  const items    = invoice.items ?? [];
  const subtotal = invoice.subtotal ?? 0;
  const vatAmt   = invoice.vat_amount ?? 0;
  const total    = invoice.total ?? 0;
  const vatRate  = invoice.vat_rate ?? 21;

  const issueDate = invoice.issue_date ?? invoice.created_at;
  const dueDate   = invoice.due_date;

  const sc       = statusStyle(invoice.status);
  const isOverdue = invoice.status === 'overdue';

  const clientName    = invoice.profile?.full_name    ?? invoice.guest_name     ?? invoice.profile?.email ?? invoice.guest_email ?? '—';
  const clientCompany = invoice.profile?.company      ?? invoice.guest_company  ?? null;
  const clientVat     = invoice.profile?.vat_number   ?? invoice.guest_vat_number ?? null;
  const clientEmail   = invoice.profile?.email        ?? invoice.guest_email    ?? null;
  const hasAddr       = !!(invoice.profile?.address ?? invoice.guest_address);
  const clientAddr    = hasAddr
    ? `${invoice.profile?.address ?? invoice.guest_address}, ${invoice.profile?.postal_code ?? invoice.guest_postal_code ?? ''} ${invoice.profile?.city ?? invoice.guest_city ?? ''}`.trim()
    : null;

  const ref           = t.buildRef(invoice.invoice_number);
  const statusLabel   = t.statuses[invoice.status as keyof typeof t.statuses] ?? invoice.status.toUpperCase();

  return (
    <Document
      title={t.buildRef(invoice.invoice_number)}
      author={COMPANY.name}
      subject={t.docSubject}
      creator={COMPANY.name}
    >
      <Page size="A4" style={s.page}>

        {/* ── Blue accent bar ── */}
        <View style={s.accentBar} />

        <View style={s.inner}>

          {/* ── Header: logo/name LEFT — title/number/status RIGHT ── */}
          <View style={s.header} wrap={false}>
            <View style={s.logoRow}>
              {/* eslint-disable-next-line jsx-a11y/alt-text */}
              <Image src={LOGO_PATH} style={s.logoImage} />
              <View>
                <Text style={s.companyName}>{COMPANY.name}</Text>
                <Text style={s.companyTagline}>{t.tagline}</Text>
              </View>
            </View>

            <View style={s.headerRight}>
              <Text style={s.invoiceTitle}>{isCreditNote ? t.creditNoteTitle : t.invoiceTitle}</Text>
              <Text style={s.invoiceNumber}>{invoice.invoice_number}</Text>
              {isCreditNote && invoice.linked_invoice_id && (
                <Text style={{ fontSize: 7, color: '#92400e', marginTop: 3, fontWeight: 400 }}>
                  {t.creditNoteRef} {(invoice as Invoice & { linked_invoice_number?: string }).linked_invoice_number ?? ''}
                </Text>
              )}
              <View style={[s.statusBadge, { backgroundColor: sc.bg }]}>
                <Text style={[s.statusText, { color: sc.fg }]}>{statusLabel}</Text>
              </View>
            </View>
          </View>

          {/* ── Divider ── */}
          <View style={s.divider} />

          {/* ── Info row: dates LEFT — client RIGHT ── */}
          <View style={s.infoRow} wrap={false}>
            {/* Dates */}
            <View style={s.infoCol}>
              <Text style={s.infoSectionLabel}>{t.invoiceDetails}</Text>
              <View style={s.dateRow}>
                <Text style={s.dateLabel}>{t.issueDateLabel}</Text>
                <Text style={s.dateValue}>{fmtDate(issueDate, locale)}</Text>
              </View>
              <View style={s.dateRow}>
                <Text style={s.dateLabel}>{t.dueDateLabel}</Text>
                <Text style={isOverdue ? s.dateValueRed : s.dateValue}>
                  {dueDate
                    ? fmtDate(dueDate, locale)
                    : `${COMPANY.payment_days} ${lang === 'en' ? 'days after invoice date' : 'dagen na factuurdatum'}`}
                </Text>
              </View>
              <View style={s.dateRow}>
                <Text style={s.dateLabel}>{t.referenceLabel}</Text>
                <Text style={s.dateValue}>{ref}</Text>
              </View>
              {invoice.is_recurring && (
                <View style={s.recurringBadge}>
                  <Text style={s.recurringText}>
                    {t.recurringLabel}{' '}
                    {invoice.recurring_interval === 'monthly'   ? t.monthly
                      : invoice.recurring_interval === 'quarterly' ? t.quarterly
                      : t.yearly}
                  </Text>
                </View>
              )}
            </View>

            {/* Client */}
            <View style={s.infoCol}>
              <Text style={s.infoSectionLabel}>{t.clientLabel}</Text>
              {clientCompany && <Text style={s.infoName}>{clientCompany}</Text>}
              <Text style={clientCompany ? s.infoLine : s.infoName}>{clientName}</Text>
              {clientAddr   && <Text style={s.infoLine}>{clientAddr}</Text>}
              {clientVat    && <Text style={s.infoLine}>{t.vatPrefix} {clientVat}</Text>}
              {clientEmail  && <Text style={s.infoLine}>{clientEmail}</Text>}
            </View>
          </View>

          {/* ── Items table ── */}
          <View style={s.table}>
            <View style={s.tableHeader} wrap={false}>
              <Text style={s.cellDescH}>{t.colDesc}</Text>
              <Text style={s.cellQtyH}>{t.colQty}</Text>
              <Text style={s.cellPriceH}>{t.colPrice}</Text>
              <Text style={s.cellTotalH}>{t.colTotal}</Text>
            </View>

            {items.map((item, i) => (
              <View key={item.id} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt} wrap={false}>
                <View style={s.cellDesc}>
                  <Text style={s.cellDescText}>{item.description}</Text>
                  {item.notes && <Text style={s.cellDescNotes}>{item.notes}</Text>}
                </View>
                <Text style={s.cellQty}>{item.quantity}</Text>
                <Text style={s.cellPrice}>{fmtEur(item.unit_price, locale)}</Text>
                <Text style={s.cellTotal}>{fmtEur(item.total ?? item.quantity * item.unit_price, locale)}</Text>
              </View>
            ))}
          </View>

          {/* ── Totals ── */}
          <View style={s.totalsWrapper} wrap={false}>
            <View style={s.totalsBlock}>
              <View style={s.totalLine}>
                <Text style={s.totalLabel}>{t.subtotalLabel}</Text>
                <Text style={s.totalValue}>{fmtEur(subtotal, locale)}</Text>
              </View>
              <View style={s.totalLine}>
                <Text style={s.totalLabel}>{t.vatLabel} {vatRate}%</Text>
                <Text style={s.totalValue}>{fmtEur(vatAmt, locale)}</Text>
              </View>
              <View style={s.totalGrand}>
                <Text style={s.totalGrandLabel}>{t.totalDue}</Text>
                <Text style={s.totalGrandValue}>{fmtEur(total, locale)}</Text>
              </View>
            </View>
          </View>

          {/* ── Payment instructions ── */}
          <View style={s.paymentBox} wrap={false}>
            <Text style={s.paymentTitle}>{t.paymentTitle}</Text>
            <View style={s.paymentGrid}>
              <View style={s.paymentItem}>
                <Text style={s.paymentLabel}>{t.beneficiary}</Text>
                <Text style={s.paymentValue}>{COMPANY.name} {COMPANY.legal_form}</Text>
              </View>
              <View style={s.paymentItem}>
                <Text style={s.paymentLabel}>{t.iban}</Text>
                <Text style={s.paymentValue}>{fmtIban(COMPANY.iban)}</Text>
              </View>
              <View style={s.paymentItem}>
                <Text style={s.paymentLabel}>{t.bic}</Text>
                <Text style={s.paymentValue}>{COMPANY.bic}</Text>
              </View>
              <View style={s.paymentItem}>
                <Text style={s.paymentLabel}>{t.communication}</Text>
                <Text style={s.paymentValue}>{ref}</Text>
              </View>
            </View>
            <Text style={s.paymentNote}>
              {t.paymentNote(
                COMPANY.payment_days,
                dueDate ? fmtDate(dueDate, locale) : null,
              )}
            </Text>
          </View>

          {/* ── Notes ── */}
          {invoice.notes && (
            <View style={s.notesBox} wrap={false}>
              <Text style={s.notesLabel}>{t.notesLabel}</Text>
              <Text style={s.notesText}>{invoice.notes}</Text>
            </View>
          )}

        </View>

        {/* ── Footer (every page) — company details only here ── */}
        <View style={s.footer} fixed>
          <Text style={s.footerLeft}>
            {`${COMPANY.name} · ${COMPANY.legal_form} · ${t.vatPrefix} ${COMPANY.vat} · ${t.kboPrefix} ${COMPANY.kbo} · ${COMPANY.email}`}
          </Text>
          <View style={s.footerRight}>
            <Text style={s.footerRightText}>{t.termsLabel} </Text>
            <Link src={COMPANY.terms_url} style={s.footerLink}>{COMPANY.website}/algemene-voorwaarden</Link>
          </View>
        </View>

      </Page>
    </Document>
  );
}
