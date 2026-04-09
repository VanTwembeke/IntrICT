'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, User, X, Save, Users,
  Mail, Calendar, Edit2, ChevronRight,
} from 'lucide-react';
import type { Profile, UserRole } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';

interface Props {
  users: Profile[];
  currentUserId: string;
}

interface EditFormState {
  full_name: string;
  phone: string;
  company: string;
  vat_number: string;
  address: string;
  postal_code: string;
  city: string;
  country: string;
  profile_picture_url: string;
  public_username: string;
  customer_number: string;
  role: UserRole;
}

export default function UsersTable({ users: initial, currentUserId }: Props) {
  const [users, setUsers]       = useState(initial);
  const [saving, setSaving]     = useState<string | null>(null);
  const [editUser, setEditUser] = useState<Profile | null>(null);

  // Edit form state
  const [editForm, setEditForm] = useState<EditFormState>({
    full_name: '',
    phone: '',
    company: '',
    vat_number: '',
    address: '',
    postal_code: '',
    city: '',
    country: '',
    profile_picture_url: '',
    public_username: '',
    customer_number: '',
    role: 'user',
  });
  const [editSaving, setEditSaving] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);

  const openEdit = (u: Profile) => {
    setEditUser(u);
    setEditForm({
      full_name: u.full_name ?? '',
      phone: u.phone ?? '',
      company: u.company ?? '',
      vat_number: u.vat_number ?? '',
      address: u.address ?? '',
      postal_code: u.postal_code ?? '',
      city: u.city ?? '',
      country: u.country ?? '',
      profile_picture_url: u.profile_picture_url ?? '',
      public_username: u.public_username ?? '',
      customer_number: u.customer_number?.toString() ?? '',
      role: u.role as UserRole,
    });
    setEditSuccess(false);
  };

  const closeEdit = () => {
    setEditUser(null);
    setEditSuccess(false);
  };

  const handleSaveEdit = async () => {
    if (!editUser) return;
    setEditSaving(true);
    const supabase = createClient();
    await supabase.from('profiles').update({
      full_name: editForm.full_name || null,
      phone: editForm.phone || null,
      company: editForm.company || null,
      vat_number: editForm.vat_number || null,
      address: editForm.address || null,
      postal_code: editForm.postal_code || null,
      city: editForm.city || null,
      country: editForm.country || null,
      profile_picture_url: editForm.profile_picture_url || null,
      public_username: editForm.public_username || null,
      customer_number: editForm.customer_number ? Number(editForm.customer_number) : null,
      role: editForm.role,
    }).eq('id', editUser.id);

    setUsers((prev) =>
      prev.map((u) =>
        u.id === editUser.id
          ? {
              ...u,
              full_name: editForm.full_name || null,
              phone: editForm.phone || null,
              company: editForm.company || null,
              vat_number: editForm.vat_number || null,
              address: editForm.address || null,
              postal_code: editForm.postal_code || null,
              city: editForm.city || null,
              country: editForm.country || null,
              profile_picture_url: editForm.profile_picture_url || null,
              public_username: editForm.public_username || null,
              customer_number: editForm.customer_number ? Number(editForm.customer_number) : null,
              role: editForm.role,
            }
          : u
      )
    );
    setEditSaving(false);
    setEditSuccess(true);
    setTimeout(() => closeEdit(), 1500);
  };

  const updateRole = async (userId: string, role: UserRole) => {
    setSaving(userId);
    const supabase = createClient();
    await supabase.from('profiles').update({ role }).eq('id', userId);
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
    setSaving(null);
  };

  const adminCount = users.filter((u) => u.role === 'admin').length;
  const userCount  = users.filter((u) => u.role !== 'admin').length;

  return (
    <div className="p-6 lg:p-8">

      {/* Page header */}
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">
          Administrator
        </p>
        <h1 className="text-3xl font-bold text-slate-900">Gebruikers</h1>
        <p className="text-sm text-slate-500 mt-1">
          {adminCount} admin{adminCount !== 1 ? 's' : ''} · {userCount} gebruiker{userCount !== 1 ? 's' : ''}
        </p>
      </div>

      {/* ── Edit modal ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {editUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) closeEdit(); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md overflow-hidden bg-white shadow-2xl rounded-3xl"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-linear-to-r from-blue-50 to-purple-50">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 font-bold text-white rounded-full bg-linear-to-br from-blue-500 to-purple-500">
                    {(editUser.full_name ?? editUser.email)[0].toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-800">Gebruiker bewerken</h2>
                    <p className="text-xs text-slate-500">{editUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={closeEdit}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {editSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-3 py-6 text-center"
                  >
                    <div className="flex items-center justify-center rounded-full w-14 h-14 bg-green-50">
                      <Save size={24} className="text-green-500" />
                    </div>
                    <p className="font-semibold text-slate-800">Wijzigingen opgeslagen!</p>
                  </motion.div>
                ) : (
                  <>
                    {/* Full Name */}
                    <div>
                      <label className="block mb-1.5 text-sm font-semibold text-slate-700">Volledige naam</label>
                      <input
                        type="text"
                        value={editForm.full_name}
                        onChange={(e) => setEditForm({...editForm, full_name: e.target.value})}
                        placeholder="Naam van de gebruiker"
                        className="w-full px-4 py-3 transition-all border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-slate-800"
                      />
                    </div>

                    {/* Email (read-only) */}
                    <div>
                      <label className="block mb-1.5 text-sm font-semibold text-slate-700">
                        E-mailadres <span className="ml-1.5 text-xs font-normal text-slate-400">(alleen-lezen)</span>
                      </label>
                      <input
                        type="email"
                        value={editUser?.email ?? ''}
                        disabled
                        className="w-full px-4 py-3 border-2 cursor-not-allowed border-slate-100 rounded-xl bg-slate-50 text-slate-400"
                      />
                    </div>

                    {/* Profile Picture URL */}
                    <div>
                      <label className="block mb-1.5 text-sm font-semibold text-slate-700">Profiel foto URL</label>
                      <input
                        type="url"
                        value={editForm.profile_picture_url}
                        onChange={(e) => setEditForm({ ...editForm, profile_picture_url: e.target.value })}
                        placeholder="https://voorbeeld.nl/foto.jpg"
                        className="w-full px-4 py-3 transition-all border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-slate-800"
                      />
                    </div>

                    {/* Public Username */}
                    <div>
                      <label className="block mb-1.5 text-sm font-semibold text-slate-700">Publieke gebruikersnaam</label>
                      <input
                        type="text"
                        value={editForm.public_username}
                        onChange={(e) => setEditForm({ ...editForm, public_username: e.target.value })}
                        placeholder="gebruikersnaam"
                        className="w-full px-4 py-3 transition-all border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-slate-800"
                      />
                      <p className="mt-1 text-xs text-slate-400">Openbare URL: intrict.com/user/{editForm.public_username || 'gebruikersnaam'}</p>
                    </div>

                    {/* Customer Number */}
                    <div>
                      <label className="block mb-1.5 text-sm font-semibold text-slate-700">Klantnummer</label>
                      <input
                        type="text"
                        value={editForm.customer_number}
                        onChange={(e) => setEditForm({ ...editForm, customer_number: e.target.value })}
                        placeholder="100001"
                        className="w-full px-4 py-3 transition-all border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-slate-800"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block mb-1.5 text-sm font-semibold text-slate-700">Telefoonnummer</label>
                      <input
                        type="tel"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                        placeholder="+31 6 12345678"
                        className="w-full px-4 py-3 transition-all border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-slate-800"
                      />
                    </div>

                    {/* Company */}
                    <div>
                      <label className="block mb-1.5 text-sm font-semibold text-slate-700">Bedrijfsnaam</label>
                      <input
                        type="text"
                        value={editForm.company}
                        onChange={(e) => setEditForm({...editForm, company: e.target.value})}
                        placeholder="Bedrijfsnaam"
                        className="w-full px-4 py-3 transition-all border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-slate-800"
                      />
                    </div>

                    {/* VAT Number */}
                    <div>
                      <label className="block mb-1.5 text-sm font-semibold text-slate-700">BTW-nummer</label>
                      <input
                        type="text"
                        value={editForm.vat_number}
                        onChange={(e) => setEditForm({...editForm, vat_number: e.target.value})}
                        placeholder="NL123456789B01"
                        className="w-full px-4 py-3 transition-all border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-slate-800"
                      />
                    </div>

                    {/* Address */}
                    <div>
                      <label className="block mb-1.5 text-sm font-semibold text-slate-700">Adres</label>
                      <input
                        type="text"
                        value={editForm.address}
                        onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                        placeholder="Straatnaam 123"
                        className="w-full px-4 py-3 transition-all border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-slate-800"
                      />
                    </div>

                    {/* Postal Code */}
                    <div>
                      <label className="block mb-1.5 text-sm font-semibold text-slate-700">Postcode</label>
                      <input
                        type="text"
                        value={editForm.postal_code}
                        onChange={(e) => setEditForm({...editForm, postal_code: e.target.value})}
                        placeholder="1234 AB"
                        className="w-full px-4 py-3 transition-all border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-slate-800"
                      />
                    </div>

                    {/* City */}
                    <div>
                      <label className="block mb-1.5 text-sm font-semibold text-slate-700">Plaats</label>
                      <input
                        type="text"
                        value={editForm.city}
                        onChange={(e) => setEditForm({...editForm, city: e.target.value})}
                        placeholder="Amsterdam"
                        className="w-full px-4 py-3 transition-all border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-slate-800"
                      />
                    </div>

                    {/* Country */}
                    <div>
                      <label className="block mb-1.5 text-sm font-semibold text-slate-700">Land</label>
                      <input
                        type="text"
                        value={editForm.country}
                        onChange={(e) => setEditForm({...editForm, country: e.target.value})}
                        placeholder="Nederland"
                        className="w-full px-4 py-3 transition-all border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-slate-800"
                      />
                    </div>

                    {/* Role */}
                    <div>
                      <label className="block mb-1.5 text-sm font-semibold text-slate-700">Rol</label>
                      <div className="grid grid-cols-2 gap-3">
                        {(['user', 'admin'] as UserRole[]).map((r) => (
                          <button
                            key={r}
                            onClick={() => setEditForm({...editForm, role: r})}
                            className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                              editForm.role === r
                                ? r === 'admin'
                                  ? 'border-purple-400 bg-purple-50 text-purple-700'
                                  : 'border-blue-400 bg-blue-50 text-blue-700'
                                : 'border-slate-200 text-slate-500 hover:border-slate-300'
                            }`}
                          >
                            {r === 'admin' ? <Shield size={15} /> : <User size={15} />}
                            {r === 'admin' ? 'Admin' : 'Gebruiker'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={closeEdit}
                        className="flex-1 py-3 text-sm font-semibold transition-all border-2 text-slate-600 border-slate-200 rounded-xl hover:bg-slate-50"
                      >
                        Annuleren
                      </button>
                      <motion.button
                        whileHover={{ scale: editSaving ? 1 : 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSaveEdit}
                        disabled={editSaving}
                        className="flex items-center justify-center flex-1 gap-2 py-3 text-sm font-semibold text-white transition-all shadow-md bg-linear-to-r from-blue-500 to-purple-500 rounded-xl hover:from-blue-600 hover:to-purple-600 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <Save size={14} />
                        {editSaving ? 'Opslaan...' : 'Opslaan'}
                      </motion.button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main content ────────────────────────────────────────────────── */}
      <div>
        <div>

          {/* Stats strip */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Totaal', value: users.length, color: 'text-slate-800' },
              { label: 'Admins', value: adminCount, color: 'text-purple-600' },
              { label: 'Gebruikers', value: userCount, color: 'text-blue-600' },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="p-5 bg-white border shadow-sm rounded-2xl border-slate-100"
              >
                <p className="mb-1 text-xs font-semibold tracking-wider uppercase text-slate-400">{s.label}</p>
                <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Table */}
          <div className="overflow-hidden bg-white border shadow-sm rounded-2xl border-slate-100">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-slate-50 border-slate-100">
                    {['Gebruiker', 'Rol', 'Lid sinds', 'Acties'].map((h) => (
                      <th key={h} className="px-6 py-4 text-xs font-semibold tracking-wider text-left uppercase text-slate-500">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {users.map((u, i) => (
                    <motion.tr
                      key={u.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="transition-colors hover:bg-slate-50/70 group"
                    >
                      {/* User */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center text-sm font-bold text-white rounded-full w-9 h-9 bg-linear-to-br from-blue-500 to-purple-500 shrink-0">
                            {(u.full_name ?? u.email)[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                              {u.full_name ?? '—'}
                              {u.id === currentUserId && (
                                <span className="text-xs font-medium text-blue-400">(jij)</span>
                              )}
                            </p>
                            <p className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                              <Mail size={10} />
                              {u.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                          u.role === 'admin'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {u.role === 'admin' ? <Shield size={11} /> : <User size={11} />}
                          {u.role === 'admin' ? 'Admin' : 'Gebruiker'}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-slate-500">
                          <Calendar size={12} className="text-slate-300" />
                          {new Date(u.created_at).toLocaleDateString('nl-BE')}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {/* Edit button — always visible */}
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openEdit(u)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                          >
                            <Edit2 size={12} />
                            Bewerken
                          </motion.button>

                          {/* Role toggle — only for other users */}
                          {u.id !== currentUserId && (
                            u.role !== 'admin' ? (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => updateRole(u.id, 'admin')}
                                disabled={saving === u.id}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors disabled:opacity-60"
                              >
                                <Shield size={12} />
                                {saving === u.id ? 'Opslaan...' : 'Admin maken'}
                              </motion.button>
                            ) : (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => updateRole(u.id, 'user')}
                                disabled={saving === u.id}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-60"
                              >
                                <User size={12} />
                                {saving === u.id ? 'Opslaan...' : 'Gebruiker maken'}
                              </motion.button>
                            )
                          )}

                          <ChevronRight size={14} className="ml-auto transition-colors text-slate-200 group-hover:text-slate-400" />
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}