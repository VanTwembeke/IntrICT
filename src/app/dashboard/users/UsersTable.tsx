'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, User} from 'lucide-react';
import type { Profile, UserRole } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';

interface Props {
  users: Profile[];
  currentUserId: string;
}

export default function UsersTable({ users: initial, currentUserId }: Props) {
  const [users, setUsers] = useState(initial);
  const [saving, setSaving] = useState<string | null>(null);

  const updateRole = async (userId: string, role: UserRole) => {
    setSaving(userId);
    const supabase = createClient();
    await supabase.from('profiles').update({ role }).eq('id', userId);
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
    setSaving(null);
  };

  return (
    <div className="overflow-hidden bg-white border shadow-sm rounded-2xl border-slate-100">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-slate-50 border-slate-100">
              <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left uppercase text-slate-500">
                Gebruiker
              </th>
              <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left uppercase text-slate-500">
                Rol
              </th>
              <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left uppercase text-slate-500">
                Lid sinds
              </th>
              <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left uppercase text-slate-500">
                Acties
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {users.map((u) => (
              <motion.tr
                key={u.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="transition-colors hover:bg-slate-50"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center text-sm font-bold text-white rounded-full w-9 h-9 bg-linear-to-br from-blue-500 to-purple-500 shrink-0">
                      {(u.full_name ?? u.email)[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {u.full_name ?? '—'}
                        {u.id === currentUserId && (
                          <span className="ml-2 text-xs text-blue-500">(jij)</span>
                        )}
                      </p>
                      <p className="text-xs text-slate-400">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                      u.role === 'admin'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {u.role === 'admin' ? <Shield size={11} /> : <User size={11} />}
                    {u.role === 'admin' ? 'Admin' : 'Gebruiker'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">
                  {new Date(u.created_at).toLocaleDateString('nl-BE')}
                </td>
                <td className="px-6 py-4">
                  {u.id !== currentUserId && (
                    <div className="flex items-center gap-2">
                      {u.role !== 'admin' ? (
                        <button
                          onClick={() => updateRole(u.id, 'admin')}
                          disabled={saving === u.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors disabled:opacity-60"
                        >
                          <Shield size={12} />
                          {saving === u.id ? 'Opslaan...' : 'Admin maken'}
                        </button>
                      ) : (
                        <button
                          onClick={() => updateRole(u.id, 'user')}
                          disabled={saving === u.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-60"
                        >
                          <User size={12} />
                          {saving === u.id ? 'Opslaan...' : 'Gebruiker maken'}
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
