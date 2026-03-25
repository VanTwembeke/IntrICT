'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import BackToTop from '@/components/common/BackToTop';
import Lenis from 'lenis';

// ─── Types ────────────────────────────────────────────────────────────────────

type HttpMethod = 'GET' | 'POST';
type CodeLang = 'fetch' | 'curl' | 'axios';

interface CodeExample { fetch: string; curl: string; axios: string; }

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
  auth: boolean;
  params?: { name: string; type: string; required: boolean; description: string }[];
  code: (key: string) => CodeExample;
}

interface TestResult {
  id: string;
  status: 'idle' | 'loading' | 'success' | 'error';
  statusCode?: number;
  data?: Record<string, unknown>;
  duration?: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DEMO_KEY = 'demo_sk_portfolio_2025';
const BASE = 'https://intrict.com';

// ─── Endpoint definitions ─────────────────────────────────────────────────────

const ENDPOINTS: ApiEndpoint[] = [
  // ── Public ────────────────────────────────────────────────────────────────
  {
    id: 'status', label: 'Health Check', tag: 'Core', auth: false,
    description: 'Returns current server status, API version and runtime. Use this to verify connectivity before making other requests.',
    method: 'GET', endpoint: '/api?test=status',
    color: 'from-green-500 to-emerald-500', icon: '🟢',
    code: () => ({
      fetch: `const res = await fetch('${BASE}/api?test=status');\nconst data = await res.json();\nconsole.log(data.status); // "online"`,
      curl: `curl -X GET "${BASE}/api?test=status"`,
      axios: `const { data } = await axios.get('${BASE}/api', {\n  params: { test: 'status' },\n});\nconsole.log(data.status);`,
    }),
  },
  {
    id: 'echo', label: 'Echo & Reverse', tag: 'Core', auth: false,
    description: 'Echoes back your message with a reversed copy and character count. Useful for testing string encoding.',
    method: 'GET', endpoint: '/api?test=echo&message=Hello+World',
    color: 'from-blue-500 to-cyan-500', icon: '🔊',
    params: [{ name: 'message', type: 'string', required: false, description: 'Any string to echo. Defaults to "Hello, World!"' }],
    code: () => ({
      fetch: `const msg = encodeURIComponent('Hello World');\nconst res = await fetch(\`${BASE}/api?test=echo&message=\${msg}\`);\nconst { reversed } = await res.json();\nconsole.log(reversed); // "dlroW olleH"`,
      curl: `curl -G "${BASE}/api" \\\n  --data-urlencode "test=echo" \\\n  --data-urlencode "message=Hello World"`,
      axios: `const { data } = await axios.get('${BASE}/api', {\n  params: { test: 'echo', message: 'Hello World' },\n});\nconsole.log(data.reversed);`,
    }),
  },
  {
    id: 'headers', label: 'Request Headers', tag: 'Core', auth: false,
    description: 'Returns all HTTP headers sent with the request. Helpful for debugging proxies, CORS and custom headers.',
    method: 'GET', endpoint: '/api?test=headers',
    color: 'from-orange-500 to-amber-500', icon: '🔍',
    code: () => ({
      fetch: `const res = await fetch('${BASE}/api?test=headers', {\n  headers: { 'X-Custom-Header': 'my-value' },\n});\nconst { headers } = await res.json();`,
      curl: `curl -X GET "${BASE}/api?test=headers" \\\n  -H "X-Custom-Header: my-value"`,
      axios: `const { data } = await axios.get('${BASE}/api?test=headers', {\n  headers: { 'X-Custom-Header': 'my-value' },\n});`,
    }),
  },
  {
    id: 'projects', label: 'Projects List', tag: 'Data', auth: false,
    description: 'Paginated project list with optional filters for status and technology stack.',
    method: 'GET', endpoint: '/api?test=projects&page=1&limit=3&status=live',
    color: 'from-violet-500 to-purple-500', icon: '📁',
    params: [
      { name: 'page', type: 'number', required: false, description: 'Page number, starts at 1' },
      { name: 'limit', type: 'number', required: false, description: 'Results per page (1–10, default 3)' },
      { name: 'status', type: 'string', required: false, description: 'live | in-progress | archived' },
      { name: 'tech', type: 'string', required: false, description: 'Filter by technology (partial match)' },
    ],
    code: () => ({
      fetch: `const params = new URLSearchParams({\n  test: 'projects', page: '1', limit: '3', status: 'live',\n});\nconst res = await fetch(\`${BASE}/api?\${params}\`);\nconst { data, pagination } = await res.json();`,
      curl: `curl -G "${BASE}/api" \\\n  -d "test=projects" -d "page=1" \\\n  -d "limit=3" -d "status=live"`,
      axios: `const { data } = await axios.get('${BASE}/api', {\n  params: { test: 'projects', page: 1, limit: 3, status: 'live' },\n});`,
    }),
  },
  {
    id: 'projects-stats', label: 'Project Statistics', tag: 'Data', auth: false,
    description: 'Aggregated stats across all projects: count by status, top technologies by frequency, and active years.',
    method: 'GET', endpoint: '/api?test=projects-stats',
    color: 'from-pink-500 to-rose-500', icon: '📊',
    code: () => ({
      fetch: `const res = await fetch('${BASE}/api?test=projects-stats');\nconst { byStatus, topTech, total } = await res.json();`,
      curl: `curl -X GET "${BASE}/api?test=projects-stats"`,
      axios: `const { data } = await axios.get('${BASE}/api', {\n  params: { test: 'projects-stats' },\n});`,
    }),
  },
  {
    id: 'skills', label: 'Skills by Category', tag: 'Data', auth: false,
    description: 'Returns skill categories and their items. Filter by a specific category name to narrow the response.',
    method: 'GET', endpoint: '/api?test=skills&category=Frontend',
    color: 'from-teal-500 to-cyan-600', icon: '🧠',
    params: [{ name: 'category', type: 'string', required: false, description: 'Frontend | Backend | DevOps | Design' }],
    code: () => ({
      fetch: `const res = await fetch('${BASE}/api?test=skills&category=Frontend');\nconst { data } = await res.json();\nconsole.log(data[0].items);`,
      curl: `curl -G "${BASE}/api" \\\n  -d "test=skills" -d "category=Frontend"`,
      axios: `const { data } = await axios.get('${BASE}/api', {\n  params: { test: 'skills', category: 'Frontend' },\n});`,
    }),
  },
  {
    id: 'fibonacci', label: 'Fibonacci Sequence', tag: 'Compute', auth: false,
    description: 'Generates a Fibonacci sequence up to n terms (max 40), returning the full sequence and its sum.',
    method: 'GET', endpoint: '/api?test=fibonacci&n=15',
    color: 'from-yellow-500 to-orange-500', icon: '🔢',
    params: [{ name: 'n', type: 'number', required: false, description: 'Number of terms (max 40, default 10)' }],
    code: () => ({
      fetch: `const res = await fetch('${BASE}/api?test=fibonacci&n=15');\nconst { sequence, sum } = await res.json();`,
      curl: `curl -G "${BASE}/api" \\\n  -d "test=fibonacci" -d "n=15"`,
      axios: `const { data } = await axios.get('${BASE}/api', {\n  params: { test: 'fibonacci', n: 15 },\n});`,
    }),
  },
  {
    id: 'hash', label: 'FNV-1a Hash', tag: 'Compute', auth: false,
    description: 'Computes an FNV-1a 32-bit hash of any string, returning decimal, hex and binary representations.',
    method: 'GET', endpoint: '/api?test=hash&input=hello-world',
    color: 'from-slate-500 to-slate-700', icon: '#️⃣',
    params: [{ name: 'input', type: 'string', required: false, description: 'String to hash. Defaults to "hello".' }],
    code: () => ({
      fetch: `const input = encodeURIComponent('hello-world');\nconst res = await fetch(\`${BASE}/api?test=hash&input=\${input}\`);\nconst { hex } = await res.json();`,
      curl: `curl -G "${BASE}/api" \\\n  --data-urlencode "test=hash" \\\n  --data-urlencode "input=hello-world"`,
      axios: `const { data } = await axios.get('${BASE}/api', {\n  params: { test: 'hash', input: 'hello-world' },\n});`,
    }),
  },
  {
    id: 'post-echo', label: 'POST Echo', tag: 'POST', auth: false,
    description: 'Send any JSON body and receive it back with metadata: key names, byte size, and inferred types per field.',
    method: 'POST', endpoint: '/api',
    body: { username: 'john_doe', age: 28, tags: ['dev', 'design'] },
    color: 'from-indigo-500 to-blue-600', icon: '📤',
    code: () => ({
      fetch: `const res = await fetch('${BASE}/api', {\n  method: 'POST',\n  headers: { 'Content-Type': 'application/json' },\n  body: JSON.stringify({ username: 'john_doe', age: 28, tags: ['dev', 'design'] }),\n});\nconst { meta } = await res.json();`,
      curl: `curl -X POST "${BASE}/api" \\\n  -H "Content-Type: application/json" \\\n  -d '{"username":"john_doe","age":28,"tags":["dev","design"]}'`,
      axios: `const { data } = await axios.post('${BASE}/api', {\n  username: 'john_doe', age: 28, tags: ['dev', 'design'],\n});`,
    }),
  },
  {
    id: 'validate', label: 'Form Validation', tag: 'POST', auth: false,
    description: 'Validates a contact form payload. Returns field-level errors (422) or a sanitized object on success.',
    method: 'POST', endpoint: '/api?action=validate',
    body: { name: 'Jane Doe', email: 'jane@example.com', message: 'Hello, I would like to discuss a project.' },
    color: 'from-green-600 to-teal-600', icon: '✅',
    params: [
      { name: 'name', type: 'string', required: true, description: 'Min 2 characters' },
      { name: 'email', type: 'string', required: true, description: 'Valid email format' },
      { name: 'message', type: 'string', required: true, description: 'Min 10 characters' },
    ],
    code: () => ({
      fetch: `const res = await fetch('${BASE}/api?action=validate', {\n  method: 'POST',\n  headers: { 'Content-Type': 'application/json' },\n  body: JSON.stringify({\n    name: 'Jane Doe',\n    email: 'jane@example.com',\n    message: 'Hello, I would like to discuss a project.',\n  }),\n});\n// 200 → { valid: true }  |  422 → { valid: false, errors: [...] }`,
      curl: `curl -X POST "${BASE}/api?action=validate" \\\n  -H "Content-Type: application/json" \\\n  -d '{"name":"Jane Doe","email":"jane@example.com","message":"Hello, I would like to discuss a project."}'`,
      axios: `const { data } = await axios.post('${BASE}/api?action=validate', {\n  name: 'Jane Doe',\n  email: 'jane@example.com',\n  message: 'Hello, I would like to discuss a project.',\n});`,
    }),
  },
  {
    id: 'transform', label: 'Batch Transform', tag: 'POST', auth: false,
    description: 'Applies a string operation to every item in a "strings" array. Supports: uppercase, lowercase, reverse, slugify, wordcount.',
    method: 'POST', endpoint: '/api?action=transform',
    body: { strings: ['Hello World', 'Next.js is great', 'API Testing'], operation: 'slugify' },
    color: 'from-fuchsia-500 to-pink-600', icon: '⚙️',
    params: [
      { name: 'strings', type: 'string[]', required: true, description: 'Array of strings to transform' },
      { name: 'operation', type: 'string', required: false, description: 'uppercase | lowercase | reverse | slugify | wordcount' },
    ],
    code: () => ({
      fetch: `const res = await fetch('${BASE}/api?action=transform', {\n  method: 'POST',\n  headers: { 'Content-Type': 'application/json' },\n  body: JSON.stringify({ strings: ['Hello World', 'Next.js is great'], operation: 'slugify' }),\n});\nconst { output } = await res.json();\n// ['hello-world', 'nextjs-is-great']`,
      curl: `curl -X POST "${BASE}/api?action=transform" \\\n  -H "Content-Type: application/json" \\\n  -d '{"strings":["Hello World","Next.js is great"],"operation":"slugify"}'`,
      axios: `const { data } = await axios.post('${BASE}/api?action=transform', {\n  strings: ['Hello World', 'Next.js is great'],\n  operation: 'slugify',\n});`,
    }),
  },

  // ── Authenticated ────────────────────────────────────────────────────────
  {
    id: 'analytics', label: 'Site Analytics', tag: 'Auth', auth: true,
    description: 'Returns private site analytics: total page views, top pages by traffic, referrer sources, and device breakdown.',
    method: 'GET', endpoint: '/api?test=analytics',
    color: 'from-amber-500 to-yellow-600', icon: '📈',
    code: (key) => ({
      fetch: `const res = await fetch('${BASE}/api?test=analytics', {\n  headers: { Authorization: \`Bearer ${key || '<your-api-key>'}\` },\n});\nconst { pageViews, topPages } = await res.json();`,
      curl: `curl -X GET "${BASE}/api?test=analytics" \\\n  -H "Authorization: Bearer ${key || '<your-api-key>'}"`,
      axios: `const { data } = await axios.get('${BASE}/api', {\n  params: { test: 'analytics' },\n  headers: { Authorization: \`Bearer ${key || '<your-api-key>'}\` },\n});`,
    }),
  },
  {
    id: 'messages', label: 'Contact Inbox', tag: 'Auth', auth: true,
    description: 'Returns the private contact message inbox. Pass ?unread=true to filter to unread messages only.',
    method: 'GET', endpoint: '/api?test=messages&unread=false',
    color: 'from-sky-500 to-blue-600', icon: '✉️',
    params: [{ name: 'unread', type: 'boolean', required: false, description: 'Set to true to return only unread messages' }],
    code: (key) => ({
      fetch: `const res = await fetch('${BASE}/api?test=messages&unread=true', {\n  headers: { Authorization: \`Bearer ${key || '<your-api-key>'}\` },\n});\nconst { data, unread } = await res.json();`,
      curl: `curl -G "${BASE}/api" \\\n  -d "test=messages" -d "unread=true" \\\n  -H "Authorization: Bearer ${key || '<your-api-key>'}"`,
      axios: `const { data } = await axios.get('${BASE}/api', {\n  params: { test: 'messages', unread: true },\n  headers: { Authorization: \`Bearer ${key || '<your-api-key>'}\` },\n});`,
    }),
  },
  {
    id: 'env', label: 'Environment Info', tag: 'Auth', auth: true,
    description: 'Returns deployment metadata: Node version, framework, deploy timestamp, region, feature flags and build ID.',
    method: 'GET', endpoint: '/api?test=env',
    color: 'from-rose-500 to-red-600', icon: '🖥️',
    code: (key) => ({
      fetch: `const res = await fetch('${BASE}/api?test=env', {\n  headers: { Authorization: \`Bearer ${key || '<your-api-key>'}\` },\n});\nconst { region, featureFlags } = await res.json();`,
      curl: `curl -X GET "${BASE}/api?test=env" \\\n  -H "Authorization: Bearer ${key || '<your-api-key>'}"`,
      axios: `const { data } = await axios.get('${BASE}/api', {\n  params: { test: 'env' },\n  headers: { Authorization: \`Bearer ${key || '<your-api-key>'}\` },\n});`,
    }),
  },
  {
    id: 'publish', label: 'Publish Project', tag: 'Auth', auth: true,
    description: 'Creates a new project entry (demo — not persisted). Validates all fields and returns the constructed project object.',
    method: 'POST', endpoint: '/api?action=publish',
    body: { title: 'My New Project', tech: ['Next.js', 'TypeScript'], status: 'live', year: 2025 },
    color: 'from-violet-600 to-purple-700', icon: '🚀',
    params: [
      { name: 'title', type: 'string', required: true, description: 'Min 3 characters' },
      { name: 'tech', type: 'string[]', required: true, description: 'Non-empty array of technology names' },
      { name: 'status', type: 'string', required: true, description: 'live | in-progress | archived' },
      { name: 'year', type: 'number', required: true, description: 'Year between 2000 and 2100' },
    ],
    code: (key) => ({
      fetch: `const res = await fetch('${BASE}/api?action=publish', {\n  method: 'POST',\n  headers: {\n    'Content-Type': 'application/json',\n    Authorization: \`Bearer ${key || '<your-api-key>'}\`,\n  },\n  body: JSON.stringify({\n    title: 'My New Project',\n    tech: ['Next.js', 'TypeScript'],\n    status: 'live',\n    year: 2025,\n  }),\n});\n// 201 → { success: true, project: { id, title, ... } }`,
      curl: `curl -X POST "${BASE}/api?action=publish" \\\n  -H "Content-Type: application/json" \\\n  -H "Authorization: Bearer ${key || '<your-api-key>'}" \\\n  -d '{"title":"My New Project","tech":["Next.js","TypeScript"],"status":"live","year":2025}'`,
      axios: `const { data } = await axios.post(\n  '${BASE}/api?action=publish',\n  { title: 'My New Project', tech: ['Next.js', 'TypeScript'], status: 'live', year: 2025 },\n  { headers: { Authorization: \`Bearer ${key || '<your-api-key>'}\` } }\n);`,
    }),
  },
];

const TAGS = ['All', 'Core', 'Data', 'Compute', 'POST', 'Auth'];

// ─── Subcomponents ────────────────────────────────────────────────────────────

function MethodBadge({ method }: { method: HttpMethod }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-mono font-bold tracking-wider ${method === 'GET' ? 'bg-blue-100 text-blue-700' : 'bg-fuchsia-100 text-fuchsia-700'}`}>
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
    Auth: 'bg-amber-100 text-amber-700',
  };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${colors[tag] ?? 'bg-slate-100 text-slate-600'}`}>{tag}</span>;
}

function AuthBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-700">
      🔒 Auth required
    </span>
  );
}

function StatusIndicator({ status, code }: { status: TestResult['status']; code?: number }) {
  if (status === 'idle') return null;
  if (status === 'loading') return (
    <span className="flex items-center gap-1.5 text-sm text-slate-500">
      <span className="inline-block w-3 h-3 border-2 rounded-full border-slate-400 border-t-transparent animate-spin" />
      Running…
    </span>
  );
  if (status === 'success') return (
    <span className="flex items-center gap-1.5 text-sm font-medium text-green-600">
      <span className="w-2 h-2 bg-green-500 rounded-full" />{code} OK
    </span>
  );
  return (
    <span className="flex items-center gap-1.5 text-sm font-medium text-red-600">
      <span className="w-2 h-2 bg-red-500 rounded-full" />{code ?? 'Error'}
    </span>
  );
}

function CodeBlock({ code }: { code: CodeExample }) {
  const [lang, setLang] = useState<CodeLang>('fetch');
  return (
    <div className="overflow-hidden border rounded-xl border-slate-200">
      <div className="flex border-b bg-slate-100 border-slate-200">
        {(['fetch', 'curl', 'axios'] as CodeLang[]).map((k) => (
          <button key={k} onClick={() => setLang(k)}
            className={`px-4 py-2 text-xs font-semibold transition-colors ${lang === k ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-800'}`}>
            {k === 'curl' ? 'cURL' : k}
          </button>
        ))}
      </div>
      <div className="p-4 bg-slate-900">
        <pre className="overflow-x-auto font-mono text-xs leading-relaxed whitespace-pre text-emerald-300">{code[lang]}</pre>
      </div>
    </div>
  );
}

