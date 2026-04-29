// Server-side only — do not import in client components.
// Generates a Belgian-compliant invoice PDF using @react-pdf/renderer.

import React from 'react';
import {
  Document, Page, Text, View, StyleSheet, Link, Svg, Circle, Rect, Line, Path,
} from '@react-pdf/renderer';
import { COMPANY } from './company';
import type { Invoice } from './types';

// ─── Palette ─────────────────────────────────────────────────────────────────
const BLUE   = '#1d4ed8';
const DARK   = '#0f172a';
const MID    = '#475569';
const LIGHT  = '#94a3b8';
const BORDER = '#e2e8f0';
const BG     = '#f8fafc';
const GREEN  = '#15803d';
const RED    = '#dc2626';

// ─── Translations ─────────────────────────────────────────────────────────────
const T = {
  nl: {
    tagline:          'IT-diensten & weboplossingen',
    invoiceTitle:     'FACTUUR',
    clientLabel:      'Klant',
    invoiceDetails:   'Factuurgegevens',
    issueDateLabel:   'Factuurdatum',
    dueDateLabel:     'Vervaldatum',
    referenceLabel:   'Referentie',
    typeLabel:        'Type',
    recurringLabel:   'Terugkerend',
    monthly:          '(maandelijks)',
    quarterly:        '(kwartaal)',
    yearly:           '(jaarlijks)',
    colDesc:          'Omschrijving',
    colQty:           'Aantal',
    colPrice:         'Eenheidsprijs',
    colTotal:         'Totaal (excl. BTW)',
    subtotalLabel:    'Subtotaal (excl. BTW)',
    vatLabel:         'BTW',
    totalDue:         'TOTAAL VERSCHULDIGD',
    paymentTitle:     'Betalingsinstructies',
    beneficiary:      'Begunstigde:',
    iban:             'IBAN:',
    bic:              'BIC:',
    communication:    'Mededeling:',
    paymentNote: (days: number, dueDate: string | null) =>
      `Gelieve te betalen binnen ${days} dagen${dueDate ? ` (voor ${dueDate})` : ' na factuurdatum'}. Bij laattijdige betaling is van rechtswege en zonder ingebrekestelling een intrest van 10% per jaar verschuldigd.`,
    notesLabel:       'Opmerkingen',
    termsLabel:       'Algemene voorwaarden:',
    vatPrefix:        'BTW:',
    kboPrefix:        'KBO:',
    buildRef: (n: string) => `Factuur ${n}`,
    docSubject:       'Factuur',
    statuses: {
      draft: 'CONCEPT', sent: 'VERZONDEN', paid: 'BETAALD',
      overdue: 'VERVALLEN', cancelled: 'GEANNULEERD',
    },
    dateLocale: 'nl-BE',
  },
  en: {
    tagline:          'IT services & web solutions',
    invoiceTitle:     'INVOICE',
    clientLabel:      'Client',
    invoiceDetails:   'Invoice details',
    issueDateLabel:   'Issue date',
    dueDateLabel:     'Due date',
    referenceLabel:   'Reference',
    typeLabel:        'Type',
    recurringLabel:   'Recurring',
    monthly:          '(monthly)',
    quarterly:        '(quarterly)',
    yearly:           '(yearly)',
    colDesc:          'Description',
    colQty:           'Qty',
    colPrice:         'Unit price',
    colTotal:         'Total (excl. VAT)',
    subtotalLabel:    'Subtotal (excl. VAT)',
    vatLabel:         'VAT',
    totalDue:         'TOTAL DUE',
    paymentTitle:     'Payment instructions',
    beneficiary:      'Beneficiary:',
    iban:             'IBAN:',
    bic:              'BIC:',
    communication:    'Reference:',
    paymentNote: (days: number, dueDate: string | null) =>
      `Please pay within ${days} days${dueDate ? ` (before ${dueDate})` : ' after invoice date'}. In case of late payment, interest of 10% per year is due by operation of law without prior notice.`,
    notesLabel:       'Notes',
    termsLabel:       'Terms & conditions:',
    vatPrefix:        'VAT:',
    kboPrefix:        'Company nr:',
    buildRef: (n: string) => `Invoice ${n}`,
    docSubject:       'Invoice',
    statuses: {
      draft: 'DRAFT', sent: 'SENT', paid: 'PAID',
      overdue: 'OVERDUE', cancelled: 'CANCELLED',
    },
    dateLocale: 'en-GB',
  },
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  page: {
    fontFamily:        'Helvetica',
    fontSize:          9,
    color:             DARK,
    paddingTop:        36,
    paddingBottom:     52,
    paddingHorizontal: 44,
    lineHeight:        1.4,
  },

  // Header + title wrapper (kept together)
  topBlock: {
    marginBottom: 14,
  },

  // Header band
  headerBand: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'flex-start',
    marginBottom:   14,
    paddingBottom:  12,
    borderBottom:   `1.5 solid ${BLUE}`,
  },
  companyName: {
    fontSize:      20,
    fontFamily:    'Helvetica-Bold',
    color:         BLUE,
    letterSpacing: 1,
  },
  companyTagline: {
    fontSize:  7.5,
    color:     MID,
    marginTop: 2,
  },
  companyDetails: {
    fontSize:   7.5,
    color:      MID,
    textAlign:  'right',
    lineHeight: 1.55,
  },

  // Title row
  titleRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   12,
  },
  invoiceTitleText: {
    fontSize:      20,
    fontFamily:    'Helvetica-Bold',
    color:         DARK,
    letterSpacing: 1,
  },
  invoiceNumber: {
    fontSize:      9,
    fontFamily:    'Helvetica-Bold',
    color:         BLUE,
    letterSpacing: 0.3,
    marginTop:     2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical:   4,
    borderRadius:      4,
    fontSize:          8,
    fontFamily:        'Helvetica-Bold',
  },

  // Info row — client left, dates right
  infoRow: {
    flexDirection: 'row',
    gap:           12,
    marginBottom:  14,
  },
  infoBox: {
    flex:             1,
    backgroundColor:  BG,
    padding:          10,
    borderRadius:     4,
    border:           `1 solid ${BORDER}`,
  },
  infoLabel: {
    fontSize:      7,
    fontFamily:    'Helvetica-Bold',
    color:         BLUE,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom:  5,
  },
  infoName: {
    fontSize:     9.5,
    fontFamily:   'Helvetica-Bold',
    color:        DARK,
    marginBottom: 1,
  },
  infoLine: {
    fontSize:   7.5,
    color:      MID,
    lineHeight: 1.55,
  },

  // Dates inside infoBox
  dateRow: {
    flexDirection: 'row',
    marginBottom:  3,
  },
  dateLabel: {
    fontSize: 7.5,
    color:    LIGHT,
    width:    90,
  },
  dateValue: {
    fontSize:   7.5,
    fontFamily: 'Helvetica-Bold',
    color:      DARK,
    flex:       1,
  },
  dateValueRed: {
    fontSize:   7.5,
    fontFamily: 'Helvetica-Bold',
    color:      RED,
    flex:       1,
  },

  // Table
  table: {
    marginBottom: 12,
  },
  tableHeader: {
    flexDirection:     'row',
    backgroundColor:   BLUE,
    paddingVertical:   6,
    paddingHorizontal: 10,
    borderRadius:      4,
    marginBottom:      1,
  },
  tableRow: {
    flexDirection:     'row',
    paddingVertical:   5,
    paddingHorizontal: 10,
    borderBottom:      `1 solid ${BORDER}`,
  },
  tableRowAlt: {
    flexDirection:     'row',
    paddingVertical:   5,
    paddingHorizontal: 10,
    backgroundColor:   BG,
    borderBottom:      `1 solid ${BORDER}`,
  },
  cellDesc:  { flex: 5, fontSize: 8.5, color: DARK },
  cellQty:   { flex: 1, fontSize: 8.5, color: MID, textAlign: 'center' },
  cellPrice: { flex: 2, fontSize: 8.5, color: MID, textAlign: 'right' },
  cellTotal: { flex: 2, fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: DARK, textAlign: 'right' },

  cellDescH:  { flex: 5, fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#ffffff' },
  cellQtyH:   { flex: 1, fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#ffffff', textAlign: 'center' },
  cellPriceH: { flex: 2, fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#ffffff', textAlign: 'right' },
  cellTotalH: { flex: 2, fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#ffffff', textAlign: 'right' },

  // Totals block
  totalsRow: {
    flexDirection:  'row',
    justifyContent: 'flex-end',
    marginBottom:   4,
  },
  totalsBlock: {
    width: 220,
  },
  totalLine: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
    borderBottom:   `1 solid ${BORDER}`,
  },
  totalLineGrand: {
    flexDirection:     'row',
    justifyContent:    'space-between',
    paddingVertical:   6,
    backgroundColor:   BLUE,
    paddingHorizontal: 10,
    borderRadius:      4,
    marginTop:         4,
  },
  totalLabel: {
    fontSize: 8,
    color:    MID,
  },
  totalValue: {
    fontSize:   8,
    fontFamily: 'Helvetica-Bold',
    color:      DARK,
  },
  totalLabelGrand: {
    fontSize:   9,
    fontFamily: 'Helvetica-Bold',
    color:      '#ffffff',
  },
  totalValueGrand: {
    fontSize:   9,
    fontFamily: 'Helvetica-Bold',
    color:      '#ffffff',
  },

  // Payment section
  paymentBox: {
    marginTop:        12,
    padding:          10,
    backgroundColor:  '#eff6ff',
    border:           `1 solid #bfdbfe`,
    borderRadius:     4,
  },
  paymentTitle: {
    fontSize:      7.5,
    fontFamily:    'Helvetica-Bold',
    color:         BLUE,
    marginBottom:  5,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  paymentGrid: {
    flexDirection: 'row',
    flexWrap:      'wrap',
  },
  paymentRow: {
    flexDirection: 'row',
    width:         '50%',
    marginBottom:  2,
  },
  paymentLabel: {
    fontSize: 7.5,
    color:    MID,
    width:    70,
  },
  paymentValue: {
    fontSize:   7.5,
    fontFamily: 'Helvetica-Bold',
    color:      DARK,
    flex:       1,
  },
  paymentRef: {
    fontSize:  7,
    color:     MID,
    marginTop: 5,
  },

  // Notes
  notesBox: {
    marginTop:       10,
    padding:         9,
    backgroundColor: BG,
    border:          `1 solid ${BORDER}`,
    borderRadius:    4,
  },
  notesLabel: {
    fontSize:      7,
    fontFamily:    'Helvetica-Bold',
    color:         LIGHT,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom:  3,
  },
  notesText: {
    fontSize: 8,
    color:    MID,
  },

  // Footer
  footer: {
    position:       'absolute',
    bottom:         24,
    left:           44,
    right:          44,
    borderTop:      `1 solid ${BORDER}`,
    paddingTop:     6,
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
  },
  footerLeft: {
    fontSize: 7,
    color:    LIGHT,
  },
  footerRight: {
    fontSize:  7,
    color:     LIGHT,
    textAlign: 'right',
  },
  footerLink: {
    fontSize: 7,
    color:    BLUE,
  },
});

// ─── PDF logo mark ────────────────────────────────────────────────────────────
// Icon-only variant (no wordmark text) — the company name is rendered as a
// styled Text element beside it, matching the official brand icon mark.

function PdfLogoMark() {
  const fill   = BLUE;
  const accent = '#93c5fd';
  return (
    <Svg viewBox="27 22 190 135" width={22} height={16}>
      <Circle cx={44} cy={52} r={17} fill={fill} />
      <Rect x={35} y={75} width={19} height={80} rx={10} fill={fill} />
      <Circle cx={84} cy={69} r={10} fill={fill} />
      <Circle cx={84} cy={111} r={10} fill={fill} />
      <Line x1={132} y1={28} x2={116} y2={152} stroke={fill} strokeWidth={18} strokeLinecap="round" />
      <Path d="M 162 25 L 214 90 L 162 155" stroke={accent} strokeWidth={18} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtEur(n: number, locale: string) {
  return `\u20ac ${n.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtDate(iso: string, locale: string) {
  return new Date(iso).toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function statusColor(status: string): { bg: string; fg: string } {
  switch (status) {
    case 'paid':      return { bg: '#dcfce7', fg: GREEN };
    case 'overdue':   return { bg: '#fee2e2', fg: RED };
    case 'sent':      return { bg: '#dbeafe', fg: BLUE };
    case 'cancelled': return { bg: '#f1f5f9', fg: LIGHT };
    default:          return { bg: '#f1f5f9', fg: MID };
  }
}

// ─── PDF Document ─────────────────────────────────────────────────────────────

export function InvoicePDF({ invoice }: { invoice: Invoice }) {
  const lang   = invoice.language ?? 'nl';
  const t      = T[lang];
  const locale = t.dateLocale;

  const items    = invoice.items ?? [];
  const subtotal = invoice.subtotal ?? 0;
  const vatAmt   = invoice.vat_amount ?? 0;
  const total    = invoice.total ?? 0;
  const vatRate  = invoice.vat_rate ?? 21;

  const issueDate = invoice.issue_date ?? invoice.created_at;
  const dueDate   = invoice.due_date;

  const sc = statusColor(invoice.status);
  const isOverdue = invoice.status === 'overdue';

  // Client data: prefer profile (linked Supabase account), fall back to guest fields
  const clientName    = invoice.profile?.full_name ?? invoice.guest_name    ?? invoice.profile?.email ?? invoice.guest_email ?? '\u2014';
  const clientCompany = invoice.profile?.company   ?? invoice.guest_company ?? null;
  const clientVat     = invoice.profile?.vat_number ?? invoice.guest_vat_number ?? null;
  const clientEmail   = invoice.profile?.email     ?? invoice.guest_email   ?? null;
  const clientAddr    = (invoice.profile?.address ?? invoice.guest_address)
    ? `${invoice.profile?.address ?? invoice.guest_address}, ${invoice.profile?.postal_code ?? invoice.guest_postal_code ?? ''} ${invoice.profile?.city ?? invoice.guest_city ?? ''}`.trim()
    : null;

  const ref = t.buildRef(invoice.invoice_number);

  return (
    <Document
      title={t.buildRef(invoice.invoice_number)}
      author={COMPANY.name}
      subject={t.docSubject}
      creator={COMPANY.name}
    >
      <Page size="A4" style={s.page}>

        {/* ── Header band + title row (never split across pages) ── */}
        <View style={s.topBlock} wrap={false}>
          <View style={s.headerBand}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <PdfLogoMark />
              <View style={{ marginLeft: 7 }}>
                <Text style={s.companyName}>{COMPANY.name}</Text>
                <Text style={s.companyTagline}>{t.tagline}</Text>
              </View>
            </View>
            <View>
              <Text style={s.companyDetails}>
                {`${COMPANY.name} ${COMPANY.legal_form}\n${COMPANY.address}\n${COMPANY.postal} ${COMPANY.city}\n${t.vatPrefix} ${COMPANY.vat}   ${t.kboPrefix} ${COMPANY.kbo}\n${COMPANY.email}`}
              </Text>
            </View>
          </View>

          <View style={s.titleRow}>
            <View>
              <Text style={s.invoiceTitleText}>{t.invoiceTitle}</Text>
              <Text style={s.invoiceNumber}>{invoice.invoice_number}</Text>
            </View>
            <View style={[s.statusBadge, { backgroundColor: sc.bg }]}>
              <Text style={{ color: sc.fg, fontFamily: 'Helvetica-Bold', fontSize: 8 }}>
                {t.statuses[invoice.status as keyof typeof t.statuses] ?? invoice.status.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Info row: client (left) + dates (right) ── */}
        <View style={s.infoRow} wrap={false}>
          {/* Client */}
          <View style={s.infoBox}>
            <Text style={s.infoLabel}>{t.clientLabel}</Text>
            {clientCompany && <Text style={s.infoName}>{clientCompany}</Text>}
            <Text style={clientCompany ? s.infoLine : s.infoName}>{clientName}</Text>
            {clientAddr   && <Text style={s.infoLine}>{clientAddr}</Text>}
            {clientVat    && <Text style={s.infoLine}>{t.vatPrefix} {clientVat}</Text>}
            {clientEmail  && <Text style={s.infoLine}>{clientEmail}</Text>}
          </View>

          {/* Dates */}
          <View style={s.infoBox}>
            <Text style={s.infoLabel}>{t.invoiceDetails}</Text>
            <View style={s.dateRow}>
              <Text style={s.dateLabel}>{t.issueDateLabel}</Text>
              <Text style={s.dateValue}>{fmtDate(issueDate, locale)}</Text>
            </View>
            <View style={s.dateRow}>
              <Text style={s.dateLabel}>{t.dueDateLabel}</Text>
              <Text style={isOverdue ? s.dateValueRed : s.dateValue}>
                {dueDate ? fmtDate(dueDate, locale) : `${COMPANY.payment_days} ${lang === 'en' ? 'days after invoice date' : 'dagen na factuurdatum'}`}
              </Text>
            </View>
            <View style={s.dateRow}>
              <Text style={s.dateLabel}>{t.referenceLabel}</Text>
              <Text style={s.dateValue}>{ref}</Text>
            </View>
            {invoice.is_recurring && (
              <View style={s.dateRow}>
                <Text style={s.dateLabel}>{t.typeLabel}</Text>
                <Text style={[s.dateValue, { color: '#7c3aed' }]}>
                  {t.recurringLabel}{' '}
                  {invoice.recurring_interval === 'monthly' ? t.monthly
                    : invoice.recurring_interval === 'quarterly' ? t.quarterly
                    : t.yearly}
                </Text>
              </View>
            )}
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
              <Text style={s.cellDesc}>{item.description}</Text>
              <Text style={s.cellQty}>{item.quantity}</Text>
              <Text style={s.cellPrice}>{fmtEur(item.unit_price, locale)}</Text>
              <Text style={s.cellTotal}>{fmtEur(item.total ?? item.quantity * item.unit_price, locale)}</Text>
            </View>
          ))}
        </View>

        {/* ── Totals ── */}
        <View style={s.totalsRow} wrap={false}>
          <View style={s.totalsBlock}>
            <View style={s.totalLine}>
              <Text style={s.totalLabel}>{t.subtotalLabel}</Text>
              <Text style={s.totalValue}>{fmtEur(subtotal, locale)}</Text>
            </View>
            <View style={s.totalLine}>
              <Text style={s.totalLabel}>{t.vatLabel} {vatRate}%</Text>
              <Text style={s.totalValue}>{fmtEur(vatAmt, locale)}</Text>
            </View>
            <View style={s.totalLineGrand}>
              <Text style={s.totalLabelGrand}>{t.totalDue}</Text>
              <Text style={s.totalValueGrand}>{fmtEur(total, locale)}</Text>
            </View>
          </View>
        </View>

        {/* ── Payment instructions ── */}
        <View style={s.paymentBox} wrap={false}>
          <Text style={s.paymentTitle}>{t.paymentTitle}</Text>
          <View style={s.paymentGrid}>
            <View style={s.paymentRow}>
              <Text style={s.paymentLabel}>{t.beneficiary}</Text>
              <Text style={s.paymentValue}>{COMPANY.name} {COMPANY.legal_form}</Text>
            </View>
            <View style={s.paymentRow}>
              <Text style={s.paymentLabel}>{t.iban}</Text>
              <Text style={s.paymentValue}>{COMPANY.iban}</Text>
            </View>
            <View style={s.paymentRow}>
              <Text style={s.paymentLabel}>{t.bic}</Text>
              <Text style={s.paymentValue}>{COMPANY.bic}</Text>
            </View>
            <View style={s.paymentRow}>
              <Text style={s.paymentLabel}>{t.communication}</Text>
              <Text style={s.paymentValue}>{ref}</Text>
            </View>
          </View>
          <Text style={s.paymentRef}>
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

        {/* ── Footer (every page) ── */}
        <View style={s.footer} fixed>
          <Text style={s.footerLeft}>
            {`${COMPANY.name} ${COMPANY.legal_form} \u00b7 ${t.vatPrefix} ${COMPANY.vat} \u00b7 ${t.kboPrefix} ${COMPANY.kbo}`}
          </Text>
          <View style={{ flexDirection: 'row', gap: 3 }}>
            <Text style={s.footerRight}>{t.termsLabel} </Text>
            <Link src={COMPANY.terms_url} style={s.footerLink}>{COMPANY.terms_url}</Link>
          </View>
        </View>

      </Page>
    </Document>
  );
}
