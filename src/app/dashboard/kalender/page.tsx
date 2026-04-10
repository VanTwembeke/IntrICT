import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Appointment, AppointmentType, WorkingHour } from '@/lib/types';
import KalenderClient from './KalenderClient';

export default async function KalenderPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  if (!profile) redirect('/login');

  const isAdmin = profile.role === 'admin';

  // Load working hours
  let workingHours: WorkingHour[] = [];
  try {
    const { data } = await supabase.from('working_hours').select('*').order('day_of_week');
    workingHours = (data ?? []) as WorkingHour[];
  } catch { /* table not yet created */ }

  // Load appointment types
  let appointmentTypes: AppointmentType[] = [];
  try {
    const { data } = await supabase
      .from('appointment_types')
      .select('*')
      .eq('active', true)
      .order('sort_order');
    appointmentTypes = (data ?? []) as AppointmentType[];
  } catch { /* table not yet created */ }

  // Load appointments for current week
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7)); // Monday
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  let appointments: Appointment[] = [];
  try {
    let query = supabase
      .from('appointments')
      .select('*, profile:profiles(full_name, email)')
      .gte('starts_at', weekStart.toISOString())
      .lte('starts_at', weekEnd.toISOString())
      .order('starts_at');
    if (!isAdmin) query = query.eq('user_id', user.id);
    const { data } = await query;
    appointments = (data ?? []) as Appointment[];
  } catch { /* table not yet created */ }

  // Load all users (admin only, for booking on behalf of)
  let users: { id: string; full_name: string | null; email: string }[] = [];
  if (isAdmin) {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .order('full_name');
      users = (data ?? []) as typeof users;
    } catch { /* */ }
  }

  // Load calendar token for iCal sync
  const calendarToken = profile.calendar_token as string | null;

  return (
    <div className="p-6 lg:p-8">
      <KalenderClient
        isAdmin={isAdmin}
        initialAppointments={appointments}
        appointmentTypes={appointmentTypes}
        workingHours={workingHours}
        users={users}
        calendarToken={calendarToken}
        currentUserId={user.id}
      />
    </div>
  );
}
