import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { handleUserAccessRevocation, handleUserAccessStatus, type UserAccessStore } from '@/lib/user-management';

export const runtime = 'nodejs';

function accessStore(): UserAccessStore {
  // Service-role clients are lazy: the handler authorizes before target access.
  return {
    async getCaller() {
      const { data, error } = await (await createClient()).auth.getUser();
      return { data: data.user, error };
    },
    async getCallerProfile(id) {
      return (await createClient()).from('profiles').select('role').eq('id', id).maybeSingle();
    },
    async getTargetProfile(id) {
      return createAdminClient().from('profiles').select('id, role').eq('id', id).maybeSingle();
    },
    async getTargetAuth(id) {
      const { data, error } = await createAdminClient().auth.admin.getUserById(id);
      if (error?.code === 'user_not_found') return { data: null, error: null };
      return { data: data.user, error };
    },
    async banTarget(id, attributes) {
      const { data, error } = await createAdminClient().auth.admin.updateUserById(id, attributes);
      return { data: data.user, error };
    },
  };
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return handleUserAccessRevocation(request, id, accessStore());
}

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return handleUserAccessStatus(request, id, accessStore());
}
