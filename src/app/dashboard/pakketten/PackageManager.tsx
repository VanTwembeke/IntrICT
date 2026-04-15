'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  Eye,
  EyeOff,
  Star,
  GripVertical,
  Check,
} from 'lucide-react';
import type { Package, BillingInterval } from '@/lib/types';

// ─── Color options ────────────────────────────────────────────────────────────

const COLOR_OPTIONS = [
  { id: 'blue',   label: 'Blauw',  dot: 'bg-blue-500' },
  { id: 'purple', label: 'Paars',  dot: 'bg-purple-500' },
  { id: 'indigo', label: 'Indigo', dot: 'bg-indigo-500' },
  { id: 'green',  label: 'Groen',  dot: 'bg-green-500' },
  { id: 'orange', label: 'Oranje', dot: 'bg-orange-500' },
];

const colorDot: Record<string, string> = {
  blue:   'bg-blue-500',
  purple: 'bg-purple-500',
  indigo: 'bg-indigo-500',
  green:  'bg-green-500',
  orange: 'bg-orange-500',
};

// ─── Form state ───────────────────────────────────────────────────────────────

interface FormState {
  name: string;
  price: string;
  description: string;
  featuresText: string; // one per line
  color: string;
  highlight: boolean;
  active: boolean;
  sort_order: string;
  billing_interval: BillingInterval;
}

const EMPTY_FORM: FormState = {
  name: '',
  price: '',
  description: '',
  featuresText: '',
  color: 'blue',
  highlight: false,
  active: true,
  sort_order: '0',
  billing_interval: 'one_time',
};

function packageToForm(pkg: Package): FormState {
  return {
    name: pkg.name,
    price: String(pkg.price),
    description: pkg.description,
    featuresText: pkg.features.join('\n'),
    color: pkg.color,
    highlight: pkg.highlight,
    active: pkg.active,
    sort_order: String(pkg.sort_order),
    billing_interval: pkg.billing_interval ?? 'one_time',
  };
}

function formToPayload(form: FormState) {
  return {
    name: form.name.trim(),
    price: Number(form.price) || 0,
    description: form.description.trim(),
    features: form.featuresText
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean),
    color: form.color,
    highlight: form.highlight,
    active: form.active,
    sort_order: Number(form.sort_order) || 0,
    billing_interval: form.billing_interval,
  };
}

// ─── Input helpers ────────────────────────────────────────────────────────────

const inputClass =
  'w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-slate-800 bg-white text-sm transition-all placeholder:text-slate-400';

const labelClass = 'block text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1.5';

// ─── Package card ─────────────────────────────────────────────────────────────

