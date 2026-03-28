'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, User } from 'lucide-react';
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
    <div className="overflow-hidden border rounded-2xl border-white/8 bg-white/2">
      {/* Table header */}
      <div className="grid grid-cols-4 px-5 py-3 border-b border-white/8 bg-white/2">
        {['Gebruiker', 'Rol', 'Lid sinds', 'Acties'].map((h) => (
          <p key={h} className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{h}</p>
        ))}
      </div>

      <div className="divide-y divide-white/5">
        {users.map((u, i) => (
          <motion.div
            key={u.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.03 }}
            className="grid items-center grid-cols-4 px-5 py-4 transition-colors hover:bg-white/2"
          >
            {/* User */}
            <div className="flex items-center min-w-0 gap-3">
              <div className="flex items-center justify-center text-sm font-bold text-white rounded-full w-9 h-9 bg-linear-to-br from-blue-500 to-purple-600 shrink-0">
                {(u.full_name ?? u.email)[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {u.full_name ?? '—'}
                  {u.id === currentUserId && <span className="ml-2 text-[11px] text-blue-400 font-normal">(jij)</span>}
                </p>
                <p className="text-xs truncate text-slate-500">{u.email}</p>
              </div>
            </div>

            {/* Role */}
            <div>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                u.role === 'admin'
                  ? 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                  : 'bg-slate-500/10 border-slate-500/20 text-slate-400'
              }`}>
                {u.role === 'admin' ? <Shield size={10} /> : <User size={10} />}
                {u.role === 'admin' ? 'Admin' : 'Gebruiker'}
              </span>
            </div>

            {/* Date */}
            <p className="text-sm text-slate-500">
              {new Date(u.created_at).toLocaleDateString('nl-BE')}
            </p>

            {/* Actions */}
            <div>
              {u.id !== currentUserId && (
                u.role !== 'admin' ? (
                  <button
                    onClick={() => updateRole(u.id, 'admin')}
                    disabled={saving === u.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-400 bg-purple-500/10 border border-purple-500/20 rounded-lg hover:bg-purple-500/15 transition-colors disabled:opacity-50"
                  >
                    <Shield size={11} />
                    {saving === u.id ? 'Opslaan...' : 'Admin maken'}
                  </button>
                ) : (
                  <button
                    onClick={() => updateRole(u.id, 'user')}
                    disabled={saving === u.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-400 bg-slate-500/10 border border-slate-500/20 rounded-lg hover:bg-slate-500/15 transition-colors disabled:opacity-50"
                  >
                    <User size={11} />
                    {saving === u.id ? 'Opslaan...' : 'Gebruiker maken'}
                  </button>
                )
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}