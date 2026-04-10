import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { PackageRequest } from '@/lib/types';
import AanvragenClient from './AanvragenClient';

export default async function AanvragenPage() {
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

  if (profile?.role !== 'admin') redirect('/dashboard');

  let requests: PackageRequest[] = [];
  try {
    const { data, error } = await supabase
      .from('package_requests')
      .select('*, profile:profiles(full_name, email, company, phone)')
      .order('created_at', { ascending: false });
    if (!error && data) requests = data as PackageRequest[];
  } catch {
    // table not yet created
  }

  return (
    <div className="p-6 lg:p-8">
      <AanvragenClient initialRequests={requests} />
    </div>
  );
}