function EndpointCard({ ep, result, onRun, apiKey, unlocked }: {
  ep: ApiEndpoint; result: TestResult;
  onRun: (id: string) => void; apiKey: string; unlocked: boolean;
}) {
  const [showCode, setShowCode] = useState(false);
  const isLoading = result.status === 'loading';
  const isLocked = ep.auth && !unlocked;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55 }}
      viewport={{ once: true }}
      className={`overflow-hidden bg-white shadow-md rounded-2xl transition-shadow duration-300 ${isLocked ? 'opacity-75' : 'hover:shadow-xl'}`}
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
                {ep.auth && <AuthBadge />}
              </div>
              <code className="font-mono text-xs text-slate-500">{ep.endpoint}</code>
            </div>
          </div>
          <StatusIndicator status={result.status} code={result.statusCode} />
        </div>

        <p className="mb-4 text-sm leading-relaxed text-slate-600">{ep.description}</p>

        {/* Locked overlay message */}
        {isLocked && (
          <div className="flex items-center gap-2 p-3 mb-4 border bg-amber-50 border-amber-200 rounded-xl">
            <span>🔒</span>
            <p className="text-xs font-medium text-amber-700">Enter your API key above to unlock and run this endpoint.</p>
          </div>
        )}

        {/* Params */}
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
                    <td className="px-2 py-2"><span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded font-mono text-xs">{p.type}</span></td>
                    <td className="px-2 py-2">{p.required ? <span className="font-semibold text-red-500">required</span> : <span className="text-slate-400">optional</span>}</td>
                    <td className="px-2 py-2 text-slate-500">{p.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Body */}
        {ep.body && (
          <div className="p-3 mb-4 border bg-slate-50 rounded-xl border-slate-100">
            <p className="text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Request body</p>
            <pre className="overflow-x-auto font-mono text-xs whitespace-pre-wrap text-slate-700">{JSON.stringify(ep.body, null, 2)}</pre>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mb-4">
          <motion.button
            whileHover={isLocked ? {} : { scale: 1.02 }}
            whileTap={isLocked ? {} : { scale: 0.97 }}
            onClick={() => !isLocked && onRun(ep.id)}
            disabled={isLoading || isLocked}
            className={`flex-1 py-2.5 px-4 rounded-xl font-semibold text-white text-sm transition-all duration-300 shadow-md bg-linear-to-r ${ep.color} ${isLocked ? 'opacity-40 cursor-not-allowed' : 'hover:shadow-lg'} disabled:cursor-not-allowed`}
          >
            {isLocked ? '🔒 Locked' : isLoading ? 'Running…' : 'Run Test'}
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

        <AnimatePresence>
          {showCode && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }} className="mb-4 overflow-hidden">
              <CodeBlock code={ep.code(apiKey)} />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {result.status !== 'idle' && result.status !== 'loading' && result.data != null && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
              <div className="p-4 bg-slate-900 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold tracking-wide uppercase text-slate-400">Response</p>
                  {result.duration && <span className="text-xs text-slate-500">{result.duration}ms</span>}
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

export default function ApiDocsPage() {
  const [results, setResults] = useState<Record<string, TestResult>>(
    Object.fromEntries(ENDPOINTS.map((e) => [e.id, { id: e.id, status: 'idle' }]))
  );
  const [activeTag, setActiveTag] = useState('All');
  const [apiKey, setApiKey] = useState('');
  const [keyInput, setKeyInput] = useState('');
  const [keyError, setKeyError] = useState('');
  const unlocked = apiKey.length > 0;

  useEffect(() => {
    const lenis = new Lenis();
    function raf(time: number) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
  }, []);

  const applyKey = () => {
    if (keyInput.trim() === DEMO_KEY) {
      setApiKey(keyInput.trim());
      setKeyError('');
    } else {
      setKeyError('Invalid API key. Use the demo key shown below.');
    }
  };

  const clearKey = () => { setApiKey(''); setKeyInput(''); setKeyError(''); };

  const runTest = useCallback(async (id: string) => {
    const ep = ENDPOINTS.find((e) => e.id === id)!;
    if (ep.auth && !unlocked) return;
    setResults((prev) => ({ ...prev, [id]: { id, status: 'loading' } }));
    const start = performance.now();
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (ep.auth && apiKey) headers['Authorization'] = `Bearer ${apiKey}`;
      const opts: RequestInit = { method: ep.method, headers };
      if (ep.body) opts.body = JSON.stringify(ep.body);
      const res = await fetch(ep.endpoint, opts);
      const data = await res.json();
      setResults((prev) => ({ ...prev, [id]: { id, status: res.ok ? 'success' : 'error', statusCode: res.status, data, duration: Math.round(performance.now() - start) } }));
    } catch (err) {
      setResults((prev) => ({ ...prev, [id]: { id, status: 'error', data: { error: String(err) }, duration: Math.round(performance.now() - start) } }));
    }
  }, [apiKey, unlocked]);

  const runAll = () => ENDPOINTS.filter((e) => !e.auth || unlocked).forEach((e) => runTest(e.id));

  const filtered = activeTag === 'All' ? ENDPOINTS : ENDPOINTS.filter((e) => e.tag === activeTag);
  const successCount = Object.values(results).filter((r) => r.status === 'success').length;
  const errorCount = Object.values(results).filter((r) => r.status === 'error').length;
  const publicCount = ENDPOINTS.filter((e) => !e.auth).length;
  const authCount = ENDPOINTS.filter((e) => e.auth).length;

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
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm border rounded-full bg-white/10 backdrop-blur-sm border-white/20 text-white/80">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                API v1.0.0 · Vercel Edge Runtime · {ENDPOINTS.length} endpoints
              </div>
              <h1 className="mb-6 text-5xl font-bold leading-tight text-white md:text-6xl lg:text-7xl">
                API{' '}
                <span className="text-transparent bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text">Reference</span>
              </h1>
              <p className="max-w-3xl mx-auto mb-10 text-xl leading-relaxed text-slate-200">
                Explore and test all REST API endpoints live. Includes{' '}
                <span className="font-semibold text-white">{publicCount} public</span> and{' '}
                <span className="font-semibold text-amber-300">{authCount} authenticated</span> endpoints — with ready-to-use code examples.
              </p>
              <div className="flex flex-wrap justify-center gap-8 mb-10">
                {[
                  { label: 'Public', value: publicCount, color: 'text-blue-400' },
                  { label: 'Auth', value: authCount, color: 'text-amber-400' },
                  { label: 'Passed', value: successCount, color: 'text-green-400' },
                  { label: 'Failed', value: errorCount, color: 'text-red-400' },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <div className={`text-4xl font-bold ${s.color}`}>{s.value}</div>
                    <div className="text-slate-400 text-sm mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={runAll}
                className="px-8 py-4 font-semibold text-white transition-all duration-300 shadow-lg bg-linear-to-r from-blue-500 to-purple-500 rounded-xl hover:from-blue-600 hover:to-purple-600 hover:shadow-xl">
                🚀 Run All Tests {unlocked ? '' : '(public only)'}
              </motion.button>
            </motion.div>
          </div>
        </section>

        {/* ── Info bar ─────────────────────────────────────────────────────── */}
        <section className="py-10 bg-white border-b border-slate-100">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}
              className="grid grid-cols-1 gap-4 md:grid-cols-4">
              {[
                { label: 'Base URL', value: 'https://yoursite.vercel.app', icon: '🌐', bg: 'from-blue-50 to-cyan-50', border: 'border-blue-100' },
                { label: 'Content-Type', value: 'application/json', icon: '📄', bg: 'from-purple-50 to-violet-50', border: 'border-purple-100' },
                { label: 'Runtime', value: 'Vercel Edge Runtime', icon: '⚡', bg: 'from-orange-50 to-amber-50', border: 'border-orange-100' },
                { label: 'Auth scheme', value: 'Bearer token', icon: '🔐', bg: 'from-amber-50 to-yellow-50', border: 'border-amber-100' },
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

        {/* ── API Key section ───────────────────────────────────────────────── */}
        <section className="border-b py-14 bg-linear-to-br from-amber-50 to-orange-50 border-amber-100">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} viewport={{ once: true }}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">🔑</span>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Authentication</h2>
                  <p className="text-sm text-slate-500">Required to unlock the 4 protected endpoints</p>
                </div>
                {unlocked && (
                  <span className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
                    <span className="w-2 h-2 bg-green-500 rounded-full" /> Authenticated
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 gap-6 mt-6 lg:grid-cols-2">
                {/* Key input */}
                <div className="p-6 bg-white border shadow-sm rounded-2xl border-amber-100">
                  <p className="mb-3 text-sm font-semibold text-slate-700">Enter API Key</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={keyInput}
                      onChange={(e) => { setKeyInput(e.target.value); setKeyError(''); }}
                      onKeyDown={(e) => e.key === 'Enter' && applyKey()}
                      placeholder="demo_sk_portfolio_2025"
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent"
                    />
                    {unlocked
                      ? <button onClick={clearKey} className="px-4 py-2.5 rounded-xl bg-red-100 text-red-700 text-sm font-semibold hover:bg-red-200 transition-colors">Clear</button>
                      : <button onClick={applyKey} className="px-4 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition-colors shadow-md">Unlock</button>
                    }
                  </div>
                  {keyError && <p className="mt-2 text-xs font-medium text-red-600">{keyError}</p>}
                  {unlocked && <p className="mt-2 text-xs font-medium text-green-600">✓ All {authCount} authenticated endpoints are now unlocked.</p>}
                </div>

                {/* Demo key info */}
                <div className="p-6 bg-white border shadow-sm rounded-2xl border-amber-100">
                  <p className="mb-3 text-sm font-semibold text-slate-700">Demo Key</p>
                  <div className="flex items-center gap-2 mb-3">
                    <code className="flex-1 px-3 py-2 font-mono text-sm select-all bg-slate-900 text-emerald-400 rounded-xl">{DEMO_KEY}</code>
                    <button
                      onClick={() => { setKeyInput(DEMO_KEY); }}
                      className="px-3 py-2 text-xs font-semibold transition-colors rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 whitespace-nowrap">
                      Use this
                    </button>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-500">
                    This is a public demo key for portfolio purposes. In a real project, store your key in an environment variable and never commit it to version control.
                  </p>
                </div>
              </div>

              {/* How auth works */}
              <div className="p-5 mt-4 bg-white border shadow-sm rounded-2xl border-amber-100">
                <p className="mb-3 text-sm font-semibold text-slate-700">How to send the token</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {[
                    { lang: 'fetch', code: `headers: {\n  Authorization: \`Bearer \${key}\`\n}` },
                    { lang: 'cURL', code: `-H "Authorization: Bearer <key>"` },
                    { lang: 'axios', code: `headers: {\n  Authorization: \`Bearer \${key}\`\n}` },
                  ].map((ex) => (
                    <div key={ex.lang} className="p-3 bg-slate-900 rounded-xl">
                      <p className="text-xs text-slate-500 mb-1.5 font-semibold">{ex.lang}</p>
                      <pre className="font-mono text-xs whitespace-pre text-emerald-300">{ex.code}</pre>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── How to call ───────────────────────────────────────────────────── */}
        <section className="py-16 bg-linear-to-br from-slate-50 to-blue-50">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="mb-12 text-center">
              <h2 className="mb-4 text-4xl font-bold md:text-5xl text-slate-800">
                How to <span className="text-transparent bg-linear-to-r from-blue-500 to-purple-500 bg-clip-text">Call the API</span>
              </h2>
              <p className="max-w-2xl mx-auto text-lg text-slate-600">Three ways to interact — no setup required for public endpoints.</p>
            </motion.div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {[
                { title: 'Native fetch', icon: '🌐', badge: 'built-in', color: 'from-blue-500 to-cyan-500', badgeColor: 'bg-blue-100 text-blue-700', desc: 'Works in any modern browser and Node.js 18+. No installation needed.', code: `// GET\nconst res = await fetch('/api?test=status');\nconst data = await res.json();\n\n// POST\nconst res = await fetch('/api', {\n  method: 'POST',\n  headers: { 'Content-Type': 'application/json' },\n  body: JSON.stringify({ key: 'value' }),\n});` },
                { title: 'cURL', icon: '💻', badge: 'terminal', color: 'from-orange-500 to-amber-500', badgeColor: 'bg-orange-100 text-orange-700', desc: 'Available on macOS, Linux and Windows. Great for quick terminal testing.', code: `# GET\ncurl -X GET "/api?test=status"\n\n# POST with JSON body\ncurl -X POST "/api" \\\n  -H "Content-Type: application/json" \\\n  -d '{"key":"value"}'\n\n# Authenticated\ncurl -X GET "/api?test=analytics" \\\n  -H "Authorization: Bearer <key>"` },
                { title: 'axios', icon: '📦', badge: 'npm install axios', color: 'from-purple-500 to-violet-500', badgeColor: 'bg-purple-100 text-purple-700', desc: 'Popular HTTP client with automatic JSON parsing and interceptors.', code: `// GET\nconst { data } = await axios.get('/api', {\n  params: { test: 'status' },\n});\n\n// Authenticated POST\nconst { data } = await axios.post(\n  '/api?action=publish', payload,\n  { headers: { Authorization: \`Bearer \${key}\` } }\n);` },
              ].map((item, i) => (
                <motion.div key={item.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: i * 0.1 }} viewport={{ once: true }} className="overflow-hidden bg-white shadow-md rounded-2xl">
                  <div className={`h-1.5 bg-linear-to-r ${item.color}`} />
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl">{item.icon}</span>
                      <h3 className="text-lg font-bold text-slate-800">{item.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded font-mono ${item.badgeColor}`}>{item.badge}</span>
                    </div>
                    <p className="mb-4 text-sm text-slate-600">{item.desc}</p>
                    <div className="p-4 bg-slate-900 rounded-xl">
                      <pre className="overflow-x-auto font-mono text-xs whitespace-pre text-emerald-300">{item.code}</pre>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Response structure */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} viewport={{ once: true }} className="p-6 mt-8 bg-white border border-blue-100 shadow-sm rounded-2xl">
              <div className="flex items-start gap-4">
                <span className="text-2xl mt-0.5">💡</span>
                <div className="flex-1">
                  <h4 className="mb-2 font-bold text-slate-800">Response structure</h4>
                  <p className="mb-3 text-sm text-slate-600">Every response follows a consistent envelope. Check <code className="px-1 font-mono text-xs rounded bg-slate-100">success</code> first. Errors always include an <code className="px-1 font-mono text-xs rounded bg-slate-100">error</code> string. Auth failures return <code className="px-1 font-mono text-xs rounded bg-slate-100">401</code>.</p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {[
                      { label: '✓ Success (2xx)', color: 'text-green-400', code: `{\n  "success": true,\n  "test": "status",\n  "status": "online",\n  "timestamp": "2025-..."\n}` },
                      { label: '✗ Error (4xx)', color: 'text-red-400', code: `{\n  "success": false,\n  "error": "Invalid JSON\n           in request body."\n}` },
                      { label: '🔒 Unauthorized (401)', color: 'text-amber-400', code: `{\n  "success": false,\n  "error": "Unauthorized.\n  Provide a valid\n  Bearer token."\n}` },
                    ].map((ex) => (
                      <div key={ex.label} className="p-3 bg-slate-900 rounded-xl">
                        <p className={`text-xs font-semibold mb-1.5 ${ex.color}`}>{ex.label}</p>
                        <pre className={`text-xs font-mono ${ex.color === 'text-green-400' ? 'text-emerald-300' : ex.color === 'text-amber-400' ? 'text-amber-300' : 'text-red-300'}`}>{ex.code}</pre>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Endpoint cards ────────────────────────────────────────────────── */}
        <section className="py-20">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="mb-12 text-center">
              <h2 className="mb-4 text-4xl font-bold md:text-5xl text-slate-800">
                Live <span className="text-transparent bg-linear-to-r from-blue-500 to-purple-500 bg-clip-text">Endpoints</span>
              </h2>
              <p className="max-w-2xl mx-auto mb-8 text-lg text-slate-600">Run tests, inspect responses, and copy code examples inline.</p>
              <div className="flex flex-wrap justify-center gap-2">
                {TAGS.map((tag) => (
                  <button key={tag} onClick={() => setActiveTag(tag)}
                    className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${activeTag === tag ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-400'}`}>
                    {tag === 'Auth' ? '🔒 ' : ''}{tag}
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
                  <EndpointCard key={ep.id} ep={ep} result={results[ep.id]} onRun={runTest} apiKey={apiKey} unlocked={unlocked} />
                ))}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* ── Overview table ────────────────────────────────────────────────── */}
        <section className="py-20 bg-white">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="mb-12 text-center">
              <h2 className="mb-4 text-4xl font-bold md:text-5xl text-slate-800">
                Endpoint <span className="text-transparent bg-linear-to-r from-blue-500 to-purple-500 bg-clip-text">Overview</span>
              </h2>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="overflow-hidden border shadow-lg rounded-2xl border-slate-100">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-slate-50 border-slate-100">
                    <th className="px-6 py-4 text-xs font-semibold tracking-wide text-left uppercase text-slate-500">Method</th>
                    <th className="px-6 py-4 text-xs font-semibold tracking-wide text-left uppercase text-slate-500">Endpoint</th>
                    <th className="hidden px-6 py-4 text-xs font-semibold tracking-wide text-left uppercase text-slate-500 md:table-cell">Tag</th>
                    <th className="hidden px-6 py-4 text-xs font-semibold tracking-wide text-left uppercase text-slate-500 sm:table-cell">Auth</th>
                    <th className="hidden px-6 py-4 text-xs font-semibold tracking-wide text-left uppercase text-slate-500 lg:table-cell">Label</th>
                  </tr>
                </thead>
                <tbody>
                  {ENDPOINTS.map((ep, i) => (
                    <tr key={ep.id} className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${i % 2 === 0 ? '' : 'bg-slate-50/50'}`}>
                      <td className="px-6 py-3"><MethodBadge method={ep.method} /></td>
                      <td className="px-6 py-3"><code className="font-mono text-xs text-slate-700">{ep.endpoint}</code></td>
                      <td className="hidden px-6 py-3 md:table-cell"><TagBadge tag={ep.tag} /></td>
                      <td className="hidden px-6 py-3 sm:table-cell">
                        {ep.auth
                          ? <span className="text-xs font-semibold text-amber-600">🔒 Required</span>
                          : <span className="text-xs font-semibold text-green-600">🔓 Public</span>}
                      </td>
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
            <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
              <h2 className="mb-6 text-4xl font-bold text-white md:text-5xl">
                Ready to <span className="text-transparent bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text">Integrate?</span>
              </h2>
              <p className="max-w-3xl mx-auto mb-8 text-xl leading-relaxed text-slate-200">
                Need a custom API built for your project? Let&apos;s talk about your requirements.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 font-semibold text-white transition-all duration-300 shadow-lg bg-linear-to-r from-blue-500 to-purple-500 rounded-xl hover:from-blue-600 hover:to-purple-600 hover:shadow-xl">
                  Get in Touch
                </motion.button>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 font-semibold text-white transition-all duration-300 border-2 border-white/30 rounded-xl hover:bg-white/10 backdrop-blur-sm">
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