'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Download,
  FileImage,
  Info,
  CheckCircle,
  XCircle,
  Palette,
  Type,
  Layers,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface LogoAsset {
  label: string;
  description: string;
  file: string; // filename without extension, relative to /brand/
  bg: string;   // Tailwind bg class for preview card
  dark?: boolean; // true = light logo on dark bg
}

type Format = 'svg' | 'png';

// ─── Asset definitions ────────────────────────────────────────────────────────

const ICON_ASSETS: LogoAsset[] = [
  { label: 'Icon — Donker',          description: 'Donkere achtergrond variant',        file: 'icon_dark_v2',          bg: 'bg-slate-900',   dark: true },
  { label: 'Icon — Licht',           description: 'Witte/lichte achtergrond variant',   file: 'icon_light_v2',         bg: 'bg-white',       dark: false },
  { label: 'Icon — Outline donker',  description: 'Lijnversie op donkere achtergrond',  file: 'icon_outline_dark_v2',  bg: 'bg-slate-900',   dark: true },
  { label: 'Icon — Outline wit',     description: 'Lijnversie op witte achtergrond',    file: 'icon_outline_white_v2', bg: 'bg-white',       dark: false },
];

const BADGE_ASSETS: LogoAsset[] = [
  { label: 'Badge — Donker',         description: 'Volledige badge op donker',          file: 'badge_dark_v2',         bg: 'bg-slate-900',   dark: true },
  { label: 'Badge — Licht',          description: 'Volledige badge op licht',           file: 'badge_light_v2',        bg: 'bg-white',       dark: false },
  { label: 'Badge — Outline',        description: 'Lijnversie badge op licht',          file: 'badge_outline_v2',      bg: 'bg-white',       dark: false },
  { label: 'Badge — Outline wit',    description: 'Lijnversie badge op donker',         file: 'badge_outline_white_v2',bg: 'bg-slate-900',   dark: true },
];

const STICKER_ASSETS: LogoAsset[] = [
  { label: 'Sticker — Donker',       description: 'Sticker op donkere achtergrond',     file: 'sticker_dark',          bg: 'bg-slate-900',   dark: true },
  { label: 'Sticker — Wit',          description: 'Sticker op witte achtergrond',       file: 'sticker_white',         bg: 'bg-white',       dark: false },
];

const OTHER_ASSETS: LogoAsset[] = [
  { label: 'Window',                 description: 'Window asset (browser mockup)',       file: 'window_v2',             bg: 'bg-slate-100',   dark: false },
  { label: 'Diagram — Badge',        description: 'Badge constructie diagram',           file: 'diagram_badge',         bg: 'bg-white',       dark: false },
  { label: 'Diagram — Sticker',      description: 'Sticker constructie diagram',        file: 'diagram_sticker',       bg: 'bg-white',       dark: false },
];

// ─── Brand colours ────────────────────────────────────────────────────────────

