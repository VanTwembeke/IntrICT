// ─────────────────────────────────────────────────────────────────────────────
// Contract text generator — IntrICT overname overeenkomsten
//
// Generates a Belgian B2B-compliant contract document as plain text.
// The text adapts automatically based on service_type.
// ─────────────────────────────────────────────────────────────────────────────

import { COMPANY } from './company';
import type { ContractServiceType } from './types';

export interface ContractParties {
  // Client
  clientName: string;
  clientCompany: string | null;
  clientVat: string | null;
  clientAddress: string | null;
  clientPostal: string | null;
  clientCity: string | null;
  clientEmail: string | null;
}

export interface ContractParams {
  contractNumber: string;
  serviceType: ContractServiceType;
  serviceDescription: string;
  monthlyPriceExclVat: number;
  vatRate: number;
  startDate: string;         // YYYY-MM-DD
  firstInvoiceDate: string;  // YYYY-MM-DD
  noticePeriodMonths: number;
  notes?: string | null;
  parties: ContractParties;
}

// ── Service type labels ───────────────────────────────────────────────────────

const SERVICE_LABELS: Record<ContractServiceType, string> = {
  website: 'Website Overname',
  hosting: 'Hostingbeheer',
  domain:  'Domeinnaambeheer',
  other:   'Dienstverleningsovereenkomst',
};

const SERVICE_VOORWERP: Record<ContractServiceType, string> = {
  website:
    'het overnemen van het beheer, de hosting en het onderhoud van de hierna beschreven website van de Klant, ' +
    'inclusief alle bijhorende bestanden, databases, domeinnamen en technische configuraties.',
  hosting:
    'het overnemen van de hostingdiensten van de hierna beschreven digitale infrastructuur van de Klant, ' +
    'inclusief serverruimte, bandbreedte, back-ups en technisch beheer.',
  domain:
    'het overnemen van het beheer van de hierna beschreven domeinnaam/domeinnamen van de Klant, ' +
    'inclusief registratie, verlenging, DNS-beheer en gerelateerde diensten.',
  other:
    'het leveren van de hierna beschreven digitale dienstverlening ten behoeve van de Klant.',
};

// ── Date formatter ────────────────────────────────────────────────────────────

function fmtDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  const months = ['januari','februari','maart','april','mei','juni',
                  'juli','augustus','september','oktober','november','december'];
  return `${parseInt(d, 10)} ${months[parseInt(m, 10) - 1]} ${y}`;
}

