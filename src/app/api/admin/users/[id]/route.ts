import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { handleUserDeletion } from '@/lib/user-management';

export const runtime = 'nodejs';

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  // Lazy clients: invalid/cross-origin requests never reach the datastore;
  // service-role access is only created after a verified administrator check.
  const session = () => createClient();
  return handleUserDeletion(request, id, {
    async getCaller() {
      const { data, error } = await (await session()).auth.getUser();
      return { data: data.user, error };
    },
    async getCallerProfile(callerId) {
      return (await session()).from('profiles').select('role').eq('id', callerId).maybeSingle();
    },
    async getTargetProfile(targetId) {
      return createAdminClient().from('profiles').select('id, role').eq('id', targetId).maybeSingle();
    },
    async getTargetAuth(targetId) {
      const { data, error } = await createAdminClient().auth.admin.getUserById(targetId);
      // Only a specific not-found error means absence; outages are not "missing".
      if (error?.code === 'user_not_found') return { data: null, error: null };
      return { data: data.user, error };
    },
  });
}
