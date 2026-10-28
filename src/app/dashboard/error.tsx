'use client';

export default function DashboardError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <div className="p-4 sm:p-6 lg:p-8">
    <div role="alert" className="rounded-2xl border border-slate-200 bg-white p-6">
      <h1 className="text-xl font-bold text-slate-950">Dit overzicht kon niet worden geopend</h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">Probeer het opnieuw. Je kunt ook via het menu rechtstreeks naar je documenten of berichten.</p>
      <button type="button" onClick={reset} className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700">Opnieuw proberen</button>
    </div>
  </div>;
}
