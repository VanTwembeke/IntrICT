'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';

export default function UsersLoadError() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6" aria-labelledby="users-load-title">
      <h1 id="users-load-title" className="text-2xl font-bold text-slate-900">Gebruikersbeheer</h1>
      <p role="alert" className="mt-3 text-slate-700">
        Gebruikers konden niet worden geladen. Probeer het opnieuw; er zijn geen gegevens gewijzigd.
      </p>
      <button type="button" disabled={pending} aria-busy={pending}
        onClick={() => startTransition(() => router.refresh())}
        className="mt-4 rounded-xl bg-blue-700 px-4 py-3 font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:opacity-60">
        {pending ? 'Opnieuw laden…' : 'Opnieuw proberen'}
      </button>
    </section>
  );
}
