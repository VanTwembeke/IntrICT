import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Invoice } from '@/lib/types';
import MijnFactuurDetail from './MijnFactuurDetail';

export default async function MijnFactuurDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role === 'admin') redirect(`/dashboard/facturen/${id}`);

  // Only fetch invoices that belong to this user
  const { data: invoice, error } = await supabase
    .from('invoices')
    .select('*, items:invoice_items(*)')
    .eq('id', id)
    .eq('profile_id', user.id)
    .single();

  if (error || !invoice) notFound();

  return (
    <div className="p-6 lg:p-8">
      <MijnFactuurDetail invoice={invoice as Invoice} />
    </div>
  );
}
