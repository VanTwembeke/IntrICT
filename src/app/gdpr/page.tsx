'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import Image from 'next/image';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import BackToTop from '@/components/common/BackToTop';
import { useLanguage } from '@/contexts/LanguageContext';
import { sharedT, gdprT } from '@/i18n/legal';

function SectionBlock({
  id, number, title, children, accent = false,
}: {
  id: string; number: number; title: string; children: React.ReactNode; accent?: boolean;
}) {
  return (
    <section id={id} className="mb-8 scroll-mt-24">
      <div className={`rounded-xl border overflow-hidden ${accent ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center gap-4 px-6 py-4 border-b border-slate-100">
          <div className="flex items-center justify-center w-8 h-8 text-sm font-bold text-white rounded-lg shrink-0 bg-slate-800">
            {number}
          </div>
          <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
        </div>
        <div className="px-6 py-5 space-y-3 text-sm leading-relaxed text-slate-600">
          {children}
        </div>
      </div>
    </section>
  );
}

function Sub({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="pl-4 border-l-2 border-slate-200">
      <p className="mb-1 font-semibold text-slate-700">{title}</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Bullet({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5 pl-1">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5">
          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function GDPR() {
  const { lang } = useLanguage();
  const c = lang === 'en' ? gdprT.en : gdprT.nl;
  const sh = lang === 'en' ? sharedT.en : sharedT.nl;
  const ui = c.ui;

  useEffect(() => {
    const lenis = new Lenis();
    function raf(time: number) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main>
        {/* Hero banner */}
        <section className="relative h-64 overflow-hidden md:h-80">
          <Image
            src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
            alt={c.title}
            fill className="object-cover" priority
          />
          <div className="absolute inset-0 bg-linear-to-r from-slate-900/75 via-slate-800/55 to-slate-900/75" />
          <div className="relative z-10 flex items-center h-full">
            <div className="max-w-6xl px-4 mx-auto text-center">
              <p className="mb-3 text-sm font-semibold tracking-widest text-slate-300 uppercase">IntrICT</p>
              <h1 className="mb-4 text-5xl font-bold text-white md:text-6xl">{c.title}</h1>
              <p className="max-w-2xl mx-auto text-lg text-slate-300">{c.subtitle}</p>
            </div>
          </div>
        </section>

        {/* Info bar */}
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-6xl px-4 py-3 mx-auto flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between text-xs text-slate-500">
            <span>{sh.version} &mdash; {sh.effective}</span>
            <span>{sh.updated}</span>
          </div>
        </div>

        {/* Binding language notice */}
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="max-w-6xl px-4 py-2 mx-auto text-xs text-amber-700 text-center">
            {sh.bindingNotice}
          </div>
        </div>

        <div className="max-w-6xl px-4 py-12 mx-auto lg:grid lg:grid-cols-[260px_1fr] lg:gap-12">

          {/* Sticky inhoudsopgave */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <p className="text-xs font-semibold tracking-widest text-slate-500 uppercase">{sh.toc}</p>
              </div>
              <nav className="px-3 py-3">
                {c.toc.map((s, i) => (
                  <a key={s.id} href={`#${s.id}`}
                    className="flex items-center gap-3 px-3 py-2 text-xs text-slate-600 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  >
                    <span className="flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white rounded bg-slate-700 shrink-0">
                      {i + 1}
                    </span>
                    {s.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Hoofdinhoud */}
          <div className="min-w-0">

            <SectionBlock id="inleiding" number={1} title="Inleiding en toepassingsgebied">
              <p>
                IntrICT respecteert de persoonlijke levenssfeer van haar bezoekers, klanten en
                contactpersonen en verwerkt persoonsgegevens in overeenstemming met de Europese
                Algemene Verordening Gegevensbescherming (AVG/GDPR, Verordening EU 2016/679) en de
                Belgische Wet van 30 juli 2018 betreffende de bescherming van natuurlijke personen
                met betrekking tot de verwerking van persoonsgegevens.
              </p>
              <p>
                Dit privacybeleid is van toepassing op alle verwerkingen van persoonsgegevens door
                IntrICT, zowel in het kader van de eigen bedrijfsvoering als in het kader van de
                dienstverlening aan klanten. Voor de dienstverlening waarbij IntrICT optreedt als
                verwerker in opdracht van een klant-verwerkingsverantwoordelijke verwijzen wij naar
                artikel 10 (Verwerkingsovereenkomst).
              </p>
            </SectionBlock>

            <SectionBlock id="verwerkingsverantwoordelijke" number={2} title="Verwerkingsverantwoordelijke">
              <p>De verwerkingsverantwoordelijke voor de verwerking van persoonsgegevens in het kader
                van de eigen website en bedrijfsactiviteiten is:</p>
              <div className="grid gap-1 p-4 rounded-lg bg-slate-50 text-slate-700 sm:grid-cols-2">
                <span className="font-medium">Handelsnaam</span><span>IntrICT</span>
                <span className="font-medium">Rechtsvorm</span><span>Eenmanszaak (bijberoep)</span>
                <span className="font-medium">Vestigingsplaats</span><span>Gent, België</span>
                <span className="font-medium">E-mail</span><span>legal@intrict.com</span>
                <span className="font-medium">Website</span><span>https://intrict.com</span>
              </div>
              <p>
                IntrICT heeft geen wettelijke verplichting tot aanstelling van een
                Functionaris voor Gegevensbescherming (DPO), gelet op de omvang en aard van de
                verwerkingen. Voor privacygerelateerde vragen kunt u ons rechtstreeks contacteren
                via legal@intrict.com.
              </p>
            </SectionBlock>

            <SectionBlock id="gegevens" number={3} title="Welke gegevens verwerken wij?">
              <Sub title="Websitebezoekers">
                <Bullet items={[
                  'Technische gegevens: IP-adres, browsertype, besturingssysteem, bezochte pagina\'s, tijdstip van bezoek (via Vercel Analytics — geanonimiseerd)',
                  'Cookie-voorkeuren: uw gekozen instellingen opgeslagen in localStorage',
                ]} />
              </Sub>
              <Sub title="Contactformulier en offerte-aanvragen">
                <Bullet items={[
                  'Naam, e-mailadres, telefoonnummer (indien opgegeven)',
                  'Inhoud van het bericht of de offerte-aanvraag',
                  'Tijdstip van inzending',
                ]} />
              </Sub>
              <Sub title="Klanten en opdrachtgevers">
                <Bullet items={[
                  'Naam en contactgegevens van de contactpersoon(en)',
                  'Bedrijfsgegevens (naam, BTW-nummer, adres)',
                  'Facturatie- en betalingsgegevens',
                  'Projectgerelateerde communicatie en documentatie',
                  'Accountgegevens voor het klantportaal (e-mail, wachtwoord gehashed)',
                ]} />
              </Sub>
              <Sub title="Nieuwsbrief">
                <Bullet items={[
                  'E-mailadres (enkel met uitdrukkelijke opt-in toestemming)',
                ]} />
              </Sub>
            </SectionBlock>

            <SectionBlock id="grondslagen" number={4} title="Rechtsgrondslagen voor verwerking">
              <p>IntrICT verwerkt persoonsgegevens uitsluitend op basis van één van de volgende wettelijke grondslagen:</p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700">
                      <th className="px-3 py-2 text-left border border-slate-200 font-semibold">{ui.tableColLegal}</th>
                      <th className="px-3 py-2 text-left border border-slate-200 font-semibold">{ui.tableColBasis}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Uitvoering van een overeenkomst (dienstverlening, facturatie)', 'Art. 6(1)(b) AVG — contractuitvoering'],
                      ['Contactformulier en offerte-aanvragen', 'Art. 6(1)(b) AVG — precontractuele maatregelen'],
                      ['Verplichte bewaring van boekhoudkundige documenten', 'Art. 6(1)(c) AVG — wettelijke verplichting'],
                      ['Verbeteren van de website (analytics)', 'Art. 6(1)(a) AVG — toestemming'],
                      ['Nieuwsbrief', 'Art. 6(1)(a) AVG — uitdrukkelijke toestemming'],
                      ['Klantenbeheer en relatieopvolging', 'Art. 6(1)(f) AVG — gerechtvaardigd belang'],
                    ].map(([v, g], i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                        <td className="px-3 py-2 border border-slate-200 text-slate-600">{v}</td>
                        <td className="px-3 py-2 border border-slate-200 text-slate-600">{g}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionBlock>

            <SectionBlock id="doeleinden" number={5} title="Doeleinden van verwerking">
              <Bullet items={[
                'Beantwoorden van vragen en verzoeken via het contactformulier',
                'Opmaak en opvolging van offertes en projectovereenkomsten',
                'Uitvoering van ICT-dienstverlening, webontwikkeling en adviesopdrachten',
                'Facturatie, boekhouding en betalingsopvolging',
                'Toegangsbeheer tot het klantportaal (dashboard)',
                'Verzending van de nieuwsbrief (enkel met toestemming)',
                'Technische werking en beveiliging van de website',
                'Naleving van wettelijke verplichtingen (BTW, boekhouding)',
                'Geanonimiseerde websiteanalyse ter verbetering van de gebruikerservaring',
              ]} />
            </SectionBlock>

            <SectionBlock id="bewaring" number={6} title="Bewaartermijnen">
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700">
                      <th className="px-3 py-2 text-left border border-slate-200 font-semibold">{ui.tableColCat}</th>
                      <th className="px-3 py-2 text-left border border-slate-200 font-semibold">{ui.tableColRetention}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Contactberichten en offertes (niet omgezet naar klant)', '12 maanden na laatste contact'],
                      ['Klantgegevens en projectdossiers', '10 jaar na einde overeenkomst (boekhoudkundige bewaarplicht)'],
                      ['Facturen en boekhoudkundige documenten', '10 jaar (art. 60 BTW-Wetboek)'],
                      ['Accountgegevens klantportaal', 'Tot verwijdering door de klant, max. 12 maanden na inactiviteit'],
                      ['Nieuwsbrief-inschrijving', 'Tot uitschrijving of intrekking toestemming'],
                      ['Analytische cookies (Vercel Analytics)', 'Geanonimiseerd — geen persoonlijke bewaring'],
                    ].map(([c, t], i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                        <td className="px-3 py-2 border border-slate-200 text-slate-600">{c}</td>
                        <td className="px-3 py-2 border border-slate-200 text-slate-600">{t}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionBlock>

            <SectionBlock id="derden" number={7} title="Doorgifte aan derden">
              <p>
                IntrICT deelt persoonsgegevens uitsluitend mee aan derden voor zover dit noodzakelijk
                is voor de uitvoering van de dienstverlening, op grond van een wettelijke verplichting
                of met uw uitdrukkelijke toestemming. De volgende sub-verwerkers worden ingezet:
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700">
                      <th className="px-3 py-2 text-left border border-slate-200 font-semibold">{ui.tableColParty}</th>
                      <th className="px-3 py-2 text-left border border-slate-200 font-semibold">{ui.tableColPurpose}</th>
                      <th className="px-3 py-2 text-left border border-slate-200 font-semibold">{ui.tableColLocation}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Supabase Inc.', 'Database en authenticatie (klantportaal)', 'EU (Frankfurt)'],
                      ['Vercel Inc.', 'Hosting en geanonimiseerde analytics', 'EU/VS (SCCs)'],
                      ['Microsoft Corporation', 'Transactionele e-mails en nieuwsbrief (M365)', 'EU/VS (SCCs)'],
                    ].map(([s, d, l], i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                        <td className="px-3 py-2 border border-slate-200 text-slate-600 font-medium">{s}</td>
                        <td className="px-3 py-2 border border-slate-200 text-slate-600">{d}</td>
                        <td className="px-3 py-2 border border-slate-200 text-slate-600">{l}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-slate-500">
                {ui.sccNote}
              </p>
            </SectionBlock>

            <SectionBlock id="rechten" number={8} title="Uw rechten als betrokkene">
              <p>Op basis van de AVG beschikt u over de volgende rechten:</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { title: 'Recht op inzage', desc: 'U heeft het recht om een kopie te vragen van de persoonsgegevens die wij over u verwerken. (Art. 15 AVG)' },
                  { title: 'Recht op rectificatie', desc: 'U kunt verzoeken onjuiste of onvolledige gegevens te corrigeren of aan te vullen. (Art. 16 AVG)' },
                  { title: 'Recht op wissing', desc: 'In bepaalde gevallen kunt u verzoeken uw gegevens te laten verwijderen ("recht op vergetelheid"). (Art. 17 AVG)' },
                  { title: 'Recht op beperking', desc: 'U kunt vragen de verwerking tijdelijk te beperken, bijv. terwijl een bezwaar wordt beoordeeld. (Art. 18 AVG)' },
                  { title: 'Recht op overdraagbaarheid', desc: 'U kunt uw gegevens opvragen in een gestructureerd, gangbaar formaat. (Art. 20 AVG)' },
                  { title: 'Recht van bezwaar', desc: 'U kunt bezwaar maken tegen verwerking op basis van gerechtvaardigd belang of voor direct marketing. (Art. 21 AVG)' },
                  { title: 'Intrekking toestemming', desc: 'Waar verwerking berust op toestemming, kunt u die te allen tijde intrekken zonder opgave van reden. (Art. 7(3) AVG)' },
                  { title: 'Geen geautomatiseerde besluitvorming', desc: 'IntrICT neemt geen geautomatiseerde beslissingen met rechtsgevolgen op basis van uw persoonsgegevens.' },
                ].map((r, i) => (
                  <div key={i} className="p-3 rounded-lg border border-slate-100 bg-slate-50">
                    <p className="text-xs font-semibold text-slate-800 mb-1">{r.title}</p>
                    <p className="text-xs text-slate-500 leading-relaxed">{r.desc}</p>
                  </div>
                ))}
              </div>
              <p>
                Verzoeken kunnen worden ingediend via{' '}
                <a href="mailto:legal@intrict.com" className="text-blue-600 underline hover:text-blue-700">
                  legal@intrict.com
                </a>
                . Wij reageren binnen 30 kalenderdagen na ontvangst van uw verzoek. Bij complexe of
                meervoudige verzoeken kan deze termijn met maximaal 60 dagen worden verlengd, mits kennisgeving.
              </p>
            </SectionBlock>

            <SectionBlock id="beveiliging" number={9} title="Technische en organisatorische beveiliging">
              <p>
                IntrICT neemt passende technische en organisatorische maatregelen om persoonsgegevens
                te beschermen tegen verlies, ongeoorloofde toegang, openbaarmaking of vernietiging:
              </p>
              <Bullet items={[
                'Versleutelde verbindingen (HTTPS/TLS) op alle pagina\'s van de website',
                'Wachtwoorden opgeslagen als gehasht en gezouten waarde (via Supabase Auth — bcrypt)',
                'Row-Level Security (RLS) in de database: elke gebruiker ziet uitsluitend zijn eigen gegevens',
                'Toegang tot productiesystemen beperkt via API-sleutels en omgevingsvariabelen',
                'Regelmatige beveiligingsupdates van gebruikte frameworks en dependencies',
                'Minimale gegevensverzameling: enkel de gegevens die strikt noodzakelijk zijn voor het doel',
                'Beveiligde e-mailinfrastructuur via Microsoft 365 met DKIM/SPF-authenticatie',
              ]} />
              <p>
                Bij een inbreuk in verband met persoonsgegevens die een risico inhoudt voor de rechten
                en vrijheden van betrokkenen, zal IntrICT de bevoegde toezichthoudende autoriteit
                (GBA) informeren binnen 72 uur na vaststelling van de inbreuk, overeenkomstig art. 33 AVG.
              </p>
            </SectionBlock>

            <SectionBlock id="dpa" number={10} title="Verwerkingsovereenkomst (Data Processing Agreement)" accent>
              <p>
                Wanneer IntrICT in het kader van een dienstverleningsovereenkomst persoonsgegevens
                verwerkt <strong className="text-slate-700">in opdracht van</strong> een klant die optreedt als
                verwerkingsverantwoordelijke, is een verwerkingsovereenkomst (DPA) vereist overeenkomstig
                artikel 28 AVG. De onderstaande bepalingen vormen de standaard verwerkingsovereenkomst
                die van toepassing is op de dienstverlening van IntrICT, tenzij partijen een afzonderlijke
                schriftelijke DPA hebben gesloten.
              </p>

              <Sub title="Art. DPA-1 — Onderwerp en duur">
                <p>
                  Deze verwerkingsovereenkomst is van toepassing op alle verwerkingen van persoonsgegevens
                  die IntrICT uitvoert in het kader van de hoofdovereenkomst (dienstverlenings- of
                  retainer-overeenkomst) en loopt voor de duur van die overeenkomst, tenzij anders
                  schriftelijk overeengekomen.
                </p>
              </Sub>

              <Sub title="Art. DPA-2 — Aard, doel en soort gegevens">
                <p>
                  IntrICT verwerkt uitsluitend de persoonsgegevens die de opdrachtgever
                  (verwerkingsverantwoordelijke) haar ter beschikking stelt of waartoe zij toegang
                  verleent in het kader van de opdracht. De verwerking beperkt zich tot wat
                  noodzakelijk is voor de uitvoering van de overeengekomen diensten.
                </p>
                <p>
                  Voorbeelden van verwerkte gegevens: klantgegevens in websites of webapplicaties
                  die IntrICT ontwikkelt of beheert, contactgegevens van eindgebruikers, bestelgegevens
                  in e-commerce-toepassingen.
                </p>
              </Sub>

              <Sub title="Art. DPA-3 — Verplichtingen van IntrICT als verwerker">
                <Bullet items={[
                  'Verwerkt persoonsgegevens uitsluitend op gedocumenteerde instructie van de verwerkingsverantwoordelijke, tenzij wettelijk verplicht tot verdere verwerking.',
                  'Garandeert dat personen die gemachtigd zijn persoonsgegevens te verwerken, zich tot vertrouwelijkheid hebben verbonden.',
                  'Neemt alle vereiste technische en organisatorische maatregelen overeenkomstig art. 32 AVG.',
                  'Schakelt geen andere verwerker in zonder voorafgaande schriftelijke toestemming van de verwerkingsverantwoordelijke.',
                  'Verleent medewerking aan de verwerkingsverantwoordelijke bij het beantwoorden van verzoeken van betrokkenen.',
                  'Verwijdert of geeft naar keuze van de verwerkingsverantwoordelijke alle persoonsgegevens terug na afloop van de verwerkingsdiensten.',
                  'Stelt alle informatie ter beschikking die nodig is om de naleving van de verplichtingen van art. 28 AVG aan te tonen.',
                ]} />
              </Sub>

              <Sub title="Art. DPA-4 — Verplichtingen van de verwerkingsverantwoordelijke (klant)">
                <Bullet items={[
                  'Zorgt ervoor dat de verwerking van persoonsgegevens een geldige rechtsgrondslag heeft.',
                  'Verleent IntrICT uitsluitend toegang tot de persoonsgegevens die strikt noodzakelijk zijn voor de uitvoering van de opdracht.',
                  'Informeert IntrICT onverwijld over wijzigingen in instructies of verwerkingsdoeleinden.',
                  'Draagt zorg voor de naleving van de rechten van betrokkenen en informeert hen over de verwerking.',
                ]} />
              </Sub>

              <Sub title="Art. DPA-5 — Sub-verwerkers">
                <p>
                  IntrICT maakt gebruik van de in art. 7 van dit privacybeleid genoemde sub-verwerkers
                  (Supabase, Vercel, Microsoft). De opdrachtgever verleent hiervoor een algemene
                  voorafgaande toestemming door de dienstverleningsovereenkomst aan te gaan. IntrICT
                  informeert de opdrachtgever vooraf over wijzigingen in de lijst van sub-verwerkers.
                  Alle sub-verwerkers zijn contractueel gebonden aan GDPR-conforme voorwaarden.
                </p>
              </Sub>

              <Sub title="Art. DPA-6 — Overdracht buiten de EER">
                <p>
                  IntrICT draagt persoonsgegevens uitsluitend over naar landen buiten de EER indien
                  een passend beschermingsniveau is gewaarborgd via Standard Contractual Clauses (SCCs)
                  of een adequaatheidsbesluit van de Europese Commissie.
                </p>
              </Sub>

              <Sub title="Art. DPA-7 — Datalekken">
                <p>
                  IntrICT meldt een inbreuk in verband met persoonsgegevens onverwijld aan de
                  verwerkingsverantwoordelijke, uiterlijk binnen 48 uur na vaststelling, met
                  vermelding van de aard van de inbreuk, de betrokken categorieën en het geschatte
                  aantal betrokkenen en gegevensrecords, de waarschijnlijke gevolgen, en de genomen
                  of voorgestelde maatregelen.
                </p>
              </Sub>

              <Sub title="Art. DPA-8 — Audits en inspectie">
                <p>
                  IntrICT verleent de verwerkingsverantwoordelijke of diens gemachtigde auditor toegang
                  tot alle informatie die nodig is om de naleving van art. 28 AVG aan te tonen, mits
                  redelijke voorafgaande kennisgeving (minimum 5 werkdagen) en op een niet-verstorende
                  wijze. Alle kosten verbonden aan audits zijn ten laste van de opdrachtgever.
                </p>
              </Sub>

              <div className="mt-4 p-4 rounded-lg bg-blue-50 border border-blue-100 text-xs text-blue-700">
                <strong>Overeenkomst:</strong> Door het sluiten van een dienstverleningsovereenkomst
                of retainer-overeenkomst met IntrICT aanvaardt de opdrachtgever automatisch de
                bovenstaande DPA-bepalingen als integraal onderdeel van de overeenkomst, voor zover
                IntrICT persoonsgegevens verwerkt in opdracht van de klant. Partijen kunnen te allen
                tijde een afzonderlijke, op maat gemaakte DPA sluiten.
              </div>
            </SectionBlock>

            <SectionBlock id="klachten" number={11} title="Klachten">
              <p>
                Heeft u vragen of klachten over de wijze waarop IntrICT uw persoonsgegevens verwerkt?
                Neem dan eerst contact op via{' '}
                <a href="mailto:legal@intrict.com" className="text-blue-600 underline hover:text-blue-700">
                  legal@intrict.com
                </a>
                . Wij streven ernaar uw vraag of klacht binnen 30 dagen te beantwoorden.
              </p>
              <p>
                U heeft ook het recht een klacht in te dienen bij de bevoegde Belgische
                toezichthoudende autoriteit:
              </p>
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <p className="font-semibold text-slate-800 text-xs mb-1">Gegevensbeschermingsautoriteit (GBA)</p>
                <p className="text-xs text-slate-600">Drukpersstraat 35, 1000 Brussel</p>
                <p className="text-xs text-slate-600">
                  Website:{' '}
                  <a href="https://www.gegevensbeschermingsautoriteit.be" target="_blank" rel="noopener noreferrer"
                    className="text-blue-600 underline">
                    www.gegevensbeschermingsautoriteit.be
                  </a>
                </p>
                <p className="text-xs text-slate-600">E-mail: contact@apd-gba.be</p>
              </div>
            </SectionBlock>

            <SectionBlock id="wijzigingen" number={12} title="Wijzigingen" accent>
              <p>
                IntrICT behoudt zich het recht voor dit privacybeleid te allen tijde te wijzigen. De
                meest recente versie is steeds raadpleegbaar op{' '}
                <a href="https://intrict.com/gdpr" className="text-blue-600 underline hover:text-blue-700">
                  https://intrict.com/gdpr
                </a>
                . Wezenlijke wijzigingen worden bekendgemaakt via de website of per e-mail aan
                geregistreerde gebruikers.
              </p>
            </SectionBlock>

            <div className="p-6 mt-4 text-sm rounded-xl bg-slate-800 text-slate-300">
              <p className="mb-1 font-semibold text-white">{ui.contactTitle}</p>
              <p>{ui.contactFooter}{' '}
                <a href="mailto:info@intrict.com" className="text-blue-400 underline hover:text-blue-300">
                  info@intrict.com
                </a>
              </p>
              <p className="mt-3 text-xs text-slate-400">{ui.footerMeta}</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
}
