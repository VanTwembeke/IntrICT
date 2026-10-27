'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Users, Check, Trash2 } from 'lucide-react';

interface Subscriber {
  id: string;
  email: string;
  is_active: boolean;
  subscribed_at: string;
  unsubscribed_at: string | null;
}

function isSubscriber(value: unknown): value is Subscriber {
  if (!value || typeof value !== 'object') return false;
  const row = value as Record<string, unknown>;
  return typeof row.id === 'string' && row.id.length > 0 &&
    typeof row.email === 'string' && row.email.trim().length > 0 &&
    typeof row.is_active === 'boolean' &&
    typeof row.subscribed_at === 'string' && Number.isFinite(Date.parse(row.subscribed_at)) &&
    (row.unsubscribed_at === null || (typeof row.unsubscribed_at === 'string' && Number.isFinite(Date.parse(row.unsubscribed_at))));
}

export default function AbonneesClient() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [loadError, setLoadError] = useState(false);
  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const response = await fetch('/api/admin/newsletter/subscribers', { cache: 'no-store' });
      if (!response.ok) throw new Error('Source unavailable');
      const data = await response.json();
      if (!Array.isArray(data) || !data.every(isSubscriber) || new Set(data.map((row) => row.id)).size !== data.length) throw new Error('Invalid source');
      setSubscribers(data);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const [actionError, setActionError] = useState('');
  const [notice, setNotice] = useState('');
  const deleteLock = useRef(false);
  const handleDelete = async (id: string) => {
    if (deleteLock.current) return;
    const target = subscribers.find((s) => s.id === id);
    if (!target || !confirm(`Abonnee ${target.email} definitief verwijderen? Dit kan niet ongedaan worden gemaakt.`)) return;
    deleteLock.current = true;
    setActionError('');
    setNotice('');
    setDeletingId(id);
    try {
      const response = await fetch('/api/admin/newsletter/subscribers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!response.ok || (await response.json())?.ok !== true) throw new Error('Unconfirmed deletion');
      setNotice('Abonnee verwijderd.');
      setSubscribers((prev) => prev.filter((s) => s.id !== id));
    } catch {
      setActionError('Verwijdering niet bevestigd. De abonnee blijft zichtbaar; controleer de status voordat je opnieuw probeert.');
    } finally {
      deleteLock.current = false;
      setDeletingId(null);
    }
  };

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const query = search.trim().toLocaleLowerCase('nl-BE');
  const filtered = subscribers.filter((row) => row.email.toLocaleLowerCase('nl-BE').includes(query) &&
    (status === 'all' || (status === 'active' ? row.is_active : !row.is_active)));
  const active = subscribers.filter((s) => s.is_active);
  const inactive = subscribers.filter((s) => !s.is_active);

  return (
    <div className="min-w-0 p-4 sm:p-6 lg:p-8 max-w-3xl">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-500 mb-1">Admin</p>
        <h1 className="text-3xl font-bold text-slate-900">Abonnees</h1>
        <p className="text-sm text-slate-500 mt-1">Overzicht van nieuwsbrief-abonnees.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-slate-500 mb-1">Actief ingeschreven</p>
          <p className="text-2xl font-bold text-slate-900">{loading || loadError ? '…' : active.length}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-slate-500 mb-1">Uitgeschreven</p>
          <p className="text-2xl font-bold text-slate-900">{loading || loadError ? '…' : inactive.length}</p>
        </div>
      </div>

      {!loading && !loadError && subscribers.length > 0 && <div className="mb-6 space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="min-w-0 text-sm font-medium text-slate-700">
            Zoek op e-mailadres
            <input type="search" value={search} onChange={(event) => setSearch(event.target.value)}
              className="mt-1 min-h-11 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 text-slate-900" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Filter op status
            <select value={status} onChange={(event) => setStatus(event.target.value)}
              className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900">
              <option value="all">Alle statussen</option>
              <option value="active">Actief</option>
              <option value="inactive">Uitgeschreven</option>
            </select>
          </label>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600">
          <p aria-live="polite">{filtered.length} van {subscribers.length} abonnees</p>
          {(search || status !== 'all') && <button type="button" onClick={() => { setSearch(''); setStatus('all'); }}
            className="min-h-11 rounded-lg px-3 font-semibold text-blue-700 underline">Filters wissen</button>}
        </div>
      </div>}
      {actionError && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">{actionError}</p>}
      <p role="status" className="mb-4 text-sm text-slate-700">{notice}</p>
      {loadError && <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        <p>Abonnees konden niet worden geladen.</p>
        <button type="button" onClick={() => void load()} className="mt-2 font-semibold underline">Opnieuw proberen</button>
      </div>}
      {loading && (
        <div className="flex items-center gap-2 p-8 bg-white border border-slate-200 rounded-2xl justify-center text-sm text-slate-400">
          <span className="w-4 h-4 border-2 border-slate-200 border-t-blue-400 rounded-full animate-spin" />
          Laden…
        </div>
      )}

      {!loading && !loadError && subscribers.length === 0 && (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl">
          <Users size={32} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Nog geen abonnees.</p>
        </div>
      )}

      {!loading && !loadError && subscribers.length > 0 && filtered.length === 0 && (
        <p className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">Geen abonnees voor deze filters.</p>
      )}
      {!loading && !loadError && filtered.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full table-fixed text-sm">
            <caption className="sr-only">Nieuwsbrief-abonnees met status en verwijderactie</caption>
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th scope="col" className="text-left px-2 sm:px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">E-mail</th>
                <th scope="col" className="w-28 sm:w-36 text-left px-2 sm:px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="text-left px-2 sm:px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Ingeschreven op</th>
                <th scope="col" className="w-14"><span className="sr-only">Acties</span></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="break-all px-2 sm:px-5 py-3 font-medium text-slate-800">{s.email}</td>
                  <td className="px-2 sm:px-5 py-3">
                    {s.is_active
                      ? <span className="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full"><Check size={10} />Actief</span>
                      : <span className="inline-flex items-center gap-1 text-xs font-semibold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">Uitgeschreven</span>
                    }
                  </td>
                  <td className="px-5 py-3 text-slate-400 text-xs hidden sm:table-cell">
                    {new Date(s.subscribed_at).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-1 py-3">
                    <button
                      onClick={() => handleDelete(s.id)}
                      disabled={deletingId !== null}
                      className="min-h-11 min-w-11 p-2 text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                      aria-label={`Verwijder ${s.email}`}
                      title="Verwijderen"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