const BRAND_COLORS = [
  { name: 'IntrICT Blauw',    hex: '#2563EB', tailwind: 'blue-600',    usage: 'Primaire accentkleur, CTA-knoppen' },
  { name: 'IntrICT Indigo',   hex: '#4F46E5', tailwind: 'indigo-600',  usage: 'Gradiënten, hover states' },
  { name: 'Diep Slate',       hex: '#0F172A', tailwind: 'slate-900',   usage: 'Donkere achtergronden, tekst' },
  { name: 'Middel Slate',     hex: '#1E293B', tailwind: 'slate-800',   usage: 'Secties, cards' },
  { name: 'Licht Slate',      hex: '#F8FAFC', tailwind: 'slate-50',    usage: 'Lichte achtergronden' },
  { name: 'Wit',              hex: '#FFFFFF', tailwind: 'white',       usage: 'Primaire achtergrond, logo op donker' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function AssetCard({ asset }: { asset: LogoAsset }) {
  const [copied, setCopied] = useState(false);
  const [format, setFormat] = useState<Format>('svg');

  function download(fmt: Format) {
    const url = `/brand/${asset.file}.${fmt}`;
    const a = document.createElement('a');
    a.href = url;
    a.download = `intrict_${asset.file}.${fmt}`;
    a.click();
  }

  function copyUrl() {
    navigator.clipboard.writeText(`/brand/${asset.file}.${format}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm flex flex-col">
      {/* Preview */}
      <div className={`${asset.bg} flex items-center justify-center p-8 min-h-[140px] border-b border-slate-200`}>
        <Image
          src={`/brand/${asset.file}.${format}`}
          alt={asset.label}
          width={160}
          height={80}
          className="object-contain max-h-20 w-auto"
          unoptimized
        />
      </div>

      {/* Info + actions */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <p className="font-semibold text-slate-800 text-sm">{asset.label}</p>
          <p className="text-xs text-slate-500 mt-0.5">{asset.description}</p>
        </div>

        {/* Format toggle */}
        <div className="flex rounded-lg overflow-hidden border border-slate-200 text-xs font-medium w-fit">
          {(['svg', 'png'] as Format[]).map((f) => (
            <button
              key={f}
              onClick={() => setFormat(f)}
              className={`px-3 py-1.5 transition-colors cursor-pointer ${
                format === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-auto">
          <button
            onClick={() => download(format)}
            className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-2 px-3 rounded-lg transition-colors cursor-pointer"
          >
            <Download size={13} />
            Download {format.toUpperCase()}
          </button>
          <button
            onClick={copyUrl}
            title="Kopieer URL"
            className="flex items-center justify-center gap-1 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium py-2 px-3 rounded-lg transition-colors cursor-pointer"
          >
            {copied ? <CheckCircle size={13} className="text-green-500" /> : <FileImage size={13} />}
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-blue-600">{icon}</span>
        <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
      </div>
      {children}
    </section>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function BrandingClient() {
  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Brandgids & Logo&apos;s</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Download logo&apos;s in SVG of PNG formaat. Lees de richtlijnen voor correct gebruik van het IntrICT merk.
        </p>
      </div>

      {/* ─── Icons ─── */}
      <Section title="Iconen" icon={<Layers size={18} />}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {ICON_ASSETS.map((a) => <AssetCard key={a.file} asset={a} />)}
        </div>
      </Section>

      {/* ─── Badges ─── */}
      <Section title="Badges (logo + naam)" icon={<FileImage size={18} />}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {BADGE_ASSETS.map((a) => <AssetCard key={a.file} asset={a} />)}
        </div>
      </Section>

      {/* ─── Stickers ─── */}
      <Section title="Stickers" icon={<FileImage size={18} />}>
        <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
          {STICKER_ASSETS.map((a) => <AssetCard key={a.file} asset={a} />)}
        </div>
      </Section>

      {/* ─── Other ─── */}
      <Section title="Overige assets" icon={<FileImage size={18} />}>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {OTHER_ASSETS.map((a) => <AssetCard key={a.file} asset={a} />)}
        </div>
      </Section>

      {/* ─── Brand colours ─── */}
      <Section title="Kleurpalet" icon={<Palette size={18} />}>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {BRAND_COLORS.map((c) => (
            <div key={c.hex} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-white shadow-sm">
              <div
                className="w-10 h-10 rounded-lg shrink-0 border border-slate-200"
                style={{ backgroundColor: c.hex }}
              />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{c.name}</p>
                <p className="text-xs text-slate-500 font-mono">{c.hex}</p>
                <p className="text-xs text-slate-400 truncate mt-0.5">{c.usage}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ─── Typography ─── */}
      <Section title="Typografie" icon={<Type size={18} />}>
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-6 space-y-4">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Primair lettertype</p>
            <p className="text-3xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-geist-sans, sans-serif)' }}>Geist Sans</p>
            <p className="text-sm text-slate-500 mt-1">Gebruikt voor alle koppen, knoppen en UI-elementen.</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Monospace</p>
            <p className="text-2xl font-semibold text-slate-700" style={{ fontFamily: 'var(--font-geist-mono, monospace)' }}>Geist Mono</p>
            <p className="text-sm text-slate-500 mt-1">Gebruikt voor code, referentienummers en technische data.</p>
          </div>
        </div>
      </Section>

      {/* ─── Usage guidelines ─── */}
      <Section title="Gebruik van het logo" icon={<Info size={18} />}>
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm divide-y divide-slate-100">
          {/* Dos */}
          <div className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle size={16} className="text-green-500" />
              <h3 className="font-semibold text-slate-800 text-sm">Correct gebruik</h3>
            </div>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex gap-2"><CheckCircle size={14} className="text-green-400 mt-0.5 shrink-0" /> Gebruik de <strong>donkere</strong> variant op donkere of gekleurde achtergronden.</li>
              <li className="flex gap-2"><CheckCircle size={14} className="text-green-400 mt-0.5 shrink-0" /> Gebruik de <strong>lichte</strong> variant op witte of lichte achtergronden.</li>
              <li className="flex gap-2"><CheckCircle size={14} className="text-green-400 mt-0.5 shrink-0" /> Gebruik altijd <strong>SVG</strong> voor digitaal gebruik (scherm, web, presentaties) — het schaalt verliesvrij.</li>
              <li className="flex gap-2"><CheckCircle size={14} className="text-green-400 mt-0.5 shrink-0" /> Gebruik <strong>PNG</strong> voor drukwerk of platforms die geen SVG ondersteunen.</li>
              <li className="flex gap-2"><CheckCircle size={14} className="text-green-400 mt-0.5 shrink-0" /> Zorg voor voldoende vrije ruimte rondom het logo (min. gelijk aan de hoogte van de letter &quot;i&quot; in het logo).</li>
              <li className="flex gap-2"><CheckCircle size={14} className="text-green-400 mt-0.5 shrink-0" /> De <strong>badge</strong> (icoon + naam) gebruik je voor externe communicatie; het <strong>icoon</strong> alleen voor favicons en app-iconen.</li>
            </ul>
          </div>

          {/* Don'ts */}
          <div className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <XCircle size={16} className="text-red-500" />
              <h3 className="font-semibold text-slate-800 text-sm">Verboden gebruik</h3>
            </div>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex gap-2"><XCircle size={14} className="text-red-400 mt-0.5 shrink-0" /> Het logo niet vervormen, uitrekken of de verhoudingen wijzigen.</li>
              <li className="flex gap-2"><XCircle size={14} className="text-red-400 mt-0.5 shrink-0" /> Geen andere kleuren toepassen dan de officiële merkkleur.</li>
              <li className="flex gap-2"><XCircle size={14} className="text-red-400 mt-0.5 shrink-0" /> Geen schaduwen, glows of andere effecten toevoegen aan het logo.</li>
              <li className="flex gap-2"><XCircle size={14} className="text-red-400 mt-0.5 shrink-0" /> Het logo niet op een drukke of onduidelijke achtergrond plaatsen.</li>
              <li className="flex gap-2"><XCircle size={14} className="text-red-400 mt-0.5 shrink-0" /> De tekst &quot;IntrICT&quot; niet aanpassen, herschrijven of een ander lettertype gebruiken.</li>
              <li className="flex gap-2"><XCircle size={14} className="text-red-400 mt-0.5 shrink-0" /> De lichte variant niet gebruiken op een witte achtergrond — gebruik dan de outline variant.</li>
            </ul>
          </div>

          {/* Contact */}
          <div className="p-5 bg-slate-50 rounded-b-xl">
            <p className="text-xs text-slate-500">
              Vragen over merkgebruik? Contacteer ons via{' '}
              <a href="mailto:info@intrict.com" className="text-blue-600 hover:underline font-medium">
                info@intrict.com
              </a>
            </p>
          </div>
        </div>
      </Section>
    </div>
  );
}
