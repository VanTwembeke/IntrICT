// Server-side only — do not import in client components.
// Generates a Belgian-compliant invoice PDF using @react-pdf/renderer.

import React from 'react';
import {
  Document, Page, Text, View, StyleSheet, Font, Link,
} from '@react-pdf/renderer';
import { COMPANY } from './company';
import type { Invoice } from './types';

// ─── Fonts ────────────────────────────────────────────────────────────────────
// Helvetica is built-in to @react-pdf/renderer (no download needed)

// ─── Palette ─────────────────────────────────────────────────────────────────
const BLUE   = '#1d4ed8';
const DARK   = '#0f172a';
const MID    = '#475569';
const LIGHT  = '#94a3b8';
const BORDER = '#e2e8f0';
const BG     = '#f8fafc';
const GREEN  = '#15803d';
const RED    = '#dc2626';

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  page: {
    fontFamily:   'Helvetica',
    fontSize:     9,
    color:        DARK,
    paddingTop:   48,
    paddingBottom: 56,
    paddingHorizontal: 48,
    lineHeight:   1.45,
  },

  // Header band
  headerBand: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 28,
    paddingBottom: 20,
    borderBottom: `1.5 solid ${BLUE}`,
  },
  companyName: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: BLUE,
    letterSpacing: 1,
  },
  companyTagline: {
    fontSize: 8,
    color: MID,
    marginTop: 2,
  },
  companyDetails: {
    fontSize: 8,
    color: MID,
    textAlign: 'right',
    lineHeight: 1.6,
  },

  // Invoice title band
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  invoiceTitle: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: DARK,
    letterSpacing: 0.5,
  },
  invoiceNumber: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: BLUE,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
  },

  // Parties
  partiesRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  partyBox: {
    flex: 1,
    backgroundColor: BG,
    padding: 12,
    borderRadius: 4,
    border: `1 solid ${BORDER}`,
  },
  partyLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: BLUE,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 5,
  },
  partyName: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: DARK,
    marginBottom: 2,
  },
  partyLine: {
    fontSize: 8,
    color: MID,
    lineHeight: 1.6,
  },

  // Dates row
  datesRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  dateBox: {
    flex: 1,
    backgroundColor: BG,
    padding: 10,
    borderRadius: 4,
    border: `1 solid ${BORDER}`,
  },
  dateLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: LIGHT,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  dateValue: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: DARK,
  },
  dateValueRed: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: RED,
  },

  // Table
  table: {
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: BLUE,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 4,
    marginBottom: 2,
  },
  tableHeaderCell: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderBottom: `1 solid ${BORDER}`,
  },
  tableRowAlt: {
    flexDirection: 'row',
    paddingVertical: 7,
    paddingHorizontal: 10,
    backgroundColor: BG,
    borderBottom: `1 solid ${BORDER}`,
  },
  cellDesc:  { flex: 5, fontSize: 8.5, color: DARK },
  cellQty:   { flex: 1, fontSize: 8.5, color: MID,  textAlign: 'center' },
  cellPrice: { flex: 2, fontSize: 8.5, color: MID,  textAlign: 'right' },
  cellTotal: { flex: 2, fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: DARK, textAlign: 'right' },

  cellDescH:  { flex: 5, fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#ffffff' },
  cellQtyH:   { flex: 1, fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#ffffff', textAlign: 'center' },
  cellPriceH: { flex: 2, fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#ffffff', textAlign: 'right' },
  cellTotalH: { flex: 2, fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#ffffff', textAlign: 'right' },

  // Totals block
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 4,
  },
  totalsBlock: {
    width: 220,
  },
  totalLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
    borderBottom: `1 solid ${BORDER}`,
  },
  totalLineGrand: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    backgroundColor: BLUE,
    paddingHorizontal: 10,
    borderRadius: 4,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 8,
    color: MID,
  },
  totalValue: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: DARK,
  },
  totalLabelGrand: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
  },
  totalValueGrand: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
  },

  // Payment section
  paymentBox: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#eff6ff',
    border: `1 solid #bfdbfe`,
    borderRadius: 4,
  },
  paymentTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: BLUE,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  paymentRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  paymentLabel: {
    fontSize: 8,
    color: MID,
    width: 80,
  },
  paymentValue: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: DARK,
    flex: 1,
  },
  paymentRef: {
    fontSize: 8,
    color: MID,
    marginTop: 6,
  },

  // Notes
  notesBox: {
    marginTop: 14,
    padding: 10,
    backgroundColor: BG,
    border: `1 solid ${BORDER}`,
    borderRadius: 4,
  },
  notesLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: LIGHT,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 8,
    color: MID,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 28,
    left: 48,
    right: 48,
    borderTop: `1 solid ${BORDER}`,
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLeft: {
    fontSize: 7,
    color: LIGHT,
  },
  footerRight: {
    fontSize: 7,
    color: LIGHT,
    textAlign: 'right',
  },
  footerLink: {
    fontSize: 7,
    color: BLUE,
  },
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtEur(n: number) {
  return `€ ${n.toLocaleString('nl-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('nl-BE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function statusColor(status: string): { bg: string; fg: string } {
  switch (status) {
    case 'paid':      return { bg: '#dcfce7', fg: GREEN };
    case 'overdue':   return { bg: '#fee2e2', fg: RED };
    case 'sent':      return { bg: '#dbeafe', fg: BLUE };
    case 'cancelled': return { bg: '#f1f5f9', fg: LIGHT };
    default:          return { bg: '#f1f5f9', fg: MID }; // draft
  }
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    draft: 'CONCEPT', sent: 'VERZONDEN', paid: 'BETAALD',
    overdue: 'VERVALLEN', cancelled: 'GEANNULEERD',
  };
  return map[status] ?? status.toUpperCase();
}

// Belgian structured payment reference (OGM/VCS) — optional
function buildRef(invoiceNumber: string) {
  return `Factuur ${invoiceNumber}`;
}

// ─── PDF Document ─────────────────────────────────────────────────────────────

export function InvoicePDF({ invoice }: { invoice: Invoice }) {
  const items   = invoice.items ?? [];
  const subtotal = invoice.subtotal ?? 0;
  const vatAmt   = invoice.vat_amount ?? 0;
  const total    = invoice.total ?? 0;
  const vatRate  = invoice.vat_rate ?? 21;

  const issueDate = invoice.issue_date ?? invoice.created_at;
  const dueDate   = invoice.due_date;

  const sc = statusColor(invoice.status);
  const isOverdue = invoice.status === 'overdue';

  const clientName    = invoice.profile?.full_name ?? invoice.profile?.email ?? '—';
  const clientCompany = invoice.profile?.company;
  const clientVat     = invoice.profile?.vat_number;
  const clientAddr    = invoice.profile?.address
    ? `${invoice.profile.address}\n${invoice.profile.postal_code ?? ''} ${invoice.profile.city ?? ''}`
    : null;

  return (
    <Document
      title={`Factuur ${invoice.invoice_number}`}
      author={COMPANY.name}
      subject="Factuur"
      creator={COMPANY.name}
    >
      <Page size="A4" style={s.page}>

        {/* ── Header band ── */}
        <View style={s.headerBand}>
          <View>
            <Text style={s.companyName}>{COMPANY.name}</Text>
            <Text style={s.companyTagline}>IT-diensten &amp; weboplossingen</Text>
          </View>
          <View>
            <Text style={s.companyDetails}>
              {`${COMPANY.name} ${COMPANY.legal_form}\n`}
              {`${COMPANY.address}\n`}
              {`${COMPANY.postal} ${COMPANY.city}\n`}
              {`BTW: ${COMPANY.vat}\n`}
              {`KBO: ${COMPANY.kbo}\n`}
              {`${COMPANY.email}`}
            </Text>
          </View>
        </View>

        {/* ── Title row ── */}
        <View style={s.titleRow}>
          <View>
            <Text style={s.invoiceTitle}>FACTUUR</Text>
            <Text style={s.invoiceNumber}>{invoice.invoice_number}</Text>
          </View>
          <View style={[s.statusBadge, { backgroundColor: sc.bg }]}>
            <Text style={{ color: sc.fg, fontFamily: 'Helvetica-Bold', fontSize: 8 }}>
              {statusLabel(invoice.status)}
            </Text>
          </View>
        </View>

        {/* ── Parties ── */}
        <View style={s.partiesRow}>
          {/* Seller */}
          <View style={s.partyBox}>
            <Text style={s.partyLabel}>Leverancier</Text>
            <Text style={s.partyName}>{COMPANY.name} {COMPANY.legal_form}</Text>
            <Text style={s.partyLine}>{COMPANY.address}</Text>
            <Text style={s.partyLine}>{COMPANY.postal} {COMPANY.city}</Text>
            <Text style={s.partyLine}>BTW: {COMPANY.vat}</Text>
            <Text style={s.partyLine}>KBO: {COMPANY.kbo}</Text>
            <Text style={s.partyLine}>{COMPANY.email}</Text>
          </View>

          {/* Buyer */}
          <View style={s.partyBox}>
            <Text style={s.partyLabel}>Klant</Text>
            {clientCompany && <Text style={s.partyName}>{clientCompany}</Text>}
            <Text style={clientCompany ? s.partyLine : s.partyName}>{clientName}</Text>
            {clientAddr && <Text style={s.partyLine}>{clientAddr}</Text>}
            {clientVat   && <Text style={s.partyLine}>BTW: {clientVat}</Text>}
            <Text style={s.partyLine}>{invoice.profile?.email}</Text>
          </View>
        </View>

        {/* ── Dates ── */}
        <View style={s.datesRow}>
          <View style={s.dateBox}>
            <Text style={s.dateLabel}>Factuurdatum</Text>
            <Text style={s.dateValue}>{fmtDate(issueDate)}</Text>
          </View>
          <View style={s.dateBox}>
            <Text style={s.dateLabel}>Vervaldatum</Text>
            <Text style={isOverdue ? s.dateValueRed : s.dateValue}>
              {dueDate ? fmtDate(dueDate) : `${COMPANY.payment_days} dagen na factuurdatum`}
            </Text>
          </View>
          <View style={s.dateBox}>
            <Text style={s.dateLabel}>Betalingsreferentie</Text>
            <Text style={s.dateValue}>{buildRef(invoice.invoice_number)}</Text>
          </View>
          {invoice.is_recurring && (
            <View style={s.dateBox}>
              <Text style={s.dateLabel}>Facturatietype</Text>
              <Text style={[s.dateValue, { color: '#7c3aed' }]}>
                Terugkerend {invoice.recurring_interval === 'monthly'
                  ? '(maandelijks)' : invoice.recurring_interval === 'quarterly'
                  ? '(kwartaal)' : '(jaarlijks)'}
              </Text>
            </View>
          )}
        </View>

        {/* ── Items table ── */}
        <View style={s.table}>
          <View style={s.tableHeader}>
            <Text style={s.cellDescH}>Omschrijving</Text>
            <Text style={s.cellQtyH}>Aantal</Text>
            <Text style={s.cellPriceH}>Eenheidsprijs</Text>
            <Text style={s.cellTotalH}>Totaal (excl. BTW)</Text>
          </View>

          {items.map((item, i) => (
            <View key={item.id} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt}>
              <Text style={s.cellDesc}>{item.description}</Text>
              <Text style={s.cellQty}>{item.quantity}</Text>
              <Text style={s.cellPrice}>{fmtEur(item.unit_price)}</Text>
              <Text style={s.cellTotal}>{fmtEur(item.total ?? item.quantity * item.unit_price)}</Text>
            </View>
          ))}
        </View>

        {/* ── Totals ── */}
        <View style={s.totalsRow}>
          <View style={s.totalsBlock}>
            <View style={s.totalLine}>
              <Text style={s.totalLabel}>Subtotaal (excl. BTW)</Text>
              <Text style={s.totalValue}>{fmtEur(subtotal)}</Text>
            </View>
            <View style={s.totalLine}>
              <Text style={s.totalLabel}>BTW {vatRate}%</Text>
              <Text style={s.totalValue}>{fmtEur(vatAmt)}</Text>
            </View>
            <View style={s.totalLineGrand}>
              <Text style={s.totalLabelGrand}>TOTAAL VERSCHULDIGD</Text>
              <Text style={s.totalValueGrand}>{fmtEur(total)}</Text>
            </View>
          </View>
        </View>

        {/* ── Payment instructions ── */}
        <View style={s.paymentBox}>
          <Text style={s.paymentTitle}>Betalingsinstructies</Text>
          <View style={s.paymentRow}>
            <Text style={s.paymentLabel}>Begunstigde:</Text>
            <Text style={s.paymentValue}>{COMPANY.name} {COMPANY.legal_form}</Text>
          </View>
          <View style={s.paymentRow}>
            <Text style={s.paymentLabel}>IBAN:</Text>
            <Text style={s.paymentValue}>{COMPANY.iban}</Text>
          </View>
          <View style={s.paymentRow}>
            <Text style={s.paymentLabel}>BIC:</Text>
            <Text style={s.paymentValue}>{COMPANY.bic}</Text>
          </View>
          <View style={s.paymentRow}>
            <Text style={s.paymentLabel}>Mededeling:</Text>
            <Text style={s.paymentValue}>{buildRef(invoice.invoice_number)}</Text>
          </View>
          <Text style={s.paymentRef}>
            {'Gelieve te betalen binnen '}
            {dueDate
              ? `${COMPANY.payment_days} dagen (voor ${fmtDate(dueDate)})`
              : `${COMPANY.payment_days} dagen na factuurdatum`}
            {'. Bij laattijdige betaling is van rechtswege en zonder ingebrekestelling een intrest van 10% per jaar verschuldigd.'}
          </Text>
        </View>

        {/* ── Notes ── */}
        {invoice.notes && (
          <View style={s.notesBox}>
            <Text style={s.notesLabel}>Opmerkingen</Text>
            <Text style={s.notesText}>{invoice.notes}</Text>
          </View>
        )}

        {/* ── Footer ── */}
        <View style={s.footer} fixed>
          <Text style={s.footerLeft}>
            {`${COMPANY.name} ${COMPANY.legal_form} · BTW ${COMPANY.vat} · KBO ${COMPANY.kbo}`}
          </Text>
          <View style={{ flexDirection: 'row', gap: 4 }}>
            <Text style={s.footerRight}>Algemene voorwaarden: </Text>
            <Link src={COMPANY.terms_url} style={s.footerLink}>{COMPANY.terms_url}</Link>
          </View>
        </View>

      </Page>
    </Document>
  );
}
