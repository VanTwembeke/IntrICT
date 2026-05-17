import { BlogPost } from '@/lib/blog-api';

export const blogPost: BlogPost = {
  id: '11',
  title: 'De beveiligingschecklist voor AI en webdesign: 35 kritieke punten (2026)',
  excerpt: 'NIS2, GDPR, kwetsbare API-endpoints en AI-risico\'s: een concrete checklist met audittips, codeeropdrachten en protocollen om je website en codebase te beschermen in 2026.',
  content: `# De beveiligingschecklist voor AI en webdesign: 35 kritieke punten (2026)

Elke 2 seconden vindt er ergens ter wereld een ransomware-aanval plaats. In de Benelux bedragen de gemiddelde kosten van één datalek 6,24 miljoen dollar — en dat is voor bedrijven die er al van herstelden. Voor een KMO is dat simpelweg faillissement.

Tegelijk zijn er in België meer dan 2.400 bedrijven die nu al onder NIS2 vallen en zich moeten verantwoorden als ze geen sluitende beveiligingsmaatregelen hebben. GDPR staat al langer op de radar, maar de handhaving wordt strenger: Europese toezichthouders beginnen tegenwoordig met geautomatiseerde scans van je website voordat ze ook maar een e-mail sturen.

Als je een website runt, AI-tools integreert of API-koppelingen hebt — en dat heeft bijna elke professionele website vandaag — dan loopt je bedrijf risico als je beveiliging niet op orde is. Deze checklist geeft je 35 concrete punten om je codebase, je API-toegangen en je webplatform te controleren. Inclusief de commando's en prompts die je daarvoor nodig hebt.

## Waarom dit nu urgenter is dan ooit voor Belgische KMO's

De cijfers liegen er niet om. Belgische KMO's lopen meer risico dan ze denken:

- 27% van de KMO's werd het afgelopen jaar getroffen door ransomware
- 80% van die bedrijven betaalde het losgeld — gemiddeld tienduizenden euro's
- AI-gerelateerde aanvallen stegen het afgelopen jaar met bijna 490%
- 56% van de AI-modellen die onderzoekers testten, waren kwetsbaar voor zogenaamde prompt injection-aanvallen
- Meer dan 60% van de web-apps die AI integreren, heeft onbeveiligde API-endpoints

NIS2 verplicht bedrijven in 18 kritieke sectoren om incidenten binnen 24 uur te melden. Bij overtreding: boetes tot 10 miljoen euro of 2% van de wereldwijde omzet. Bestuurders kunnen persoonlijk aansprakelijk worden gesteld.

De drempel om iets te doen is laag. Zelfs een halve dag werk op de juiste plaatsen kan het verschil maken.

## Categorie 1: Security headers — de eerste verdedigingslinie

Meer dan 95% van de websites faalt bij een security header check. Dat is geen overdrijving: minder dan 10% heeft alle vier de kritieke headers correct ingesteld. En toch kost het implementeren ervan minder dan een uur.

Controleer of jouw website deze headers verstuurt:

- Content-Security-Policy (CSP) aanwezig en restrictief geconfigureerd
- Strict-Transport-Security (HSTS) met minimaal 1 jaar max-age
- X-Frame-Options ingesteld op DENY of SAMEORIGIN
- Permissions-Policy aanwezig en ongebruikte features geblokkeerd
- Referrer-Policy ingesteld op strict-origin-when-cross-origin of strenger
- X-Content-Type-Options ingesteld op nosniff

Hoe check je dit snel?

\`\`\`bash
curl -I https://jouwwebsite.be | grep -i "content-security\|strict-transport\|x-frame\|permissions\|referrer\|x-content"
\`\`\`

Of gebruik de gratis tool van securityheaders.com (geen link, maar de naam is zelfsprekend). Een score van A of hoger is het minimum.

In Next.js configureer je deze in next.config.ts via de headers() functie. Als je die nog niet ingesteld hebt, is dit je eerste prioriteit.

## Categorie 2: API-beveiliging en toegangscontrole

API's zijn de zwakste schakel in de meeste moderne webapplicaties. Ze zijn krachtig, maar elke endpoint die je openzet, is een potentieel inbraakpunt.

Controleer elk van deze punten voor al je API-routes:

- Elke endpoint vereist authenticatie — geen enkele publieke route geeft gevoelige data terug
- JWT-tokens hebben een korte levensduur (maximum 15 minuten voor access tokens)
- Refresh tokens staan in HTTP-only, Secure, SameSite cookies — nooit in localStorage
- Rate limiting is actief op alle endpoints, met de strengste limieten op login en registratie
- CORS is geconfigureerd met expliciete whitelists — geen wildcard (*)
- API-sleutels staan nooit in de frontend-code of in een publieke repository
- Alle inkomende data wordt gevalideerd met een schema-validator zoals Zod
- SQL queries gebruiken geparametriseerde statements of een ORM — nooit string concatenatie
- Foutmeldingen geven geen interne stacktraces of databasestructuur terug aan de client

Een snelle audit van je environment variables:

\`\`\`bash
# Zoek naar hardcoded secrets in je codebase
grep -r "api_key\|secret\|password\|token" --include="*.ts" --include="*.tsx" --include="*.js" src/ | grep -v ".env" | grep -v "node_modules"
\`\`\`

\`\`\`bash
# Controleer of secrets per ongeluk in git history staan
git log --all --full-history --oneline -- .env
git grep -i "secret\|api_key\|password" $(git rev-list --all)
\`\`\`

Als die laatste commando's iets opleveren, heb je een acuut probleem. Secrets die ooit in git stonden, moeten onmiddellijk geroteerd worden — zelfs als je ze eruit verwijderd hebt.

## Categorie 3: Codebase-audit — structurele kwetsbaarheden opsporen

Dit is waar de meeste teams de mist ingaan: ze bouwen functionaliteit maar laten structurele veiligheidsproblemen sluimeren. Gebruik deze prompts en commando's om je eigen codebase te analyseren.

Dependency audit:

\`\`\`bash
npm audit
npm audit --audit-level=high
\`\`\`

\`\`\`bash
# Verouderde packages met bekende kwetsbaarheden
npx npm-check-updates --doctor
\`\`\`

Hardcoded gevoelige waarden:

\`\`\`bash
# Zoek naar API-endpoints die hardcoded zijn
grep -rn "fetch\|axios\|http" src/ --include="*.ts" --include="*.tsx" | grep "http://"
\`\`\`

\`\`\`bash
# Zoek naar console.log met mogelijke gevoelige data
grep -rn "console.log\|console.error" src/ --include="*.ts" --include="*.tsx" | grep -i "user\|token\|key\|password\|secret"
\`\`\`

OWASP Top 10 checks voor je codebase (2025-versie):

- Broken Access Control: controleer elke server-side route op expliciete rolchecks
- Security Misconfiguration: geen standaardwachtwoorden, geen debug-modus in productie
- Supply Chain kwetsbaarheden: gebruik een tool als Snyk of npm audit voor dependencies
- Cryptografische fouten: gebruik nooit MD5 of SHA1 voor wachtwoorden — alleen bcrypt of argon2
- Injection: gebruik nooit string-interpolatie voor queries of shell-commando's
- Gebrekkige foutafhandeling: zorg dat onverwachte fouten geen stacktraces lekken

Prompt voor een AI-geassisteerde codeaudit (te gebruiken in je eigen AI-tool):

"Analyseer de volgende API-route op beveiligingsproblemen: controleer op ontbrekende authenticatiechecks, onbeveiligde datareturn, ontbrekende inputvalidatie en potentiële injection-kwetsbaarheden. Geef concrete suggesties per probleem."

Plak daarna de code van je API-routes erbij. Dit geeft je in minuten een eerste scan die uren handmatig werk vervangt.

## Categorie 4: AI-specifieke veiligheidsrisico's

AI-integraties brengen nieuwe aanvalsvectoren mee die de meeste developers nog niet kennen.

- Prompt injection: valideer altijd gebruikersinput voordat je die naar een AI-model stuurt — nooit direct doorsturen
- Oversharing: stel AI-modellen zo in dat ze geen systeemdocumentatie of interne configuratie kunnen weergeven
- API-sleutelbeheer: AI-provider sleutels (OpenAI, Anthropic, etc.) behoren nooit in de frontend te zitten
- Onbeperkte toegang: beperk welke data je AI-component kan opvragen — principle of least privilege
- Geen logging van AI-uitwisseling: log prompts en antwoorden zodat je aanvallen achteraf kunt traceren
- Regelmatige modelupdates: verouderde AI-modellen hebben bekende kwetsbaarheden net zoals software

Meer dan 20% van de bestanden die werknemers uploaden naar AI-tools bevatten gevoelige bedrijfsdata. Stel een duidelijk beleid op voor welke informatie medewerkers mogen delen met externe AI-diensten.

## Categorie 5: NIS2 en GDPR compliance

Dit is geen juridische checklist, maar een technische. De wetgeving vertaalt zich naar concrete maatregelen:

- Documenteer alle datastromen: welke data verwerk je, waar staat die, wie heeft toegang?
- Implementeer encryptie in rust en in transit — HTTPS is het minimum, versleutel ook gevoelige database-velden
- Voer toegangsbeheer op basis van rollen in — niet iedereen mag alles zien
- Activeer audit logging voor alle gevoelige acties (wie logt in, wie wijzigt data, wie exporteert)
- Test je incidentresponsplan — weet je hoe je binnen 24 uur een inbreuk meldt aan de toezichthouder?
- Voer minstens jaarlijks een penetratietest uit
- Stel een Data Processing Agreement (DPA) op met alle externe verwerkers (inclusief je hosting, AI-providers, analytics)

GDPR artikel 32 verplicht je om passende technische maatregelen te nemen. Dat is geen vage verplichting: het betekent encryptie, toegangscontrole en regelmatige tests. Geen excuses voor "dat hebben we nooit zo gedaan".

## Scoringsoverzicht: waar sta je?

| Categorie | Max punten | Jouw score | Status |
|-----------|-----------|-----------|--------|
| Security headers | 6 | — | — |
| API-beveiliging | 9 | — | — |
| Codebase-audit | 6 | — | — |
| AI-specifieke risico's | 6 | — | — |
| NIS2/GDPR compliance | 6 | — | — |
| Totaal | 33 | — | — |

| Totaalscore | Status | Aangeraden actie |
|-------------|--------|-----------------|
| 28–33 | Goed beveiligd | Kwartaallijkse audit inplannen |
| 20–27 | Matig beveiligd | Prioriteitenlijst opstellen, start deze week |
| 10–19 | Kwetsbaar | Externe audit aanvragen, directe actie vereist |
| 0–9 | Kritiek risico | Stop nieuwe features, fix beveiliging eerst |

## De impact: wat staat er werkelijk op het spel?

Een datalek treft niet alleen jou. Het raakt je klanten, je reputatie en je aansprakelijkheid.

Voor jou als bedrijf:
- Boetes: GDPR tot €20 miljoen of 4% van de omzet, NIS2 tot €10 miljoen of 2%
- Herstelkosten: gemiddeld 277 dagen om een inbreuk te identificeren en in te dammen
- Downtime en omzetverlies tijdens herstel

Voor je klanten:
- Hun persoonsgegevens zijn gelekt — vertrouwen breekt en herstellet zich moeilijk
- Ze kunnen GDPR-schadevergoeding eisen als er nalatigheid bewezen is

Voor de Europese regelgeving:
- NIS2 maakt bedrijven in kritieke sectoren persoonlijk aansprakelijk op bestuursniveau
- Toezichthouders voeren nu proactief geautomatiseerde scans uit — je hoeft geen klacht te hebben om op de radar te komen

De ironie? De technische basis — security headers, API-validatie, npm audit — kost een halve dag werk. Het zijn geen maanden durende projecten. De meeste kwetsbaarheden die aanvallers uitbuiten, zijn het gevolg van simpele vergissingen die niemand ooit controleerde.

## Conclusie

Beveiliging is geen eenmalig project maar een doorlopende praktijk. Begin vandaag met de basischeck: run npm audit, controleer je security headers en loop de API-routes na. Dat zijn drie stappen die je deze namiddag kunt zetten.

Als je wil dat iemand meekijkt naar de beveiliging van je website of webapplicatie — de technische opzet, de API-toegangen, de GDPR-compliancy of de NIS2-readiness — dan doe ik dat graag. Contacteer ons voor een vrijblijvend gesprek.

## FAQ

### Wat is NIS2 en geldt het voor mijn bedrijf?

NIS2 is een Europese richtlijn die organisaties in 18 kritieke sectoren (energie, gezondheidszorg, transport, digitale infrastructuur, enzovoort) verplicht om ernstige beveiligingsmaatregelen te nemen en incidenten binnen 24 uur te melden. In België vallen meer dan 2.400 entiteiten onder de wet. De eerste stap is nagaan of jouw sector of bedrijfsgrootte in scope valt — de Belgische toezichthouder CCN heeft hiervoor een zelfcheck.

### Hoe controleer ik of mijn API-endpoints beveiligd zijn?

Begin met een manuele review van elke route: is er authenticatie vereist? Wat geeft de route terug als je geen geldige token meestuurt? Gebruik daarna tools zoals OWASP ZAP of Burp Suite Community Edition voor een basisdynamische scan. Kijk ook of je rate limiting actief is op alle endpoints, en of CORS restricties correct ingesteld zijn.

### Wat is prompt injection en hoe bescherm ik me ertegen?

Prompt injection is een aanval waarbij een gebruiker schadelijke instructies insluist in de input die naar een AI-model gestuurd wordt, zodat het model onbedoeld gedrag vertoont. Bescherming: saniteer en beperk altijd de gebruikersinput voor je die doorstuurt naar een AI-API, stel duidelijke systeeminstructies in, en geef het model nooit toegang tot gevoelige systeeminformatie die je niet wil lekken.

### Wat zijn de boetes bij een GDPR-overtreding in 2026?

GDPR kent twee boetecategorieën: tot 10 miljoen euro of 2% van de wereldwijde jaaromzet voor technische overtredingen, en tot 20 miljoen euro of 4% voor de zwaarste overtredingen zoals het niet respecteren van gebruikersrechten of het verwerken van data zonder rechtsgrond. Europese toezichthouders voeren in 2026 steeds vaker proactieve geautomatiseerde website-audits uit.

### Moet ik een penetratietest laten uitvoeren?

NIS2 verplicht organisaties in scope om hun beveiliging regelmatig te testen. Voor KMO's buiten NIS2-scope is het niet wettelijk verplicht, maar wel sterk aangeraden. Een jaarlijkse pentest — zelfs een basistesting van de meest kritieke systemen — geeft je inzicht in echte kwetsbaarheden die geautomatiseerde tools missen.

### Welke gratis tools kan ik gebruiken voor een snelle beveiligingsscan?

Er zijn meerdere gratis opties: npm audit (dependencies), securityheaders.com (HTTP headers), Mozilla Observatory (combinatie van headers en configuratie), OWASP ZAP Community Edition (dynamische API-scan) en Semgrep CE (statische codeanalyse). Een combinatie van deze vier geeft je al een solide basisoverzicht van je veiligheidsstatus.
`,
  author: 'Jonas',
  publishedAt: '2026-05-17',
  updatedAt: '2026-05-17',
  category: 'Security',
  tags: ['Security', 'AI', 'Web Development', 'NIS2', 'GDPR', 'API'],
  image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
  slug: 'ai-webdesign-veiligheid-protocollen-checklist',
  readTime: 11,
  lang: 'nl',
  translationSlug: 'ai-web-security-protocols-checklist',
};