function fmtEuro(amount: number): string {
  return amount.toLocaleString('nl-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ── Main generator ────────────────────────────────────────────────────────────

export function generateContractText(params: ContractParams): string {
  const {
    contractNumber,
    serviceType,
    serviceDescription,
    monthlyPriceExclVat,
    vatRate,
    startDate,
    firstInvoiceDate,
    noticePeriodMonths,
    notes,
    parties,
  } = params;

  const vatAmount       = monthlyPriceExclVat * (vatRate / 100);
  const totalMonthly    = monthlyPriceExclVat + vatAmount;
  const contractTitle   = SERVICE_LABELS[serviceType];
  const contractVoorwerp = SERVICE_VOORWERP[serviceType];

  const clientLine1 = [parties.clientCompany, parties.clientName].filter(Boolean).join(', ');
  const clientVatLine = parties.clientVat ? `BTW-nummer: ${parties.clientVat}` : '';
  const clientAddressLine = [
    parties.clientAddress,
    [parties.clientPostal, parties.clientCity].filter(Boolean).join(' '),
  ].filter(Boolean).join(', ');

  return `\
OVEREENKOMST — ${contractTitle.toUpperCase()}
Referentie: ${contractNumber}
Opgemaakt te ${COMPANY.city} op ${fmtDate(startDate)}

════════════════════════════════════════════════════════════════════════════════

ARTIKEL 1 — PARTIJEN

Dienstverlener:
  ${COMPANY.name} (${COMPANY.legal_form})
  ${COMPANY.address}, ${COMPANY.postal} ${COMPANY.city}, ${COMPANY.country}
  BTW-nummer: ${COMPANY.vat}
  KBO-nummer: ${COMPANY.kbo}
  E-mail: ${COMPANY.email} | Tel.: ${COMPANY.phone}
  (hierna "IntrICT" of "Dienstverlener")

Klant:
  ${clientLine1}${clientVatLine ? '\n  ' + clientVatLine : ''}${clientAddressLine ? '\n  ' + clientAddressLine : ''}${parties.clientEmail ? '\n  E-mail: ' + parties.clientEmail : ''}
  (hierna "Klant")

Samen aangeduid als "Partijen".

════════════════════════════════════════════════════════════════════════════════

ARTIKEL 2 — VOORWERP VAN DE OVEREENKOMST

Deze overeenkomst heeft betrekking op ${contractVoorwerp}

Omschrijving van de dienst:
  ${serviceDescription}

════════════════════════════════════════════════════════════════════════════════

ARTIKEL 3 — DUUR EN AUTOMATISCHE VERLENGING

3.1  Deze overeenkomst gaat in op ${fmtDate(startDate)} en wordt gesloten voor onbepaalde duur.

3.2  De overeenkomst wordt stilzwijgend jaarlijks verlengd, tenzij één van de Partijen
     de overeenkomst tijdig opzegt overeenkomstig artikel 4.

3.3  De eerste facturatieperiode loopt van ${fmtDate(startDate)} tot en met de datum van de
     eerste factuur (${fmtDate(firstInvoiceDate)}). Daarna wordt de dienst maandelijks
     gefactureerd op de eerste dag van elke kalendermaand.

════════════════════════════════════════════════════════════════════════════════

ARTIKEL 4 — OPZEGGING

4.1  Elke Partij kan deze overeenkomst beëindigen mits een vooropzeggingstermijn van
     minimum ${noticePeriodMonths} ${noticePeriodMonths === 1 ? 'maand' : 'maanden'}, betekend per aangetekend schrijven of per e-mail met
     ontvangstbevestiging.

4.2  Opzegging dient te worden gericht aan:
     — IntrICT: ${COMPANY.email}
     — Klant: ${parties.clientEmail ?? '(e-mailadres klant)'}

4.3  Bij opzegging door de Klant blijven alle openstaande facturen tot en met de
     effectieve einddatum verschuldigd.

4.4  IntrICT behoudt het recht de overeenkomst met onmiddellijke ingang en zonder
     schadevergoeding te beëindigen bij:
     (a) ernstige wanprestatie van de Klant die niet werd hersteld binnen 15 kalenderdagen
         na schriftelijke ingebrekestelling;
     (b) faillissement, gerechtelijke reorganisatie of staking van betaling door de Klant.

════════════════════════════════════════════════════════════════════════════════

ARTIKEL 5 — BETALINGSVOORWAARDEN

5.1  De maandelijkse vergoeding bedraagt:
       Excl. BTW :  € ${fmtEuro(monthlyPriceExclVat)}
       BTW ${vatRate}%  :  € ${fmtEuro(vatAmount)}
       Incl. BTW :  € ${fmtEuro(totalMonthly)}

5.2  Facturen worden maandelijks uitgereikt op de eerste dag van de kalendermaand
     en zijn betaalbaar binnen ${COMPANY.payment_days} kalenderdagen na factuurdatum.

5.3  Betaling geschiedt via overschrijving op rekeningnummer ${COMPANY.iban}
     (BIC: ${COMPANY.bic}), met vermelding van het factuurnummer als mededeling.

5.4  Bij laattijdige betaling is van rechtswege en zonder ingebrekestelling een
     verwijlintrest verschuldigd gelijk aan de referentie-interestvoet verhoogd met
     8 procentpunten overeenkomstig de Wet van 2 augustus 2002 betreffende de
     bestrijding van betalingsachterstand bij handelstransacties, evenals een
     forfaitaire schadevergoeding van 10% op het openstaande bedrag (min. € 40,00).

5.5  IntrICT behoudt het recht om dienstverlening op te schorten zolang een factuur
     meer dan 15 dagen achterstallig is.

════════════════════════════════════════════════════════════════════════════════

ARTIKEL 6 — OVERDRACHT VAN RECHTEN EN VERPLICHTINGEN

6.1  De Klant draagt alle noodzakelijke toegangsrechten, credentials en licenties
     over aan IntrICT voor zover vereist voor de uitvoering van deze overeenkomst.

6.2  IntrICT mag voor de uitvoering van haar verplichtingen beroep doen op
     onderaannemers, onder haar volledige verantwoordelijkheid.

6.3  De intellectuele eigendomsrechten op door IntrICT ontwikkelde componenten
     blijven eigendom van IntrICT, tenzij schriftelijk anders overeengekomen.
     De Klant verkrijgt een niet-exclusief gebruiksrecht voor de duur van deze overeenkomst.

════════════════════════════════════════════════════════════════════════════════

ARTIKEL 7 — AANSPRAKELIJKHEID EN BEPERKINGEN

7.1  IntrICT is slechts aansprakelijk voor directe schade die het rechtstreekse gevolg
     is van een bewezen toerekenbare tekortkoming.

7.2  De totale aansprakelijkheid van IntrICT is beperkt tot het bedrag van de facturen
     gefactureerd in de drie (3) maanden voorafgaand aan het schadeveroorzakende feit.

7.3  IntrICT is niet aansprakelijk voor:
     (a) indirecte schade, gevolgschade, gederfde winst of verlies van gegevens;
     (b) schade veroorzaakt door overmacht, storingen bij derden (hosting providers,
         registrars, telecombedrijven) of handelingen van de Klant zelf;
     (c) onbeschikbaarheid van diensten van derden waarvan IntrICT afhankelijk is.

7.4  De Klant vrijwaart IntrICT voor aanspraken van derden die voortvloeien uit de
     inhoud van de overgenomen website of dienst.

════════════════════════════════════════════════════════════════════════════════

ARTIKEL 8 — VERTROUWELIJKHEID

8.1  Beide Partijen verbinden zich ertoe alle vertrouwelijke informatie die zij in het
     kader van deze overeenkomst ontvangen strikt vertrouwelijk te behandelen en niet
     aan derden bekend te maken, tenzij dit wettelijk verplicht is.

8.2  Deze verplichting geldt voor de duur van de overeenkomst en voor een periode van
     twee (2) jaar na beëindiging ervan.

════════════════════════════════════════════════════════════════════════════════

ARTIKEL 9 — GEGEVENSBESCHERMING

9.1  IntrICT verwerkt persoonsgegevens van de Klant uitsluitend voor de uitvoering
     van deze overeenkomst, overeenkomstig de AVG/GDPR en de toepasselijke
     Belgische privacywetgeving.

9.2  Het privacybeleid van IntrICT is beschikbaar op ${COMPANY.website}/privacy.

════════════════════════════════════════════════════════════════════════════════

ARTIKEL 10 — TOEPASSELIJK RECHT EN BEVOEGDE RECHTBANK

10.1 Op deze overeenkomst is uitsluitend het Belgisch recht van toepassing.

10.2 In geval van betwisting zijn uitsluitend de rechtbanken van het arrondissement
     ${COMPANY.city} bevoegd.

════════════════════════════════════════════════════════════════════════════════
${notes ? `\nARTIKEL 11 — BIJZONDERE BEPALINGEN\n\n${notes}\n\n════════════════════════════════════════════════════════════════════════════════` : ''}

HANDTEKENINGEN

Opgemaakt in twee (2) originele exemplaren, één voor elke Partij.


Dienstverlener — ${COMPANY.name}                    Klant — ${clientLine1}

Naam:  ____________________________         Naam:  ____________________________

Datum: ____________________________         Datum: ____________________________

Handtekening:                               Handtekening:


____________________________                ____________________________

`;
}
