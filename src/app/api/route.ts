import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function jsonError(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status });
}

function paginate<T>(items: T[], page: number, limit: number) {
  const total = items.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  return {
    data: items.slice(start, start + limit),
    pagination: { page, limit, total, totalPages },
  };
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

// ─── GET handler ──────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const test = searchParams.get('test');

  if (test === 'echo') {
    const message = searchParams.get('message') ?? 'Hello, World!';
    return NextResponse.json({
      success: true,
      test: 'echo',
      message,
      reversed: message.split('').reverse().join(''),
      length: message.length,
      timestamp: new Date().toISOString(),
    });
  }

  if (test === 'status') {
    return NextResponse.json({
      success: true,
      test: 'status',
      status: 'online',
      version: '1.0.0',
      runtime: 'edge',
      timestamp: new Date().toISOString(),
    });
  }

  if (test === 'headers') {
    const headers: Record<string, string> = {};
    req.headers.forEach((value, key) => { headers[key] = value; });
    return NextResponse.json({ success: true, test: 'headers', headers, timestamp: new Date().toISOString() });
  }

  if (test === 'projects') {
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const limit = Math.min(10, Math.max(1, parseInt(searchParams.get('limit') ?? '3', 10)));
    const status = searchParams.get('status');
    const tech = searchParams.get('tech');

    let filtered = [...MOCK_PROJECTS];
    if (status) filtered = filtered.filter((p) => p.status === status);
    if (tech) filtered = filtered.filter((p) =>
      p.tech.some((t) => t.toLowerCase().includes(tech.toLowerCase()))
    );

    const result = paginate(filtered, page, limit);
    return NextResponse.json({ success: true, test: 'projects', ...result, timestamp: new Date().toISOString() });
  }

  if (test === 'projects-stats') {
    const byStatus = MOCK_PROJECTS.reduce<Record<string, number>>((acc, p) => {
      acc[p.status] = (acc[p.status] ?? 0) + 1;
      return acc;
    }, {});
    const allTech = MOCK_PROJECTS.flatMap((p) => p.tech);
    const techFrequency = allTech.reduce<Record<string, number>>((acc, t) => {
      acc[t] = (acc[t] ?? 0) + 1;
      return acc;
    }, {});
    const topTech = Object.entries(techFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    return NextResponse.json({
      success: true,
      test: 'projects-stats',
      total: MOCK_PROJECTS.length,
      byStatus,
      topTech,
      years: [...new Set(MOCK_PROJECTS.map((p) => p.year))].sort(),
      timestamp: new Date().toISOString(),
    });
  }

  if (test === 'skills') {
    const category = searchParams.get('category');
    const data = category
      ? MOCK_SKILLS.filter((s) => s.category.toLowerCase() === category.toLowerCase())
      : MOCK_SKILLS;
    if (category && data.length === 0) return jsonError(`Category "${category}" not found.`, 404);
    return NextResponse.json({ success: true, test: 'skills', categories: data.length, data, timestamp: new Date().toISOString() });
  }

  if (test === 'fibonacci') {
    const n = Math.min(40, Math.max(1, parseInt(searchParams.get('n') ?? '10', 10)));
    const sequence: number[] = [];
    for (let i = 0; i < n; i++) {
      sequence.push(i <= 1 ? i : sequence[i - 1] + sequence[i - 2]);
    }
    return NextResponse.json({ success: true, test: 'fibonacci', n, sequence, sum: sequence.reduce((a, b) => a + b, 0), timestamp: new Date().toISOString() });
  }

  if (test === 'hash') {
    const input = searchParams.get('input') ?? 'hello';
    let hash = 2166136261;
    for (let i = 0; i < input.length; i++) {
      hash ^= input.charCodeAt(i);
      hash = (hash * 16777619) >>> 0;
    }
    return NextResponse.json({
      success: true,
      test: 'hash',
      input,
      algorithm: 'FNV-1a 32-bit',
      decimal: hash,
      hex: `0x${hash.toString(16).padStart(8, '0')}`,
      binary: hash.toString(2).padStart(32, '0'),
      timestamp: new Date().toISOString(),
    });
  }

  return NextResponse.json({
    success: true,
    name: 'Portfolio API',
    version: '1.0.0',
    endpoints: {
      'GET /api': 'This info page',
      'GET /api?test=status': 'Server health check',
      'GET /api?test=echo&message=hello': 'Echo + reverse a message',
      'GET /api?test=headers': 'Inspect request headers',
      'GET /api?test=projects': 'Paginated projects (page, limit, status, tech)',
      'GET /api?test=projects-stats': 'Aggregated project statistics',
      'GET /api?test=skills': 'Skill categories (optional: category)',
      'GET /api?test=fibonacci&n=10': 'Fibonacci sequence (max n=40)',
      'GET /api?test=hash&input=hello': 'FNV-1a 32-bit hash of a string',
      'POST /api': 'Echo + inspect a JSON body',
      'POST /api?action=validate': 'Validate a contact form payload',
      'POST /api?action=transform': 'Batch-transform strings (operation: uppercase|lowercase|reverse|slugify|wordcount)',
    },
    timestamp: new Date().toISOString(),
  });
}

// ─── POST handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return jsonError('Invalid JSON in request body.', 400);
  }

  if (action === 'validate') {
    const errors: string[] = [];
    const { name, email, message } = body as { name?: string; email?: string; message?: string };

    if (!name || String(name).trim().length < 2) errors.push('name: must be at least 2 characters');
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) errors.push('email: invalid format');
    if (!message || String(message).trim().length < 10) errors.push('message: must be at least 10 characters');

    if (errors.length > 0) {
      return NextResponse.json({ success: false, action: 'validate', valid: false, errors }, { status: 422 });
    }
    return NextResponse.json({
      success: true,
      action: 'validate',
      valid: true,
      sanitized: {
        name: String(name).trim(),
        email: String(email).toLowerCase().trim(),
        message: String(message).trim(),
      },
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
      success: true,
      action: 'transform',
      operation: op,
      input: strings,
      output: strings.map((s) => transform(String(s))),
      count: strings.length,
      timestamp: new Date().toISOString(),
    });
  }

  return NextResponse.json({
    success: true,
    action: 'echo',
    received: body,
    meta: {
      keys: Object.keys(body),
      size: JSON.stringify(body).length,
      types: Object.fromEntries(Object.entries(body).map(([k, v]) => [k, Array.isArray(v) ? 'array' : typeof v])),
    },
    message: 'POST request received and processed successfully.',
    timestamp: new Date().toISOString(),
  });
}