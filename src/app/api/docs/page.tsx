'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import BackToTop from '@/components/common/BackToTop';
import Lenis from 'lenis';

// ─── Types ────────────────────────────────────────────────────────────────────

type HttpMethod = 'GET' | 'POST';
type CodeLang = 'fetch' | 'curl' | 'axios';

interface CodeExample {
  fetch: string;
  curl: string;
  axios: string;
}

interface ApiEndpoint {
  id: string;
  label: string;
  tag: string;
  description: string;
  method: HttpMethod;
  endpoint: string;
  body?: Record<string, unknown>;
  color: string;
  icon: string;
  params?: { name: string; type: string; required: boolean; description: string }[];
  code: CodeExample;
}

interface TestResult {
  id: string;
  status: 'idle' | 'loading' | 'success' | 'error';
  statusCode?: number;
  data?: Record<string, unknown>;
  duration?: number;
}

// ─── Endpoint definitions ─────────────────────────────────────────────────────

const BASE = 'https://yoursite.vercel.app';

const ENDPOINTS: ApiEndpoint[] = [
  {
    id: 'status',
    label: 'Health Check',
    tag: 'Core',
    description: 'Returns the current server status, API version and runtime environment. Use this to verify connectivity before making other requests.',
    method: 'GET',
    endpoint: '/api?test=status',
    color: 'from-green-500 to-emerald-500',
    icon: '🟢',
    code: {
      fetch: `const res = await fetch('${BASE}/api?test=status');
const data = await res.json();
console.log(data.status); // "online"`,
      curl: `curl -X GET "${BASE}/api?test=status"`,
      axios: `import axios from 'axios';

const { data } = await axios.get('${BASE}/api?test=status');
console.log(data.status); // "online"`,
    },
  },
  {
    id: 'echo',
    label: 'Echo & Reverse',
    tag: 'Core',
    description: 'Echoes back your message, reversed string, and character count. Useful for testing connectivity and string encoding.',
    method: 'GET',
    endpoint: '/api?test=echo&message=Hello+World',
    color: 'from-blue-500 to-cyan-500',
    icon: '🔊',
    params: [
      { name: 'message', type: 'string', required: false, description: 'Any string to echo back. Defaults to "Hello, World!"' },
    ],
    code: {
      fetch: `const msg = encodeURIComponent('Hello World');
const res = await fetch(\`${BASE}/api?test=echo&message=\${msg}\`);
const data = await res.json();
console.log(data.reversed); // "dlroW olleH"`,
      curl: `curl -G "${BASE}/api" \\
  --data-urlencode "test=echo" \\
  --data-urlencode "message=Hello World"`,
      axios: `const { data } = await axios.get('${BASE}/api', {
  params: { test: 'echo', message: 'Hello World' },
});
console.log(data.reversed); // "dlroW olleH"`,
    },
  },
  {
    id: 'headers',
    label: 'Request Headers',
    tag: 'Core',
    description: 'Returns all HTTP headers that were sent with the request. Helpful for debugging proxies, auth tokens, or browser fingerprinting.',
    method: 'GET',
    endpoint: '/api?test=headers',
    color: 'from-orange-500 to-amber-500',
    icon: '🔍',
    code: {
      fetch: `const res = await fetch('${BASE}/api?test=headers', {
  headers: { 'X-Custom-Header': 'my-value' },
});
const { headers } = await res.json();
console.log(headers['x-custom-header']); // "my-value"`,
      curl: `curl -X GET "${BASE}/api?test=headers" \\
  -H "X-Custom-Header: my-value"`,
      axios: `const { data } = await axios.get('${BASE}/api?test=headers', {
  headers: { 'X-Custom-Header': 'my-value' },
});
console.log(data.headers['x-custom-header']);`,
    },
  },
  {
    id: 'projects',
    label: 'Projects List',
    tag: 'Data',
    description: 'Returns a paginated list of projects. Supports filtering by status (live, in-progress, archived) and technology stack.',
    method: 'GET',
    endpoint: '/api?test=projects&page=1&limit=3&status=live',
    color: 'from-violet-500 to-purple-500',
    icon: '📁',
    params: [
      { name: 'page', type: 'number', required: false, description: 'Page number, starts at 1' },
      { name: 'limit', type: 'number', required: false, description: 'Results per page (1–10, default 3)' },
      { name: 'status', type: 'string', required: false, description: 'Filter: live | in-progress | archived' },
      { name: 'tech', type: 'string', required: false, description: 'Filter by technology name (partial match)' },
    ],
    code: {
      fetch: `const params = new URLSearchParams({
  test: 'projects',
  page: '1',
  limit: '3',
  status: 'live',
});
const res = await fetch(\`${BASE}/api?\${params}\`);
const { data, pagination } = await res.json();
console.log(\`Page \${pagination.page} of \${pagination.totalPages}\`);`,
      curl: `curl -G "${BASE}/api" \\
  -d "test=projects" \\
  -d "page=1" \\
  -d "limit=3" \\
  -d "status=live"`,
      axios: `const { data } = await axios.get('${BASE}/api', {
  params: {
    test: 'projects',
    page: 1,
    limit: 3,
    status: 'live',
  },
});
console.log(data.pagination);`,
    },
  },
  {
    id: 'projects-stats',
    label: 'Project Statistics',
    tag: 'Data',
    description: 'Returns aggregated statistics across all projects: count by status, top technologies by usage frequency, and active years.',
    method: 'GET',
    endpoint: '/api?test=projects-stats',
    color: 'from-pink-500 to-rose-500',
    icon: '📊',
    code: {
      fetch: `const res = await fetch('${BASE}/api?test=projects-stats');
const { byStatus, topTech, total } = await res.json();
console.log(\`\${total} projects, top tech: \${topTech[0].name}\`);`,
      curl: `curl -X GET "${BASE}/api?test=projects-stats"`,
      axios: `const { data } = await axios.get('${BASE}/api', {
  params: { test: 'projects-stats' },
});
// data.topTech → [{ name: 'Next.js', count: 4 }, ...]`,
    },
  },
  {
    id: 'skills',
    label: 'Skills by Category',
    tag: 'Data',
    description: 'Returns skill categories and their items. Filter by a specific category name to narrow the response.',
    method: 'GET',
    endpoint: '/api?test=skills&category=Frontend',
    color: 'from-teal-500 to-cyan-600',
    icon: '🧠',
    params: [
      { name: 'category', type: 'string', required: false, description: 'Filter: Frontend | Backend | DevOps | Design' },
    ],
    code: {
      fetch: `const res = await fetch('${BASE}/api?test=skills&category=Frontend');
const { data } = await res.json();
console.log(data[0].items); // ['React', 'Next.js', ...]`,
      curl: `curl -G "${BASE}/api" \\
  -d "test=skills" \\
  -d "category=Frontend"`,
      axios: `const { data } = await axios.get('${BASE}/api', {
  params: { test: 'skills', category: 'Frontend' },
});
console.log(data.data[0].items);`,
    },
  },
  {
    id: 'fibonacci',
    label: 'Fibonacci Sequence',
    tag: 'Compute',
    description: 'Generates a Fibonacci sequence up to n terms (max 40), returning the full sequence and its sum. A server-side compute test.',
    method: 'GET',
    endpoint: '/api?test=fibonacci&n=15',
    color: 'from-yellow-500 to-orange-500',
    icon: '🔢',
    params: [
      { name: 'n', type: 'number', required: false, description: 'Number of terms to generate. Max 40, default 10.' },
    ],
    code: {
      fetch: `const res = await fetch('${BASE}/api?test=fibonacci&n=15');
const { sequence, sum } = await res.json();
console.log(sequence); // [0, 1, 1, 2, 3, 5, ...]
console.log(\`Sum: \${sum}\`);`,
      curl: `curl -G "${BASE}/api" \\
  -d "test=fibonacci" \\
  -d "n=15"`,
      axios: `const { data } = await axios.get('${BASE}/api', {
  params: { test: 'fibonacci', n: 15 },
});
console.log(data.sum);`,
    },
  },
  {
    id: 'hash',
    label: 'FNV-1a Hash',
    tag: 'Compute',
    description: 'Computes an FNV-1a 32-bit hash of any input string, returning decimal, hex and binary representations. Runs entirely on Edge.',
    method: 'GET',
    endpoint: '/api?test=hash&input=hello-world',
    color: 'from-slate-500 to-slate-700',
    icon: '#️⃣',
    params: [
      { name: 'input', type: 'string', required: false, description: 'String to hash. Defaults to "hello".' },
    ],
    code: {
      fetch: `const input = encodeURIComponent('hello-world');
const res = await fetch(\`${BASE}/api?test=hash&input=\${input}\`);
const { hex, decimal } = await res.json();
console.log(hex); // e.g. "0x4e4d093b"`,
      curl: `curl -G "${BASE}/api" \\
  --data-urlencode "test=hash" \\
  --data-urlencode "input=hello-world"`,
      axios: `const { data } = await axios.get('${BASE}/api', {
  params: { test: 'hash', input: 'hello-world' },
});
console.log(data.hex, data.binary);`,
    },
  },
  {
    id: 'post-echo',
    label: 'POST Echo',
    tag: 'POST',
    description: 'Send any JSON body and receive it back enriched with metadata: key names, byte size, and inferred types per field.',
    method: 'POST',
    endpoint: '/api',
    body: { username: 'john_doe', age: 28, tags: ['dev', 'design'] },
    color: 'from-indigo-500 to-blue-600',
    icon: '📤',
    code: {
      fetch: `const res = await fetch('${BASE}/api', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'john_doe',
    age: 28,
    tags: ['dev', 'design'],
  }),
});
const { received, meta } = await res.json();
console.log(meta.types); // { username: 'string', age: 'number', tags: 'array' }`,
      curl: `curl -X POST "${BASE}/api" \\
  -H "Content-Type: application/json" \\
  -d '{"username":"john_doe","age":28,"tags":["dev","design"]}'`,
      axios: `const { data } = await axios.post('${BASE}/api', {
  username: 'john_doe',
  age: 28,
  tags: ['dev', 'design'],
});
console.log(data.meta.types);`,
    },
  },
  {
    id: 'validate',
    label: 'Form Validation',
    tag: 'POST',
    description: 'Validates a contact form payload (name, email, message). Returns field-level errors on failure (422) or a sanitized object on success.',
    method: 'POST',
    endpoint: '/api?action=validate',
    body: { name: 'Jane Doe', email: 'jane@example.com', message: 'Hello, I would like to discuss a project.' },
    color: 'from-green-600 to-teal-600',
    icon: '✅',
    params: [
      { name: 'name', type: 'string', required: true, description: 'Min 2 characters' },
      { name: 'email', type: 'string', required: true, description: 'Valid email format' },
      { name: 'message', type: 'string', required: true, description: 'Min 10 characters' },
    ],
    code: {
      fetch: `const res = await fetch('${BASE}/api?action=validate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Jane Doe',
    email: 'jane@example.com',
    message: 'Hello, I would like to discuss a project.',
  }),
});
// 200 → { valid: true, sanitized: { ... } }
// 422 → { valid: false, errors: ['email: invalid format'] }
const data = await res.json();`,
      curl: `curl -X POST "${BASE}/api?action=validate" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Jane Doe",
    "email": "jane@example.com",
    "message": "Hello, I would like to discuss a project."
  }'`,
      axios: `const { data } = await axios.post(
  '${BASE}/api?action=validate',
  {
    name: 'Jane Doe',
    email: 'jane@example.com',
    message: 'Hello, I would like to discuss a project.',
  }
);
if (data.valid) console.log(data.sanitized);`,
    },
  },
  {
    id: 'transform',
    label: 'Batch Transform',
    tag: 'POST',
    description: 'Applies a string operation to every item in a "strings" array. Supports: uppercase, lowercase, reverse, slugify, wordcount.',
    method: 'POST',
    endpoint: '/api?action=transform',
    body: { strings: ['Hello World', 'Next.js is great', 'API Testing'], operation: 'slugify' },
    color: 'from-fuchsia-500 to-pink-600',
    icon: '⚙️',
    params: [
      { name: 'strings', type: 'string[]', required: true, description: 'Array of strings to transform' },
      { name: 'operation', type: 'string', required: false, description: 'uppercase | lowercase | reverse | slugify | wordcount' },
    ],
    code: {
      fetch: `const res = await fetch('${BASE}/api?action=transform', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    strings: ['Hello World', 'Next.js is great'],
    operation: 'slugify',
  }),
});
const { output } = await res.json();
console.log(output); // ['hello-world', 'nextjs-is-great']`,
      curl: `curl -X POST "${BASE}/api?action=transform" \\
  -H "Content-Type: application/json" \\
  -d '{
    "strings": ["Hello World", "Next.js is great"],
    "operation": "slugify"
  }'`,
      axios: `const { data } = await axios.post(
  '${BASE}/api?action=transform',
  {
    strings: ['Hello World', 'Next.js is great'],
    operation: 'slugify',
  }
);
console.log(data.output); // ['hello-world', 'nextjs-is-great']`,
    },
  },
];