function PackageCard({
  pkg,
  onEdit,
  onDelete,
  onToggleActive,
}: {
  pkg: Package;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className={`bg-white border rounded-2xl p-5 shadow-sm transition-all ${
        pkg.active ? 'border-slate-200' : 'border-slate-200 opacity-60'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <GripVertical size={16} className="text-slate-300 shrink-0 cursor-grab" />
          <div
            className={`w-3 h-3 rounded-full shrink-0 ${colorDot[pkg.color] ?? 'bg-slate-400'}`}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-bold text-slate-900 truncate">{pkg.name}</p>
              {pkg.highlight && (
                <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-bold bg-yellow-100 text-yellow-700 rounded-full">
                  <Star size={10} />
                  Populair
                </span>
              )}
              {!pkg.active && (
                <span className="px-2 py-0.5 text-xs font-semibold bg-slate-100 text-slate-500 rounded-full">
                  Inactief
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              €{pkg.price.toLocaleString('nl-BE')} · {pkg.features.length} functies
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onToggleActive}
            title={pkg.active ? 'Deactiveren' : 'Activeren'}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
          >
            {pkg.active ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
          <button
            onClick={onEdit}
            className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={onDelete}
            className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {pkg.description && (
        <p className="text-xs text-slate-400 mt-3 ml-10 line-clamp-2">{pkg.description}</p>
      )}
    </motion.div>
  );
}

// ─── Edit/Create modal ────────────────────────────────────────────────────────

function PackageModal({
  initial,
  onSave,
  onClose,
  saving,
}: {
  initial: FormState;
  onSave: (form: FormState) => void;
  onClose: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<FormState>(initial);

  const set = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const val = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: val }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex min-h-full items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 16 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-8"
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">
            {initial.name ? `${initial.name} bewerken` : 'Nieuw pakket'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave(form);
          }}
          className="p-6 space-y-5"
        >
          {/* Name + price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Naam</label>
              <input
                required
                type="text"
                value={form.name}
                onChange={set('name')}
                placeholder="Starter"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Prijs (€)</label>
              <input
                required
                type="number"
                min="0"
                value={form.price}
                onChange={set('price')}
                placeholder="499"
                className={inputClass}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className={labelClass}>Beschrijving</label>
            <textarea
              required
              rows={2}
              value={form.description}
              onChange={set('description')}
              placeholder="Korte beschrijving van het pakket..."
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* Features */}
          <div>
            <label className={labelClass}>
              Functies <span className="normal-case text-slate-400 font-normal">(één per regel)</span>
            </label>
            <textarea
              rows={6}
              value={form.featuresText}
              onChange={set('featuresText')}
              placeholder={'5 pagina statische website\nResponsief design\nSSL-certificaat'}
              className={`${inputClass} resize-none font-mono text-xs`}
            />
          </div>

          {/* Color */}
          <div>
            <label className={labelClass}>Kleur</label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, color: c.id }))}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
                    form.color === c.id
                      ? 'border-blue-400 bg-blue-50 text-blue-700'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <span className={`w-3 h-3 rounded-full ${c.dot}`} />
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Billing interval */}
          <div>
            <label className={labelClass}>Factureringsinterval</label>
            <div className="flex gap-2">
              {([
                { id: 'one_time', label: 'Eenmalig' },
                { id: 'monthly',  label: 'Maandelijks' },
                { id: 'yearly',   label: 'Jaarlijks' },
              ] as { id: BillingInterval; label: string }[]).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, billing_interval: opt.id }))}
                  className={`flex-1 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    form.billing_interval === opt.id
                      ? 'border-blue-400 bg-blue-50 text-blue-700'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sort order */}
          <div>
            <label className={labelClass}>Volgorde</label>
            <input
              type="number"
              min="0"
              value={form.sort_order}
              onChange={set('sort_order')}
              placeholder="0"
              className={`${inputClass} w-24`}
            />
          </div>

          {/* Toggles */}
          <div className="flex flex-col gap-3 pt-1">
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setForm((p) => ({ ...p, highlight: !p.highlight }))}
                className={`relative w-10 h-6 rounded-full transition-colors ${
                  form.highlight ? 'bg-yellow-400' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    form.highlight ? 'translate-x-4' : ''
                  }`}
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">Markeer als populair</p>
                <p className="text-xs text-slate-400">Toont &quot;Populairste keuze&quot; badge</p>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setForm((p) => ({ ...p, active: !p.active }))}
                className={`relative w-10 h-6 rounded-full transition-colors ${
                  form.active ? 'bg-green-400' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    form.active ? 'translate-x-4' : ''
                  }`}
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">Actief / Zichtbaar</p>
                <p className="text-xs text-slate-400">Inactieve pakketten zijn niet zichtbaar voor gebruikers</p>
              </div>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
            >
              Annuleren
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-70 transition-all"
            >
              {saving ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <Save size={15} />
              )}
              {saving ? 'Opslaan...' : 'Opslaan'}
            </button>
          </div>
        </form>
      </motion.div>
      </div>
    </motion.div>
  );
}

// ─── Delete confirm ───────────────────────────────────────────────────────────

