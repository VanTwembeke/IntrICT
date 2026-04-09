import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { ArrowLeft } from 'lucide-react';
import type { Package } from '@/lib/types';
import PackageManager from '../PackageManager';

export default async function PakketBeheerPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') redirect('/dashboard/pakketten');

  // Fetch all packages (including inactive) for admin
  let packages: Package[] = [];
  try {
    const { data, error } = await supabase
      .from('packages')
      .select('*')
      .order('sort_order', { ascending: true });
    if (!error && data) packages = data as Package[];
  } catch {
    // table not yet created
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          href="/dashboard/pakketten"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-4"
        >
          <ArrowLeft size={16} />
          Terug naar pakketten
        </Link>
      </div>

      {packages.length === 0 && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
          <strong>Let op:</strong> De packages tabel bestaat nog niet in Supabase. Voer eerst{' '}
          <code className="bg-amber-100 px-1 rounded">sql/create_packages_table.sql</code> uit
          in de Supabase SQL editor. Pakketten die je hier aanmaakt worden dan opgeslagen.
        </div>
      )}

      <PackageManager initialPackages={packages} />
    </div>
  );
}
