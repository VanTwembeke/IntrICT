import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// ─── Demo API key (hardcoded for portfolio demo purposes) ─────────────────────
// In a real project store this in an environment variable:
// process.env.API_SECRET_KEY
const DEMO_API_KEY = 'demo_sk_portfolio_2025';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function jsonError(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status });
}

function requireAuth(req: NextRequest): { ok: true } | NextResponse {
  const auth = req.headers.get('authorization') ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
  if (token !== DEMO_API_KEY) {
    return jsonError(
      'Unauthorized. Provide a valid Bearer token in the Authorization header.',
      401
    );
  }
  return { ok: true };
}

function paginate<T>(items: T[], page: number, limit: number) {
  const total = items.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  return { data: items.slice(start, start + limit), pagination: { page, limit, total, totalPages } };
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_PROJECTS = [
  { id: 1, title: 'E-commerce Platform', tech: ['Next.js', 'Stripe', 'Prisma'], status: 'live', year: 2024 },
  { id: 2, title: 'Portfolio CMS', tech: ['Next.js', 'Sanity', 'Tailwind'], status: 'live', year: 2024 },
  { id: 3, title: 'SaaS Dashboard', tech: ['React', 'TypeScript', 'Recharts'], status: 'in-progress', year: 2025 },
  { id: 4, title: 'Mobile App API', tech: ['Node.js', 'Fastify', 'PostgreSQL'], status: 'live', year: 2023 },
  { id: 5, title: 'AI Content Tool', tech: ['Next.js', 'OpenAI', 'Vercel AI SDK'], status: 'in-progress', year: 2025 },
  { id: 6, title: 'Real-time Chat', tech: ['Next.js', 'Supabase', 'WebSockets'], status: 'archived', year: 2023 },
];

const MOCK_SKILLS = [
  { category: 'Frontend', items: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion'] },
  { category: 'Backend', items: ['Node.js', 'Fastify', 'Prisma', 'PostgreSQL', 'Redis'] },
  { category: 'DevOps', items: ['Vercel', 'Docker', 'GitHub Actions', 'AWS S3'] },
  { category: 'Design', items: ['Figma', 'Adobe XD', 'Motion Design'] },
];

// Private data — only accessible with a valid API key
const MOCK_ANALYTICS = {
  pageViews: { total: 14872, last30Days: 3241, last7Days: 891 },
  topPages: [
    { path: '/', views: 5420, avgDuration: '1m 42s' },
    { path: '/portfolio', views: 3102, avgDuration: '2m 18s' },
    { path: '/api/docs', views: 1984, avgDuration: '3m 05s' },
    { path: '/contact', views: 1240, avgDuration: '0m 58s' },
  ],
  referrers: [
    { source: 'github.com', visits: 2104 },
    { source: 'linkedin.com', visits: 1543 },
    { source: 'google.com', visits: 988 },
    { source: 'direct', visits: 7211 },
  ],
  devices: { desktop: 68, mobile: 27, tablet: 5 },
};

const MOCK_MESSAGES = [
  { id: 'm1', from: 'alice@example.com', subject: 'Project inquiry', date: '2025-03-10', read: true },
  { id: 'm2', from: 'bob@example.com', subject: 'Collaboration proposal', date: '2025-03-18', read: false },
  { id: 'm3', from: 'charlie@example.com', subject: 'Freelance opportunity', date: '2025-03-22', read: false },
];

const MOCK_ENV = {
  node: 'v20.11.0',
  framework: 'Next.js 15.2',
  deployedAt: '2025-03-20T08:00:00Z',
  region: 'iad1',
  plan: 'Pro',
  buildId: 'bld_xk9q2z7',
  featureFlags: { darkMode: true, betaApi: false, maintenanceMode: false },
};

// ─── GET ──────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const test = searchParams.get('test');

  // ── Public endpoints ──────────────────────────────────────────────────────

  if (test === 'echo') {
    const message = searchParams.get('message') ?? 'Hello, World!';
    return NextResponse.json({
      success: true, test: 'echo', message,
      reversed: message.split('').reverse().join(''),
      length: message.length, timestamp: new Date().toISOString(),
    });
  }

  if (test === 'status') {
    return NextResponse.json({
      success: true, test: 'status', status: 'online',
      version: '1.0.0', runtime: 'edge', timestamp: new Date().toISOString(),
    });
  }

  if (test === 'headers') {
    const headers: Record<string, string> = {};
    req.headers.forEach((v, k) => { headers[k] = v; });
    return NextResponse.json({ success: true, test: 'headers', headers, timestamp: new Date().toISOString() });
  }

  if (test === 'projects') {
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const limit = Math.min(10, Math.max(1, parseInt(searchParams.get('limit') ?? '3', 10)));
    const status = searchParams.get('status');
    const tech = searchParams.get('tech');
    let filtered = [...MOCK_PROJECTS];
    if (status) filtered = filtered.filter((p) => p.status === status);
    if (tech) filtered = filtered.filter((p) => p.tech.some((t) => t.toLowerCase().includes(tech.toLowerCase())));
    return NextResponse.json({ success: true, test: 'projects', ...paginate(filtered, page, limit), timestamp: new Date().toISOString() });
  }

  if (test === 'projects-stats') {
    const byStatus = MOCK_PROJECTS.reduce<Record<string, number>>((acc, p) => {
      acc[p.status] = (acc[p.status] ?? 0) + 1; return acc;
    }, {});
    const freq = MOCK_PROJECTS.flatMap((p) => p.tech).reduce<Record<string, number>>((acc, t) => {
      acc[t] = (acc[t] ?? 0) + 1; return acc;
    }, {});
    const topTech = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, count }));
    return NextResponse.json({
      success: true, test: 'projects-stats',
      total: MOCK_PROJECTS.length, byStatus, topTech,
      years: [...new Set(MOCK_PROJECTS.map((p) => p.year))].sort(),
      timestamp: new Date().toISOString(),
    });
  }

  if (test === 'skills') {
    const category = searchParams.get('category');
    const data = category ? MOCK_SKILLS.filter((s) => s.category.toLowerCase() === category.toLowerCase()) : MOCK_SKILLS;
    if (category && data.length === 0) return jsonError(`Category "${category}" not found.`, 404);
    return NextResponse.json({ success: true, test: 'skills', categories: data.length, data, timestamp: new Date().toISOString() });
  }

  if (test === 'fibonacci') {
    const n = Math.min(40, Math.max(1, parseInt(searchParams.get('n') ?? '10', 10)));
    const seq: number[] = [];
    for (let i = 0; i < n; i++) seq.push(i <= 1 ? i : seq[i - 1] + seq[i - 2]);
    return NextResponse.json({ success: true, test: 'fibonacci', n, sequence: seq, sum: seq.reduce((a, b) => a + b, 0), timestamp: new Date().toISOString() });
  }

  if (test === 'hash') {
    const input = searchParams.get('input') ?? 'hello';
    let hash = 2166136261;
    for (let i = 0; i < input.length; i++) { hash ^= input.charCodeAt(i); hash = (hash * 16777619) >>> 0; }
    return NextResponse.json({
      success: true, test: 'hash', input, algorithm: 'FNV-1a 32-bit',
      decimal: hash, hex: `0x${hash.toString(16).padStart(8, '0')}`,
      binary: hash.toString(2).padStart(32, '0'), timestamp: new Date().toISOString(),
    });
  }

  // ── Authenticated endpoints ───────────────────────────────────────────────

  if (test === 'analytics') {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    return NextResponse.json({ success: true, test: 'analytics', ...MOCK_ANALYTICS, timestamp: new Date().toISOString() });
  }

  if (test === 'messages') {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    const unreadOnly = searchParams.get('unread') === 'true';
    const data = unreadOnly ? MOCK_MESSAGES.filter((m) => !m.read) : MOCK_MESSAGES;
    return NextResponse.json({
      success: true, test: 'messages',
      total: data.length, unread: data.filter((m) => !m.read).length, data,
      timestamp: new Date().toISOString(),
    });
  }

  if (test === 'env') {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    return NextResponse.json({ success: true, test: 'env', ...MOCK_ENV, timestamp: new Date().toISOString() });
  }

  // ── Default info ──────────────────────────────────────────────────────────

  return NextResponse.json({
    success: true, name: 'Portfolio API', version: '1.0.0',
    public: {
      'GET /api?test=status': 'Server health check',
      'GET /api?test=echo&message=...': 'Echo + reverse a message',
      'GET /api?test=headers': 'Inspect request headers',
      'GET /api?test=projects': 'Paginated projects (page, limit, status, tech)',
      'GET /api?test=projects-stats': 'Aggregated project statistics',
      'GET /api?test=skills': 'Skill categories (optional: category)',
      'GET /api?test=fibonacci&n=10': 'Fibonacci sequence (max n=40)',
      'GET /api?test=hash&input=hello': 'FNV-1a 32-bit hash',
      'POST /api': 'Echo + inspect a JSON body',
      'POST /api?action=validate': 'Validate a contact form payload',
      'POST /api?action=transform': 'Batch-transform strings',
    },
    authenticated: {
      'GET /api?test=analytics': 'Site analytics (requires Bearer token)',
      'GET /api?test=messages': 'Contact inbox (requires Bearer token)',
      'GET /api?test=env': 'Deployment environment info (requires Bearer token)',
      'POST /api?action=publish': 'Publish a project entry (requires Bearer token)',
    },
    timestamp: new Date().toISOString(),
  });
}