const TAGS = ['All', 'Core', 'Data', 'Compute', 'POST'];

// ─── Subcomponents ────────────────────────────────────────────────────────────

function MethodBadge({ method }: { method: HttpMethod }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-mono font-bold tracking-wider ${
      method === 'GET' ? 'bg-blue-100 text-blue-700' : 'bg-fuchsia-100 text-fuchsia-700'
    }`}>
      {method}
    </span>
  );
}

function TagBadge({ tag }: { tag: string }) {
  const colors: Record<string, string> = {
    Core: 'bg-slate-100 text-slate-600',
    Data: 'bg-violet-100 text-violet-700',
    Compute: 'bg-orange-100 text-orange-700',
    POST: 'bg-fuchsia-100 text-fuchsia-700',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${colors[tag] ?? 'bg-slate-100 text-slate-600'}`}>
      {tag}
    </span>
  );
}

function StatusIndicator({ status, code }: { status: TestResult['status']; code?: number }) {
  if (status === 'idle') return null;
  if (status === 'loading')
    return (
      <span className="flex items-center gap-1.5 text-sm text-slate-500">
        <span className="inline-block w-3 h-3 border-2 rounded-full border-slate-400 border-t-transparent animate-spin" />
        Running…
      </span>
    );
  if (status === 'success')
    return (
      <span className="flex items-center gap-1.5 text-sm font-medium text-green-600">
        <span className="w-2 h-2 bg-green-500 rounded-full" />
        {code} OK
      </span>
    );
  return (
    <span className="flex items-center gap-1.5 text-sm font-medium text-red-600">
      <span className="w-2 h-2 bg-red-500 rounded-full" />
      {code ?? 'Error'}
    </span>
  );
}