function DeleteConfirm({
  name,
  onConfirm,
  onCancel,
  deleting,
}: {
  name: string;
  onConfirm: () => void;
  onCancel: () => void;
  deleting: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-red-50 rounded-xl">
            <Trash2 size={20} className="text-red-500" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Pakket verwijderen?</h2>
        </div>
        <p className="text-sm text-slate-500 mb-6">
          Weet je zeker dat je <strong>{name}</strong> wil verwijderen? Dit kan niet ongedaan worden gemaakt.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
          >
            Annuleren
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 disabled:opacity-70 transition-all"
          >
            {deleting ? (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <Trash2 size={15} />
            )}
            {deleting ? 'Verwijderen...' : 'Verwijderen'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  initialPackages: Package[];
}

export default function PackageManager({ initialPackages }: Props) {
  const [packages, setPackages] = useState<Package[]>(initialPackages);
  const [editing, setEditing] = useState<Package | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Package | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async (form: FormState) => {
    setSaving(true);
    try {
      const payload = formToPayload(form);
      if (editing) {
        const res = await fetch(`/api/packages/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const updated = await res.json();
        if (!res.ok) throw new Error(updated.error ?? 'Fout bij opslaan');
        setPackages((prev) => prev.map((p) => (p.id === editing.id ? updated : p)));
        setEditing(null);
        showToast('Pakket bijgewerkt');
      } else {
        const res = await fetch('/api/packages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const created = await res.json();
        if (!res.ok) throw new Error(created.error ?? 'Fout bij aanmaken');
        setPackages((prev) =>
          [...prev, created].sort((a, b) => a.sort_order - b.sort_order)
        );
        setCreating(false);
        showToast('Pakket aangemaakt');
      }
    } catch (err) {
      alert(String(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setDeletingId(true);
    try {
      const res = await fetch(`/api/packages/${deleting.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Fout bij verwijderen');
      setPackages((prev) => prev.filter((p) => p.id !== deleting.id));
      setDeleting(null);
      showToast('Pakket verwijderd');
    } catch (err) {
      alert(String(err));
    } finally {
      setDeletingId(false);
    }
  };

  const handleToggleActive = async (pkg: Package) => {
    try {
      const updated = { ...pkg, active: !pkg.active };
      const res = await fetch(`/api/packages/${pkg.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formToPayload(packageToForm(updated))),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Fout');
      setPackages((prev) => prev.map((p) => (p.id === pkg.id ? data : p)));
      showToast(updated.active ? 'Pakket geactiveerd' : 'Pakket gedeactiveerd');
    } catch (err) {
      alert(String(err));
    }
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Pakketbeheer</h1>
          <p className="text-sm text-slate-500 mt-1">
            {packages.filter((p) => p.active).length} actief · {packages.length} totaal
          </p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={16} />
          Nieuw pakket
        </button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-6 text-xs text-slate-500">
        <span className="flex items-center gap-1.5"><Eye size={12} /> = Activeren/deactiveren</span>
        <span className="flex items-center gap-1.5"><Pencil size={12} /> = Bewerken</span>
        <span className="flex items-center gap-1.5"><Trash2 size={12} /> = Verwijderen</span>
        <span className="flex items-center gap-1.5"><GripVertical size={12} /> Gebruik volgorde (sort_order) om te sorteren</span>
      </div>

      {/* Package list */}
      <div className="space-y-3">
        <AnimatePresence>
          {packages.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 bg-white rounded-2xl border border-slate-200"
            >
              <p className="text-slate-400 text-sm">Geen pakketten. Maak er een aan.</p>
            </motion.div>
          )}
          {packages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              onEdit={() => setEditing(pkg)}
              onDelete={() => setDeleting(pkg)}
              onToggleActive={() => handleToggleActive(pkg)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {(editing || creating) && (
          <PackageModal
            initial={editing ? packageToForm(editing) : EMPTY_FORM}
            onSave={handleSave}
            onClose={() => {
              setEditing(null);
              setCreating(false);
            }}
            saving={saving}
          />
        )}
        {deleting && (
          <DeleteConfirm
            name={deleting.name}
            onConfirm={handleDelete}
            onCancel={() => setDeleting(null)}
            deleting={deletingId}
          />
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 bg-slate-900 text-white text-sm font-semibold rounded-xl shadow-lg"
          >
            <Check size={16} className="text-green-400" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
