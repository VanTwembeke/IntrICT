import { NextResponse } from 'next/server';

// ── HTML analysis helpers ──────────────────────────────────────────────────────

function extractMeta(html: string, attr: string, value: string): string {
  const patterns = [
    new RegExp(`<meta[^>]+${attr}=["']${value}["'][^>]+content=["']([^"']*)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+${attr}=["']${value}["']`, 'i'),
  ];
  for (const p of patterns) {
    const m = html.match(p);
    if (m) return m[1].trim();
  }
  return '';
}

function analyzeHtml(html: string, url: URL, robotsTxt: string, sitemapOk: boolean) {
  // ── Basic extractions ────────────────────────────────────────────────────────
  const titleM   = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  const title    = titleM ? titleM[1].trim() : '';

  const metaDesc = extractMeta(html, 'name', 'description');
  const canonical = (() => {
    const p1 = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["']/i);
    const p2 = html.match(/<link[^>]+href=["']([^"']*)["'][^>]+rel=["']canonical["']/i);
    return (p1 || p2)?.[1] ?? '';
  })();

  const hasViewport = /<meta[^>]+name=["']viewport["']/i.test(html);
  const langM       = html.match(/<html[^>]+lang=["']([^"']*)["']/i);
  const lang        = langM?.[1] ?? '';
  const robotsMeta  = extractMeta(html, 'name', 'robots').toLowerCase();
  const hasNoIndex  = robotsMeta.includes('noindex');

  // Headings
  const h1s = (html.match(/<h1[\s>][^]*?<\/h1>/gi) || []);
  const h2s = (html.match(/<h2[\s>]/gi) || []);
  const h3s = (html.match(/<h3[\s>]/gi) || []);

  // Images
  const allImgs        = html.match(/<img[^>]+>/gi) || [];
  const imgsNoAlt      = allImgs.filter(i => !/alt=["'][^"']+["']/i.test(i)).length;

  // OG / Twitter
  const ogTitle   = extractMeta(html, 'property', 'og:title');
  const ogDesc    = extractMeta(html, 'property', 'og:description');
  const ogImage   = extractMeta(html, 'property', 'og:image');
  const twCard    = extractMeta(html, 'name', 'twitter:card');

  // Schema
  const hasSchema = /application\/ld\+json/i.test(html) || /itemtype=["'][^"']*schema\.org/i.test(html);

  // Hreflang
  const hasHreflang = /<link[^>]+hreflang/i.test(html);

  // Robots.txt analysis
  const robotsOk = robotsTxt.includes('Sitemap:') || (robotsTxt.length > 0 && !robotsTxt.includes('Error'));
  const robotsBlocks = robotsTxt.includes('Disallow: /') && !robotsTxt.includes('Disallow: /$');

  // HTTPS
  const isHttps = url.protocol === 'https:';

  // URL length
  const fullUrl = url.href;

  // H1 text extraction (first one)
  const h1Text = h1s[0]?.replace(/<[^>]+>/g, '').trim() ?? '';

  // ── Build results ────────────────────────────────────────────────────────────
  type R = { status: string; finding: string };
  const r: Record<string, R> = {};

  // t1 – robots.txt
  if (!robotsTxt || robotsTxt.includes('Error')) {
    r.t1 = { status: 'warn', finding: 'Kon robots.txt niet ophalen — controleer manueel via /robots.txt.' };
  } else if (robotsBlocks) {
    r.t1 = { status: 'warn', finding: 'robots.txt bevat brede Disallow-regels — controleer of indexeerbare pagina\'s niet geblokkeerd worden.' };
  } else {
    r.t1 = { status: 'ok', finding: 'robots.txt aanwezig en geen kritieke blokkades gedetecteerd.' };
  }

  // t2 – sitemap
  r.t2 = sitemapOk
    ? { status: 'ok', finding: 'XML-sitemap gevonden op /sitemap.xml.' }
    : { status: 'warn', finding: 'Geen sitemap.xml gevonden — maak een XML-sitemap aan en dien in bij Google Search Console.' };

  // t3 – HTTPS
  r.t3 = isHttps
    ? { status: 'ok', finding: 'Website gebruikt HTTPS — verbinding is versleuteld.' }
    : { status: 'fail', finding: 'Website gebruikt geen HTTPS — beveilig onmiddellijk met SSL-certificaat.' };

  // t4 – canonical
  r.t4 = canonical
    ? { status: 'ok', finding: `Canonical tag aanwezig: ${canonical.slice(0, 70)}${canonical.length > 70 ? '…' : ''}` }
    : { status: 'warn', finding: 'Geen canonical tag gevonden — voeg een self-referencing canonical toe aan iedere pagina.' };

  // t5 – CWV (cannot verify without real measurement)
  r.t5 = { status: 'warn', finding: 'Core Web Vitals vereisen meting via PageSpeed Insights of Google Search Console.' };

  // t6 – mobile / viewport
  r.t6 = hasViewport
    ? { status: 'ok', finding: 'Viewport meta tag aanwezig — pagina is geconfigureerd voor mobiele weergave.' }
    : { status: 'fail', finding: 'Geen viewport meta tag — voeg <meta name="viewport" content="width=device-width, initial-scale=1"> toe.' };

  // t7 – crawl errors (check noindex)
  r.t7 = hasNoIndex
    ? { status: 'warn', finding: 'Deze pagina heeft een "noindex" robots meta tag — wordt niet geïndexeerd door Google.' }
    : { status: 'warn', finding: 'Crawlfouten vereisen verificatie via Google Search Console > Coverage.' };

  // t8 – laadtijd (cannot measure)
  r.t8 = { status: 'warn', finding: 'Laadtijd vereist meting via PageSpeed Insights of GTmetrix.' };

  // t9 – schema.org
  r.t9 = hasSchema
    ? { status: 'ok', finding: 'Gestructureerde data (JSON-LD of Microdata) gevonden op de pagina.' }
    : { status: 'warn', finding: 'Geen Schema.org gestructureerde data gevonden — voeg LocalBusiness, Article of FAQ markup toe.' };

  // t10 – redirect chains (cannot verify)
  r.t10 = { status: 'warn', finding: 'Redirect-ketens vereisen controle via Screaming Frog of een redirect-checker.' };

  // t11 – hreflang
  r.t11 = hasHreflang
    ? { status: 'ok', finding: 'Hreflang tags gevonden — meertalige configuratie aanwezig.' }
    : { status: 'na', finding: 'Geen hreflang tags — N/A als de site eentalig is.' };

  // t12 – 404 page (cannot fully verify)
  r.t12 = { status: 'warn', finding: 'Controleer manueel of de 404-pagina navigatie en een zoekmogelijkheid bevat.' };

  // o1 – title
  if (!title) {
    r.o1 = { status: 'fail', finding: 'Geen <title> tag gevonden.' };
  } else if (title.length < 30) {
    r.o1 = { status: 'warn', finding: `Title te kort (${title.length} tekens): "${title.slice(0, 60)}"` };
  } else if (title.length > 60) {
    r.o1 = { status: 'warn', finding: `Title te lang (${title.length} tekens, max 60): "${title.slice(0, 60)}…"` };
  } else {
    r.o1 = { status: 'ok', finding: `Title OK (${title.length} tekens): "${title.slice(0, 60)}"` };
  }

  // o2 – meta description
  if (!metaDesc) {
    r.o2 = { status: 'fail', finding: 'Geen meta description gevonden.' };
  } else if (metaDesc.length < 100) {
    r.o2 = { status: 'warn', finding: `Meta description te kort (${metaDesc.length} tekens, aanbevolen 130–155): "${metaDesc.slice(0, 80)}"` };
  } else if (metaDesc.length > 160) {
    r.o2 = { status: 'warn', finding: `Meta description te lang (${metaDesc.length} tekens) — wordt afgesneden in zoekresultaten.` };
  } else {
    r.o2 = { status: 'ok', finding: `Meta description OK (${metaDesc.length} tekens).` };
  }

  // o3 – H1
  if (h1s.length === 0) {
    r.o3 = { status: 'fail', finding: 'Geen H1 tag gevonden.' };
  } else if (h1s.length > 1) {
    r.o3 = { status: 'warn', finding: `${h1s.length} H1 tags gevonden — gebruik slechts één H1 per pagina.` };
  } else {
    r.o3 = { status: 'ok', finding: `Één H1 gevonden${h1Text ? ': "' + h1Text.slice(0, 60) + '"' : ''}.` };
  }

  // o4 – heading hierarchy
  if (h1s.length > 0 && h2s.length === 0) {
    r.o4 = { status: 'warn', finding: 'Geen H2 tags gevonden — voeg subheadings toe voor contentstructuur.' };
  } else if (h3s.length > 0 && h2s.length === 0) {
    r.o4 = { status: 'warn', finding: 'H3 zonder H2 gedetecteerd — inconsistente heading-hiërarchie.' };
  } else {
    r.o4 = { status: 'ok', finding: `Heading-structuur: ${h1s.length}× H1, ${h2s.length}× H2, ${h3s.length}× H3.` };
  }

  // o5 – keyword in first 100 words (heuristic)
  r.o5 = { status: 'warn', finding: 'Controleer manueel of het primaire zoekwoord in de eerste 100 woorden staat.' };

  // o6 – alt texts
  if (allImgs.length === 0) {
    r.o6 = { status: 'warn', finding: 'Geen afbeeldingen gevonden op de pagina.' };
  } else if (imgsNoAlt === 0) {
    r.o6 = { status: 'ok', finding: `Alle ${allImgs.length} afbeeldingen hebben een alt-attribuut.` };
  } else {
    r.o6 = { status: 'fail', finding: `${imgsNoAlt} van de ${allImgs.length} afbeeldingen hebben geen alt-tekst.` };
  }

  // o7 – internal links (heuristic: check if links exist)
  const internalLinks = (html.match(/<a[^>]+href=["']\/[^"']*["']/gi) || []).length +
                        (html.match(new RegExp(`<a[^>]+href=["'][^"']*${url.hostname}[^"']*["']`, 'gi'), ) || []).length;
  r.o7 = internalLinks > 3
    ? { status: 'ok', finding: `Minimaal ${internalLinks} interne links gedetecteerd.` }
    : { status: 'warn', finding: 'Weinig interne links gevonden — verbeter interne linkstructuur.' };

  // o8 – orphan pages (cannot detect without full crawl)
  r.o8 = { status: 'warn', finding: 'Orphan pages vereisen een volledige crawl via Screaming Frog.' };

  // o9 – URL structure
  const pathLen = url.pathname.length;
  const hasUnderscore = url.pathname.includes('_');
  const depth = url.pathname.split('/').filter(Boolean).length;
  if (hasUnderscore) {
    r.o9 = { status: 'warn', finding: 'URL bevat underscores — gebruik koppeltekens (hyphens) voor betere SEO.' };
  } else if (pathLen > 80) {
    r.o9 = { status: 'warn', finding: `URL is lang (${pathLen} tekens) — houd paden kort en beschrijvend.` };
  } else if (depth > 4) {
    r.o9 = { status: 'warn', finding: `URL is ${depth} niveaus diep — houd diepte beperkt tot max 3–4 niveaus.` };
  } else {
    r.o9 = { status: 'ok', finding: `URL-structuur OK: ${url.pathname || '/'} (${pathLen} tekens, ${depth} niveaus).` };
  }

  // o10 – OG / Twitter
  const ogScore = [ogTitle, ogDesc, ogImage].filter(Boolean).length;
  if (ogScore === 3 && twCard) {
    r.o10 = { status: 'ok', finding: 'Open Graph (title, description, image) en Twitter Card tags aanwezig.' };
  } else if (ogScore >= 1) {
    r.o10 = { status: 'warn', finding: `Gedeeltelijke social tags: og:image ${ogImage ? '✓' : '✗'} · twitter:card ${twCard ? '✓' : '✗'}.` };
  } else {
    r.o10 = { status: 'fail', finding: 'Geen Open Graph of Twitter Card tags gevonden.' };
  }

  // Content, off-page, local, UX — cannot verify by fetching HTML
  const manual = (finding: string): R => ({ status: 'warn', finding });
  r.c1  = manual('Zoekwoordenonderzoek vereist manuele verificatie via Ahrefs, Semrush of Google Keyword Planner.');
  r.c2  = manual('Zoekintentie-match vereist vergelijking met de top-3 SERP-resultaten voor het doelzoekwoord.');
  r.c3  = manual('Duplicate content vereist controle via Copyscape of Siteliner.');
  r.c4  = manual('Contentdiepgang vergelijken met concurrenten via handmatige analyse.');
  r.c5  = manual('LSI-zoekwoorden vereisen manueel onderzoek via "Gerelateerde zoekopdrachten" en People Also Ask.');
  r.c6  = manual('Blogactiviteit controleren — minstens 2× per maand publiceren voor competitieve niches.');
  r.c7  = manual(`${allImgs.length} afbeeldingen gevonden — controleer compressie en WebP-formaat via TinyPNG of Squoosh.`);
  r.c8  = manual('FAQ-sectie en FAQ Schema vereisen manuele controle.');
  r.c9  = manual('Leesbaarheid beoordelen via korte alinea\'s, subheadings en voldoende witruimte.');
  r.c10 = manual('Controleer wanneer de content voor het laatste bijgewerkt werd.');
  r.b1  = manual('Backlinkprofiel analyseren via Ahrefs, Semrush of Moz Link Explorer.');
  r.b2  = manual('Toxische backlinks identificeren via Ahrefs of Google Search Console.');
  r.b3  = manual('Ankertekstverdeling controleren via een backlink-analysetool.');
  r.b4  = manual('Vermeldingen in relevante directories (Gouden Gids, Yelp) controleren.');
  r.b5  = manual('Concurrentie-backlinkanalyse uitvoeren via Ahrefs Link Intersect.');
  r.b6  = manual('Social media profielen controleren op activiteit en link naar website.');
  r.l1  = manual('Google Business Profile manueel verifiëren via business.google.com.');
  r.l2  = manual('NAP-consistentie controleren over website, GBP en alle directories.');
  r.l3  = manual('Google reviews en reacties controleren via Google Business Profile.');
  r.l4  = manual('Lokale zoekwoorden (gemeente en regio) controleren in titles en H1.');
  r.l5  = manual('LocalBusiness Schema controleren via Google\'s Rich Results Test.');
  r.l6  = manual('GBP posts controleren — aanbevolen: wekelijks een post publiceren.');
  r.l7  = manual('Vermeldingen op Belgische directories (Gouden Gids, Pages d\'Or) controleren.');
  r.u1  = manual('CTA\'s manueel controleren op alle doelpagina\'s.');
  r.u2  = manual('Contactformulier testen op functionaliteit en mobiele gebruiksvriendelijkheid.');
  r.u3  = manual('GA4 en Search Console koppeling verifiëren via Google Tag Assistant.');
  r.u4  = manual('Conversiepaden testen op mobiel — touch targets minimaal 48×48px.');
  r.u5  = manual('Bouncepercentage analyseren via Google Analytics 4.');
  r.u6  = manual('Toegankelijkheid controleren via axe DevTools of Lighthouse Accessibility audit.');
  r.u7  = manual('Laadsnelheid op 3G meten via Chrome DevTools > Network > Slow 3G throttle.');
  r.u8  = manual('Heatmap analyse instellen via Microsoft Clarity (gratis) of Hotjar.');

  // ── Summary ──────────────────────────────────────────────────────────────────
  const fails    = Object.values(r).filter(v => v.status === 'fail').length;
  const warns    = Object.values(r).filter(v => v.status === 'warn').length;
  const oks      = Object.values(r).filter(v => v.status === 'ok').length;
  const autoChecked = oks;

  const titleStr = title ? `Title: "${title.slice(0, 50)}${title.length > 50 ? '…' : ''}"` : 'Geen title gevonden';
  const summary  = `Automatische analyse van ${url.hostname}${lang ? ` (taal: ${lang})` : ''}. ${titleStr}. `
    + `${oks} technische checks gevalideerd — ${fails} problemen en ${warns} aandachtspunten. `
    + `Content, off-page, lokale SEO en UX vereisen manuele verificatie.`;

  return { summary, results: r, autoChecked };
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  let body: { url?: string };
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: 'Ongeldig verzoek.' }, { status: 400 }); }

  const rawUrl = (body.url ?? '').trim();
  if (!rawUrl) return NextResponse.json({ error: 'URL ontbreekt.' }, { status: 400 });

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(rawUrl.startsWith('http') ? rawUrl : 'https://' + rawUrl);
  } catch {
    return NextResponse.json({ error: 'Ongeldige URL. Gebruik het formaat https://www.domein.be' }, { status: 400 });
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    return NextResponse.json({ error: 'Alleen http(s) URLs zijn toegestaan.' }, { status: 400 });
  }
  const hostname = parsedUrl.hostname.toLowerCase();
  const privatePattern = /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.|::1$|0\.0\.0\.0)/;
  if (privatePattern.test(hostname)) {
    return NextResponse.json({ error: 'Privé-netwerkadressen zijn niet toegestaan.' }, { status: 400 });
  }

  // ── Fetch page + robots.txt + sitemap in parallel ────────────────────────────
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  let html = '';
  let robotsTxt = '';
  let sitemapOk = false;

  try {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (compatible; IntrICT-SEO-Audit/1.0)',
      'Accept': 'text/html,application/xhtml+xml,*/*',
    };

    const [pageRes, robotsRes, sitemapRes] = await Promise.allSettled([
      fetch(parsedUrl.href, { headers, signal: controller.signal }),
      fetch(`${parsedUrl.origin}/robots.txt`, { headers, signal: controller.signal }),
      fetch(`${parsedUrl.origin}/sitemap.xml`, { headers, signal: controller.signal }),
    ]);

    if (pageRes.status === 'fulfilled' && pageRes.value.ok) {
      html = await pageRes.value.text();
    } else {
      clearTimeout(timeout);
      const reason = pageRes.status === 'rejected' ? String(pageRes.reason) : `HTTP ${(pageRes.value as Response).status}`;
      return NextResponse.json({ error: `Kon de website niet ophalen (${reason}). Controleer of de URL correct en publiek bereikbaar is.` }, { status: 400 });
    }

    if (robotsRes.status === 'fulfilled' && robotsRes.value.ok) {
      robotsTxt = await robotsRes.value.text();
    }
    if (sitemapRes.status === 'fulfilled' && sitemapRes.value.ok) {
      const sitemapText = await sitemapRes.value.text();
      sitemapOk = sitemapText.includes('<?xml') || sitemapText.includes('<urlset') || sitemapText.includes('<sitemapindex');
    }
  } catch (e) {
    clearTimeout(timeout);
    return NextResponse.json({ error: 'Verzoek verlopen of networkfout: ' + String(e) }, { status: 400 });
  }

  clearTimeout(timeout);

  const result = analyzeHtml(html, parsedUrl, robotsTxt, sitemapOk);
  return NextResponse.json(result);
}