function CodeBlock({ code }: { code: CodeExample }) {
  const [lang, setLang] = useState<CodeLang>('fetch');

  const langLabels: { key: CodeLang; label: string }[] = [
    { key: 'fetch', label: 'fetch' },
    { key: 'curl', label: 'cURL' },
    { key: 'axios', label: 'axios' },
  ];

  return (
    <div className="overflow-hidden border rounded-xl border-slate-200">
      {/* Tab bar */}
      <div className="flex border-b bg-slate-100 border-slate-200">
        {langLabels.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setLang(key)}
            className={`px-4 py-2 text-xs font-semibold transition-colors ${
              lang === key
                ? 'bg-slate-900 text-white'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {/* Code */}
      <div className="p-4 bg-slate-900">
        <pre className="overflow-x-auto font-mono text-xs leading-relaxed whitespace-pre text-emerald-300">
          {code[lang]}
        </pre>
      </div>
    </div>
  );
}

function EndpointCard({
  ep,
  result,
  onRun,
}: {
  ep: ApiEndpoint;
  result: TestResult;
  onRun: (id: string) => void;
}) {
  const [showCode, setShowCode] = useState(false);
  const isLoading = result.status === 'loading';

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55 }}
      viewport={{ once: true }}
      className="overflow-hidden transition-shadow duration-300 bg-white shadow-md rounded-2xl hover:shadow-xl"
    >
      <div className={`h-1.5 w-full bg-linear-to-r ${ep.color}`} />

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{ep.icon}</span>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <h3 className="text-lg font-bold leading-tight text-slate-800">{ep.label}</h3>
                <MethodBadge method={ep.method} />
                <TagBadge tag={ep.tag} />
              </div>
              <code className="font-mono text-xs text-slate-500">{ep.endpoint}</code>
            </div>
          </div>
          <StatusIndicator status={result.status} code={result.statusCode} />
        </div>

        {/* Description */}
        <p className="mb-4 text-sm leading-relaxed text-slate-600">{ep.description}</p>

        {/* Parameters */}
        {ep.params && ep.params.length > 0 && (
          <div className="mb-4 overflow-hidden border rounded-xl border-slate-100">
            <div className="px-4 py-2 border-b bg-slate-50 border-slate-100">
              <p className="text-xs font-semibold tracking-wide uppercase text-slate-500">Parameters</p>
            </div>
            <table className="w-full text-xs">
              <tbody>
                {ep.params.map((p) => (
                  <tr key={p.name} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-2 font-mono font-semibold text-slate-700 whitespace-nowrap">{p.name}</td>
                    <td className="px-2 py-2">
                      <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded font-mono text-xs">{p.type}</span>
                    </td>
                    <td className="px-2 py-2">
                      {p.required
                        ? <span className="font-semibold text-red-500">required</span>
                        : <span className="text-slate-400">optional</span>}
                    </td>
                    <td className="px-2 py-2 text-slate-500">{p.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Request body preview */}
        {ep.body && (
          <div className="p-3 mb-4 border bg-slate-50 rounded-xl border-slate-100">
            <p className="text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Request body</p>
            <pre className="overflow-x-auto font-mono text-xs whitespace-pre-wrap text-slate-700">
              {JSON.stringify(ep.body, null, 2)}
            </pre>
          </div>
        )}

        {/* Actions row */}
        <div className="flex gap-3 mb-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onRun(ep.id)}
            disabled={isLoading}
            className={`flex-1 py-2.5 px-4 rounded-xl font-semibold text-white text-sm transition-all duration-300 shadow-md hover:shadow-lg bg-linear-to-r ${ep.color} disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            {isLoading ? 'Running…' : 'Run Test'}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowCode((v) => !v)}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold border-2 border-slate-200 text-slate-600 hover:border-slate-400 hover:text-slate-800 transition-all duration-200"
          >
            {showCode ? 'Hide Code' : '</> Code'}
          </motion.button>
        </div>

        {/* Code examples */}
        <AnimatePresence>
          {showCode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="mb-4 overflow-hidden"
            >
              <CodeBlock code={ep.code} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result */}
        <AnimatePresence>
          {result.status !== 'idle' && result.status !== 'loading' && result.data != null && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="p-4 bg-slate-900 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold tracking-wide uppercase text-slate-400">Response</p>
                  {result.duration && (
                    <span className="text-xs text-slate-500">{result.duration}ms</span>
                  )}
                </div>
                <pre className="overflow-x-auto overflow-y-auto font-mono text-xs whitespace-pre-wrap text-emerald-400 max-h-64">
                  {JSON.stringify(result.data as Record<string, unknown>, null, 2)}
                </pre>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ApiPage() {
  const [results, setResults] = useState<Record<string, TestResult>>(
    Object.fromEntries(ENDPOINTS.map((e) => [e.id, { id: e.id, status: 'idle' }]))
  );
  const [activeTag, setActiveTag] = useState('All');

  useEffect(() => {
    const lenis = new Lenis();
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }, []);

  const runTest = async (id: string) => {
    const ep = ENDPOINTS.find((e) => e.id === id)!;
    setResults((prev) => ({ ...prev, [id]: { id, status: 'loading' } }));
    const start = performance.now();
    try {
      const opts: RequestInit = { method: ep.method, headers: { 'Content-Type': 'application/json' } };
      if (ep.body) opts.body = JSON.stringify(ep.body);
      const res = await fetch(ep.endpoint, opts);
      const data = await res.json();
      setResults((prev) => ({
        ...prev,
        [id]: { id, status: 'success', statusCode: res.status, data, duration: Math.round(performance.now() - start) },
      }));
    } catch (err) {
      setResults((prev) => ({
        ...prev,
        [id]: { id, status: 'error', data: { error: String(err) }, duration: Math.round(performance.now() - start) },
      }));
    }
  };

  const runAll = () => ENDPOINTS.forEach((e) => runTest(e.id));

  const filtered = activeTag === 'All' ? ENDPOINTS : ENDPOINTS.filter((e) => e.tag === activeTag);
  const successCount = Object.values(results).filter((r) => r.status === 'success').length;
  const errorCount = Object.values(results).filter((r) => r.status === 'error').length;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />

      <main>
        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section className="relative pt-20 pb-16 overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900" />
          <div className="absolute inset-0 opacity-40">
            <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')]" />
          </div>

          <div className="relative z-10 px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm border rounded-full bg-white/10 backdrop-blur-sm border-white/20 text-white/80">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                API v1.0.0 · Vercel Edge Runtime · {ENDPOINTS.length} endpoints
              </div>

              <h1 className="mb-6 text-5xl font-bold leading-tight text-white md:text-6xl lg:text-7xl">
                API{' '}
                <span className="text-transparent bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text">
                  Reference
                </span>
              </h1>
              <p className="max-w-3xl mx-auto mb-10 text-xl leading-relaxed text-slate-200">
                Explore and test all REST API endpoints live from your browser. Every endpoint includes
                ready-to-use code examples for <strong className="text-white">fetch</strong>,{' '}
                <strong className="text-white">cURL</strong> and{' '}
                <strong className="text-white">axios</strong>.
              </p>

              {/* Stats */}
              <div className="flex flex-wrap justify-center gap-8 mb-10">
                {[
                  { label: 'Endpoints', value: ENDPOINTS.length, color: 'text-blue-400' },
                  { label: 'Passed', value: successCount, color: 'text-green-400' },
                  { label: 'Failed', value: errorCount, color: 'text-red-400' },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <div className={`text-4xl font-bold ${s.color}`}>{s.value}</div>
                    <div className="text-slate-400 text-sm mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={runAll}
                className="px-8 py-4 font-semibold text-white transition-all duration-300 shadow-lg bg-linear-to-r from-blue-500 to-purple-500 rounded-xl hover:from-blue-600 hover:to-purple-600 hover:shadow-xl"
              >
                🚀 Run All Tests
              </motion.button>
            </motion.div>
          </div>
        </section>

        {/* ── Info bar ─────────────────────────────────────────────────────── */}
        <section className="py-10 bg-white border-b border-slate-100">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 gap-4 md:grid-cols-4"
            >
              {[
                { label: 'Base URL', value: 'https://yoursite.vercel.app', icon: '🌐', bg: 'from-blue-50 to-cyan-50', border: 'border-blue-100' },
                { label: 'Content-Type', value: 'application/json', icon: '📄', bg: 'from-purple-50 to-violet-50', border: 'border-purple-100' },
                { label: 'Runtime', value: 'Vercel Edge Runtime', icon: '⚡', bg: 'from-orange-50 to-amber-50', border: 'border-orange-100' },
                { label: 'Auth', value: 'None required', icon: '🔓', bg: 'from-green-50 to-emerald-50', border: 'border-green-100' },
              ].map((item) => (
                <div key={item.label} className={`p-4 bg-linear-to-r ${item.bg} rounded-2xl border ${item.border}`}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span>{item.icon}</span>
                    <span className="text-xs font-semibold tracking-widest uppercase text-slate-500">{item.label}</span>
                  </div>
                  <code className="font-mono text-sm font-medium text-slate-800">{item.value}</code>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── How to call ───────────────────────────────────────────────────── */}
        <section className="py-16 bg-linear-to-br from-slate-50 to-blue-50">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="mb-12 text-center"
            >
              <h2 className="mb-4 text-4xl font-bold md:text-5xl text-slate-800">
                How to{' '}
                <span className="text-transparent bg-linear-to-r from-blue-500 to-purple-500 bg-clip-text">
                  Call the API
                </span>
              </h2>
              <p className="max-w-2xl mx-auto text-lg text-slate-600">
                Three ways to interact with every endpoint — no API key required.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* fetch */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0 }}
                viewport={{ once: true }}
                className="overflow-hidden bg-white shadow-md rounded-2xl"
              >
                <div className="h-1.5 bg-linear-to-r from-blue-500 to-cyan-500" />
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">🌐</span>
                    <h3 className="text-lg font-bold text-slate-800">Native fetch</h3>
                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-mono">built-in</span>
                  </div>
                  <p className="mb-4 text-sm text-slate-600">Works in any modern browser and Node.js 18+. No installation needed.</p>
                  <div className="p-4 bg-slate-900 rounded-xl">
                    <pre className="overflow-x-auto font-mono text-xs whitespace-pre text-emerald-300">{`// GET request
const res = await fetch('/api?test=status');
const data = await res.json();

// POST request
const res = await fetch('/api', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ key: 'value' }),
});`}</pre>
                  </div>
                </div>
              </motion.div>

              {/* cURL */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="overflow-hidden bg-white shadow-md rounded-2xl"
              >
                <div className="h-1.5 bg-linear-to-r from-orange-500 to-amber-500" />
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">💻</span>
                    <h3 className="text-lg font-bold text-slate-800">cURL</h3>
                    <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded font-mono">terminal</span>
                  </div>
                  <p className="mb-4 text-sm text-slate-600">Available on macOS, Linux and Windows. Great for quick testing from the command line.</p>
                  <div className="p-4 bg-slate-900 rounded-xl">
                    <pre className="overflow-x-auto font-mono text-xs whitespace-pre text-emerald-300">{`# GET request
curl -X GET "/api?test=status"

# POST request with JSON body
curl -X POST "/api" \\
  -H "Content-Type: application/json" \\
  -d '{"key":"value"}'`}</pre>
                  </div>
                </div>
              </motion.div>

              {/* axios */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="overflow-hidden bg-white shadow-md rounded-2xl"
              >
                <div className="h-1.5 bg-linear-to-r from-purple-500 to-violet-500" />
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">📦</span>
                    <h3 className="text-lg font-bold text-slate-800">axios</h3>
                    <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded font-mono">npm install axios</span>
                  </div>
                  <p className="mb-4 text-sm text-slate-600">Popular HTTP client with automatic JSON parsing, interceptors and request cancellation.</p>
                  <div className="p-4 bg-slate-900 rounded-xl">
                    <pre className="overflow-x-auto font-mono text-xs whitespace-pre text-emerald-300">{`import axios from 'axios';

// GET request
const { data } = await axios.get('/api', {
  params: { test: 'status' },
});

// POST request
const { data } = await axios.post('/api', {
  key: 'value',
});`}</pre>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Response structure note */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="p-6 mt-8 bg-white border border-blue-100 shadow-sm rounded-2xl"
            >
              <div className="flex items-start gap-4">
                <span className="text-2xl mt-0.5">💡</span>
                <div>
                  <h4 className="mb-2 font-bold text-slate-800">Response structure</h4>
                  <p className="mb-3 text-sm text-slate-600">
                    Every response follows a consistent envelope. Check <code className="px-1 font-mono text-xs rounded bg-slate-100">success</code> first,
                    then read the payload. Errors always include an <code className="px-1 font-mono text-xs rounded bg-slate-100">error</code> string.
                  </p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="p-3 bg-slate-900 rounded-xl">
                      <p className="text-xs text-green-400 font-semibold mb-1.5">✓ Success (2xx)</p>
                      <pre className="font-mono text-xs text-emerald-300">{`{
  "success": true,
  "test": "status",
  "status": "online",
  "timestamp": "2025-..."
}`}</pre>
                    </div>
                    <div className="p-3 bg-slate-900 rounded-xl">
                      <p className="text-xs text-red-400 font-semibold mb-1.5">✗ Error (4xx)</p>
                      <pre className="font-mono text-xs text-red-300">{`{
  "success": false,
  "error": "Invalid JSON in
           request body."
}`}</pre>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Endpoint cards ────────────────────────────────────────────────── */}
        <section className="py-20">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="mb-12 text-center"
            >
              <h2 className="mb-4 text-4xl font-bold md:text-5xl text-slate-800">
                Live{' '}
                <span className="text-transparent bg-linear-to-r from-blue-500 to-purple-500 bg-clip-text">
                  Endpoints
                </span>
              </h2>
              <p className="max-w-2xl mx-auto mb-8 text-lg text-slate-600">
                Run individual tests, inspect responses, and view code examples inline.
              </p>

              {/* Tag filter */}
              <div className="flex flex-wrap justify-center gap-2">
                {TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setActiveTag(tag)}
                    className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                      activeTag === tag
                        ? 'bg-slate-900 text-white shadow-md'
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    {tag}
                    <span className="ml-1.5 text-xs opacity-60">
                      {tag === 'All' ? ENDPOINTS.length : ENDPOINTS.filter((e) => e.tag === tag).length}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <AnimatePresence mode="popLayout">
                {filtered.map((ep) => (
                  <EndpointCard
                    key={ep.id}
                    ep={ep}
                    result={results[ep.id]}
                    onRun={runTest}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* ── Endpoint table ────────────────────────────────────────────────── */}
        <section className="py-20 bg-white">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="mb-12 text-center"
            >
              <h2 className="mb-4 text-4xl font-bold md:text-5xl text-slate-800">
                Endpoint{' '}
                <span className="text-transparent bg-linear-to-r from-blue-500 to-purple-500 bg-clip-text">
                  Overview
                </span>
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="overflow-hidden border shadow-lg rounded-2xl border-slate-100"
            >
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-slate-50 border-slate-100">
                    <th className="px-6 py-4 text-xs font-semibold tracking-wide text-left uppercase text-slate-500">Method</th>
                    <th className="px-6 py-4 text-xs font-semibold tracking-wide text-left uppercase text-slate-500">Endpoint</th>
                    <th className="hidden px-6 py-4 text-xs font-semibold tracking-wide text-left uppercase text-slate-500 md:table-cell">Tag</th>
                    <th className="hidden px-6 py-4 text-xs font-semibold tracking-wide text-left uppercase text-slate-500 lg:table-cell">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {ENDPOINTS.map((ep, i) => (
                    <tr key={ep.id} className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${i % 2 === 0 ? '' : 'bg-slate-50/50'}`}>
                      <td className="px-6 py-3"><MethodBadge method={ep.method} /></td>
                      <td className="px-6 py-3"><code className="font-mono text-xs text-slate-700">{ep.endpoint}</code></td>
                      <td className="hidden px-6 py-3 md:table-cell"><TagBadge tag={ep.tag} /></td>
                      <td className="hidden px-6 py-3 text-xs text-slate-500 lg:table-cell">{ep.label}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────────────────────── */}
        <section className="py-20 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="px-4 mx-auto text-center max-w-7xl sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="mb-6 text-4xl font-bold text-white md:text-5xl">
                Ready to{' '}
                <span className="text-transparent bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text">
                  Integrate?
                </span>
              </h2>
              <p className="max-w-3xl mx-auto mb-8 text-xl leading-relaxed text-slate-200">
                Need a custom API built for your project? Let&apos;s talk about your requirements.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 font-semibold text-white transition-all duration-300 shadow-lg bg-linear-to-r from-blue-500 to-purple-500 rounded-xl hover:from-blue-600 hover:to-purple-600 hover:shadow-xl"
                >
                  Get in Touch
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 font-semibold text-white transition-all duration-300 border-2 border-white/30 rounded-xl hover:bg-white/10 backdrop-blur-sm"
                >
                  View Portfolio
                </motion.button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
}