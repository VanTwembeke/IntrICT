import { BlogPost } from '@/lib/blog-api';

export const blogPost: BlogPost = {
  id: '11-en',
  title: 'The AI and Web Design Security Checklist: 35 Critical Points (2026)',
  excerpt: 'NIS2, GDPR, vulnerable API endpoints and AI risks: a concrete checklist with audit commands, code prompts and protocols to protect your website and codebase in 2026.',
  content: `# The AI and Web Design Security Checklist: 35 Critical Points (2026)

Every 2 seconds, a ransomware attack occurs somewhere in the world. In the Benelux region, the average cost of a single data breach is $6.24 million — and that's for companies that actually recovered. For a small or medium business, that figure often means bankruptcy.

At the same time, over 2,400 Belgian companies now fall under NIS2 and must demonstrate adequate security measures. GDPR enforcement has been in place for years, but scrutiny is intensifying: European regulators increasingly start with automated scans of your website before sending any emails.

If you run a website, integrate AI tools, or use API connections — and almost every professional website does today — your business is at risk if your security isn't in order. This checklist gives you 35 concrete points to audit your codebase, API access, and web platform. Including the commands and prompts you need to do it.

## Why This Is More Urgent Than Ever for Belgian SMEs

The numbers speak for themselves:

- 27% of SMEs were hit by ransomware in the past year
- 80% of those companies paid the ransom — often tens of thousands of euros
- AI-related attacks increased by nearly 490% year-over-year
- 56% of AI models tested by researchers were vulnerable to prompt injection attacks
- More than 60% of web apps integrating AI have unsecured API endpoints

NIS2 requires companies in 18 critical sectors to report incidents within 24 hours. Non-compliance: fines up to €10 million or 2% of global revenue. Board members can be held personally liable.

The barrier to action is low. Even half a day of work in the right places can make the difference.

## Category 1: Security Headers — The First Line of Defence

More than 95% of websites fail a security header check. That's not an exaggeration: fewer than 10% have all four critical headers correctly configured. Yet implementing them takes less than an hour.

Check whether your website sends these headers:

- Content-Security-Policy (CSP) present and configured restrictively
- Strict-Transport-Security (HSTS) with at least 1 year max-age
- X-Frame-Options set to DENY or SAMEORIGIN
- Permissions-Policy present with unused features blocked
- Referrer-Policy set to strict-origin-when-cross-origin or stricter
- X-Content-Type-Options set to nosniff

How to check this quickly?

\`\`\`bash
curl -I https://yourwebsite.com | grep -i "content-security\|strict-transport\|x-frame\|permissions\|referrer\|x-content"
\`\`\`

Or use the free tool securityheaders.com. An A grade or higher is the minimum to aim for.

In Next.js, configure these in next.config.ts via the headers() function. If you haven't set this up yet, this is your first priority.

## Category 2: API Security and Access Control

APIs are the weakest link in most modern web applications. They're powerful, but every endpoint you expose is a potential entry point for attackers.

Check each of these points for all your API routes:

- Every endpoint requires authentication — no public route returns sensitive data
- JWT tokens have a short lifespan (maximum 15 minutes for access tokens)
- Refresh tokens live in HTTP-only, Secure, SameSite cookies — never in localStorage
- Rate limiting is active on all endpoints, with the strictest limits on login and registration
- CORS is configured with explicit whitelists — no wildcard (*)
- API keys never appear in frontend code or public repositories
- All incoming data is validated with a schema validator like Zod
- SQL queries use parameterised statements or an ORM — never string concatenation
- Error messages don't return internal stack traces or database structure to the client

A quick audit of your environment variables:

\`\`\`bash
# Search for hardcoded secrets in your codebase
grep -r "api_key\|secret\|password\|token" --include="*.ts" --include="*.tsx" --include="*.js" src/ | grep -v ".env" | grep -v "node_modules"
\`\`\`

\`\`\`bash
# Check whether secrets were accidentally committed to git history
git log --all --full-history --oneline -- .env
git grep -i "secret\|api_key\|password" $(git rev-list --all)
\`\`\`

If those last commands return anything, you have an immediate problem. Secrets that ever appeared in git must be rotated immediately — even if you've removed them from the current codebase.

## Category 3: Codebase Audit — Finding Structural Vulnerabilities

This is where most teams go wrong: they ship features but leave structural security issues dormant. Use these prompts and commands to analyse your own codebase.

Dependency audit:

\`\`\`bash
npm audit
npm audit --audit-level=high
\`\`\`

\`\`\`bash
# Outdated packages with known vulnerabilities
npx npm-check-updates --doctor
\`\`\`

Hardcoded sensitive values:

\`\`\`bash
# Find hardcoded API endpoints
grep -rn "fetch\|axios\|http" src/ --include="*.ts" --include="*.tsx" | grep "http://"
\`\`\`

\`\`\`bash
# Find console.log statements with potentially sensitive data
grep -rn "console.log\|console.error" src/ --include="*.ts" --include="*.tsx" | grep -i "user\|token\|key\|password\|secret"
\`\`\`

OWASP Top 10 checks for your codebase (2025 edition):

- Broken Access Control: check every server-side route for explicit role checks
- Security Misconfiguration: no default passwords, no debug mode in production
- Supply Chain Vulnerabilities: use a tool like Snyk or npm audit for dependencies
- Cryptographic Failures: never use MD5 or SHA1 for passwords — only bcrypt or argon2
- Injection: never use string interpolation for queries or shell commands
- Poor Error Handling: ensure unexpected errors don't leak stack traces

AI-assisted code audit prompt (to use in your AI tool of choice):

"Analyse the following API route for security issues: check for missing authentication checks, unsecured data return, missing input validation, and potential injection vulnerabilities. Provide specific suggestions for each issue found."

Paste in the code from your API routes afterwards. This gives you a first scan in minutes that would otherwise take hours of manual review.

## Category 4: AI-Specific Security Risks

AI integrations introduce new attack vectors that most developers haven't encountered before.

- Prompt injection: always validate user input before sending it to an AI model — never pass through directly
- Oversharing: configure AI models so they cannot expose system documentation or internal configuration
- API key management: AI provider keys (OpenAI, Anthropic, etc.) must never appear in the frontend
- Unrestricted access: limit what data your AI component can query — apply the principle of least privilege
- No logging of AI exchanges: log prompts and responses so you can trace attacks after the fact
- Regular model updates: outdated AI models have known vulnerabilities just like any other software

More than 20% of files employees upload to AI tools contain sensitive company data. Establish a clear policy for what information staff may share with external AI services.

## Category 5: NIS2 and GDPR Compliance

This isn't a legal checklist — it's a technical one. The legislation translates into concrete measures:

- Document all data flows: what data do you process, where is it stored, who has access?
- Implement encryption at rest and in transit — HTTPS is the minimum, also encrypt sensitive database fields
- Implement role-based access control — not everyone should see everything
- Enable audit logging for all sensitive actions (who logs in, who modifies data, who exports)
- Test your incident response plan — do you know how to report a breach to the regulator within 24 hours?
- Conduct at least one penetration test per year
- Set up a Data Processing Agreement (DPA) with all external processors (including your hosting, AI providers, analytics)

GDPR Article 32 requires you to implement appropriate technical measures. That's not a vague obligation: it means encryption, access control, and regular testing. "We've never done it that way" is not an excuse.

## Scoring Overview: Where Do You Stand?

| Category | Max points | Your score | Status |
|----------|-----------|-----------|--------|
| Security headers | 6 | — | — |
| API security | 9 | — | — |
| Codebase audit | 6 | — | — |
| AI-specific risks | 6 | — | — |
| NIS2/GDPR compliance | 6 | — | — |
| Total | 33 | — | — |

| Total score | Status | Recommended action |
|-------------|--------|--------------------|
| 28–33 | Well secured | Schedule quarterly audit |
| 20–27 | Moderately secured | Create priority list, start this week |
| 10–19 | Vulnerable | Request external audit, immediate action required |
| 0–9 | Critical risk | Stop new features, fix security first |

## The Impact: What's Actually at Stake?

A data breach doesn't just affect you. It impacts your customers, your reputation and your legal liability.

For your business:
- Fines: GDPR up to €20 million or 4% of revenue, NIS2 up to €10 million or 2%
- Recovery costs: on average 277 days to identify and contain a breach
- Downtime and revenue loss during recovery

For your customers:
- Their personal data has been compromised — trust breaks and is hard to rebuild
- They can claim GDPR damages if negligence is proven

Under European regulations:
- NIS2 makes companies in critical sectors personally liable at board level
- Regulators now conduct proactive automated scans — you don't need a complaint filed to appear on their radar

The irony? The technical foundation — security headers, API validation, npm audit — costs half a day of work. These aren't month-long projects. Most vulnerabilities that attackers exploit result from simple oversights that nobody ever checked.

## Conclusion

Security is not a one-time project but an ongoing practice. Start today with the basics: run npm audit, check your security headers, and review your API routes. Those are three steps you can take this afternoon.

If you'd like someone to look at your website or web application's security — the technical setup, API access, GDPR compliance or NIS2 readiness — I'm happy to help. Get in touch for a no-obligation conversation.

## FAQ

### What is NIS2 and does it apply to my business?

NIS2 is a European directive that requires organisations in 18 critical sectors (energy, healthcare, transport, digital infrastructure, and so on) to implement robust security measures and report incidents within 24 hours. In Belgium, more than 2,400 entities fall under the law. The first step is checking whether your sector or company size is in scope — the Belgian supervisory authority CCN provides a self-assessment tool.

### How do I check whether my API endpoints are secured?

Start with a manual review of each route: is authentication required? What does the route return if you send a request without a valid token? Then use tools like OWASP ZAP or Burp Suite Community Edition for a basic dynamic scan. Also check whether rate limiting is active on all endpoints, and whether CORS restrictions are correctly configured.

### What is prompt injection and how do I protect against it?

Prompt injection is an attack where a user embeds malicious instructions in input sent to an AI model, causing the model to behave in unintended ways. Protection: always sanitise and constrain user input before forwarding it to an AI API, set clear system instructions, and never give the model access to sensitive system information you don't want exposed.

### What are the fines for GDPR violations in 2026?

GDPR has two penalty tiers: up to €10 million or 2% of global annual revenue for technical violations, and up to €20 million or 4% for the most serious violations such as failing to respect user rights or processing data without a legal basis. European regulators are increasingly conducting proactive automated website audits in 2026.

### Do I need a penetration test?

NIS2 requires in-scope organisations to regularly test their security. For SMEs outside NIS2 scope, it's not legally mandatory but strongly recommended. An annual pentest — even basic testing of the most critical systems — reveals real vulnerabilities that automated tools miss.

### Which free tools can I use for a quick security scan?

Several free options are available: npm audit (dependencies), securityheaders.com (HTTP headers), Mozilla Observatory (combination of headers and configuration), OWASP ZAP Community Edition (dynamic API scan), and Semgrep CE (static code analysis). A combination of these four already gives you a solid baseline overview of your security posture.
`,
  author: 'Jonas',
  publishedAt: '2026-05-17',
  updatedAt: '2026-05-17',
  category: 'Security',
  tags: ['Security', 'AI', 'Web Development', 'NIS2', 'GDPR', 'API'],
  image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
  slug: 'ai-web-security-protocols-checklist',
  readTime: 11,
  lang: 'en',
  translationSlug: 'ai-webdesign-veiligheid-protocollen-checklist',
};
