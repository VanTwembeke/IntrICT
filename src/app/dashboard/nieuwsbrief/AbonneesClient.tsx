'use client';

import { useState, useEffect } from 'react';
import { Users, Check, Trash2 } from 'lucide-react';

interface Subscriber {
  id: string;
  email: string;
  is_active: boolean;
  subscribed_at: string;
  unsubscribed_at: string | null;
}

export default function AbonneesClient() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/newsletter/subscribers')
      .then((r) => r.json())
      .then((data) => setSubscribers(data))
      .catch(() => setSubscribers([]))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Abonnee definitief verwijderen?')) return;
    setDeletingId(id);
    try {
      await fetch('/api/admin/newsletter/subscribers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      setSubscribers((prev) => prev.filter((s) => s.id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  const active = subscribers.filter((s) => s.is_active);
  const inactive = subscribers.filter((s) => !s.is_active);

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-500 mb-1">Admin</p>
        <h1 className="text-3xl font-bold text-slate-900">Abonnees</h1>
        <p className="text-sm text-slate-500 mt-1">Overzicht van nieuwsbrief-abonnees.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-slate-500 mb-1">Actief ingeschreven</p>
          <p className="text-2xl font-bold text-slate-900">{loading ? '…' : active.length}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-slate-500 mb-1">Uitgeschreven</p>
          <p className="text-2xl font-bold text-slate-900">{loading ? '…' : inactive.length}</p>
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-2 p-8 bg-white border border-slate-200 rounded-2xl justify-center text-sm text-slate-400">
          <span className="w-4 h-4 border-2 border-slate-200 border-t-blue-400 rounded-full animate-spin" />
          Laden…
        </div>
      )}

      {!loading && subscribers.length === 0 && (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl">
          <Users size={32} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Nog geen abonnees.</p>
        </div>
      )}

      {!loading && subscribers.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">E-mail</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Ingeschreven op</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {subscribers.map((s) => (
                <tr key={s.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-slate-800">{s.email}</td>
                  <td className="px-5 py-3">
                    {s.is_active
                      ? <span className="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full"><Check size={10} />Actief</span>
                      : <span className="inline-flex items-center gap-1 text-xs font-semibold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">Uitgeschreven</span>
                    }
                  </td>
                  <td className="px-5 py-3 text-slate-400 text-xs hidden sm:table-cell">
                    {new Date(s.subscribed_at).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-3 py-3">
                    <button
                      onClick={() => handleDelete(s.id)}
                      disabled={deletingId === s.id}
                      className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
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
