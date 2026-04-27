import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Invoice } from '@/lib/types';
import MijnFacturenClient from './MijnFacturenClient';

export default async function MijnFacturenPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Admins use the full /dashboard/facturen instead
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role === 'admin') redirect('/dashboard/facturen');

  const { data: invoices } = await supabase
    .from('invoices')
    .select('*, items:invoice_items(*)')
    .eq('profile_id', user.id)
    .not('status', 'in', '("draft","cancelled")')  // hide internal templates
    .order('issue_date', { ascending: false });

  return (
    <div className="p-6 lg:p-8">
      <MijnFacturenClient invoices={(invoices ?? []) as Invoice[]} />
    </div>
  );
}