// ─── POST ─────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');

  let body: Record<string, unknown>;
  try { body = await req.json(); }
  catch { return jsonError('Invalid JSON in request body.', 400); }

  // ── Public POST ───────────────────────────────────────────────────────────

  if (action === 'validate') {
    const errors: string[] = [];
    const { name, email, message } = body as { name?: string; email?: string; message?: string };
    if (!name || String(name).trim().length < 2) errors.push('name: must be at least 2 characters');
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) errors.push('email: invalid format');
    if (!message || String(message).trim().length < 10) errors.push('message: must be at least 10 characters');
    if (errors.length > 0) return NextResponse.json({ success: false, action: 'validate', valid: false, errors }, { status: 422 });
    return NextResponse.json({
      success: true, action: 'validate', valid: true,
      sanitized: { name: String(name).trim(), email: String(email).toLowerCase().trim(), message: String(message).trim() },
      timestamp: new Date().toISOString(),
    });
  }

  if (action === 'transform') {
    const { strings, operation } = body as { strings?: unknown; operation?: string };
    if (!Array.isArray(strings)) return jsonError('`strings` must be an array of strings.', 400);
    const ops = ['uppercase', 'lowercase', 'reverse', 'slugify', 'wordcount'] as const;
    type Op = typeof ops[number];
    const op: Op = ops.includes(operation as Op) ? (operation as Op) : 'uppercase';
    const transform = (s: string): unknown => {
      switch (op) {
        case 'uppercase': return s.toUpperCase();
        case 'lowercase': return s.toLowerCase();
        case 'reverse': return s.split('').reverse().join('');
        case 'slugify': return s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        case 'wordcount': return { original: s, words: s.trim().split(/\s+/).length };
      }
    };
    return NextResponse.json({
      success: true, action: 'transform', operation: op,
      input: strings, output: strings.map((s) => transform(String(s))),
      count: strings.length, timestamp: new Date().toISOString(),
    });
  }

  // ── Authenticated POST ────────────────────────────────────────────────────

  if (action === 'publish') {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;

    const { title, tech, status, year } = body as {
      title?: string; tech?: unknown; status?: string; year?: number;
    };
    const errors: string[] = [];
    if (!title || String(title).trim().length < 3) errors.push('title: must be at least 3 characters');
    if (!Array.isArray(tech) || tech.length === 0) errors.push('tech: must be a non-empty array of strings');
    if (!['live', 'in-progress', 'archived'].includes(String(status))) errors.push('status: must be live | in-progress | archived');
    if (!year || year < 2000 || year > 2100) errors.push('year: must be a valid year (2000–2100)');

    if (errors.length > 0) return NextResponse.json({ success: false, action: 'publish', errors }, { status: 422 });

    const newProject = {
      id: MOCK_PROJECTS.length + 1,
      title: String(title).trim(),
      tech: (tech as string[]).map(String),
      status: String(status),
      year: Number(year),
    };
    // In a real app you'd persist this to a DB
    return NextResponse.json({
      success: true, action: 'publish',
      message: 'Project published successfully (demo — not persisted).',
      project: newProject, timestamp: new Date().toISOString(),
    }, { status: 201 });
  }

  // ── Default echo ──────────────────────────────────────────────────────────

  return NextResponse.json({
    success: true, action: 'echo', received: body,
    meta: {
      keys: Object.keys(body), size: JSON.stringify(body).length,
      types: Object.fromEntries(Object.entries(body).map(([k, v]) => [k, Array.isArray(v) ? 'array' : typeof v])),
    },
    message: 'POST request received and processed successfully.',
    timestamp: new Date().toISOString(),
  });
}