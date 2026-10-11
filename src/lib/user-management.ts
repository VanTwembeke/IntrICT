type Result<T> = { data: T | null; error: unknown };
type ProfileIdentity = { id?: string; role: string };
type AuthIdentity = { id: string; app_metadata?: Record<string, unknown>; banned_until?: string | null };

// Intentionally read-only: no mutation is safe without the deployed schema review.
export interface UserDeletionStore {
  getCaller(): Promise<Result<{ id: string }>>;
  getCallerProfile(id: string): Promise<Result<ProfileIdentity>>;
  getTargetProfile(id: string): Promise<Result<ProfileIdentity>>;
  getTargetAuth(id: string): Promise<Result<AuthIdentity>>;
}

function reply(status: number, error: string, code: string) {
  return Response.json({ error, code }, { status, headers: { 'Cache-Control': 'no-store' } });
}

async function validateUserMutation(request: Request, id: string): Promise<Response | null> {
  const origin = request.headers.get('origin');
  const fetchSite = request.headers.get('sec-fetch-site');
  if (origin !== new URL(request.url).origin || (fetchSite && fetchSite !== 'same-origin')) {
    return reply(403, 'Alleen aanvragen vanaf dezelfde website zijn toegestaan.', 'INVALID_ORIGIN');
  }
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    return reply(400, 'Ongeldig gebruikers-ID.', 'INVALID_ID');
  }
  if (request.headers.get('content-type')?.split(';')[0].trim() !== 'application/json') {
    return reply(415, 'JSON vereist.', 'INVALID_CONTENT_TYPE');
  }
  // Enforce the size limit even when Content-Length is missing or inaccurate.
  let body: unknown;
  const reader = request.body?.getReader();
  if (!reader) return reply(400, 'Bevestiging vereist.', 'INVALID_CONFIRMATION');
  try {
    let text = '';
    let size = 0;
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 8192) {
        await reader.cancel();
        return reply(413, 'Aanvraag te groot.', 'BODY_TOO_LARGE');
      }
      text += decoder.decode(value, { stream: true });
    }
    body = JSON.parse(text + decoder.decode());
  } catch {
    return reply(400, 'Ongeldige JSON.', 'INVALID_JSON');
  } finally {
    reader.releaseLock();
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)
    || Object.keys(body).length !== 1
    || !('confirmationId' in body) || body.confirmationId !== id) {
    return reply(400, 'Typ het volledige gebruikers-ID exact ter bevestiging.', 'INVALID_CONFIRMATION');
  }
  return null;
}

export async function handleUserDeletion(
  request: Request, id: string, store: UserDeletionStore,
): Promise<Response> {
  const invalid = await validateUserMutation(request, id);
  if (invalid) return invalid;
  try {
    const caller = await store.getCaller();
    if (caller.error || !caller.data) return reply(401, 'Niet ingelogd.', 'UNAUTHENTICATED');
    const me = await store.getCallerProfile(caller.data.id);
    if (me.error) return reply(503, 'Bevoegdheden konden niet worden gecontroleerd.', 'DATASTORE_ERROR');
    if (me.data?.role !== 'admin') return reply(403, 'Geen toegang.', 'FORBIDDEN');
    if (caller.data.id.toLowerCase() === id.toLowerCase()) return reply(403, 'Je kunt je eigen account niet verwijderen.', 'SELF_PROTECTED');
    const target = await store.getTargetProfile(id);
    if (target.error) return reply(503, 'Gebruiker kon niet worden gecontroleerd.', 'DATASTORE_ERROR');
    if (!target.data) return reply(404, 'Gebruiker niet gevonden.', 'TARGET_NOT_FOUND');
    if (target.data.role !== 'user') return reply(403, 'Administrators en onbekende rollen zijn beschermd.', 'ADMIN_PROTECTED');
    const auth = await store.getTargetAuth(id);
    if (auth.error) return reply(503, 'Account kon niet worden gecontroleerd.', 'DATASTORE_ERROR');
    if (!auth.data) return reply(404, 'Authenticatie-account niet gevonden.', 'TARGET_NOT_FOUND');
    if (auth.data.app_metadata?.role === 'admin') return reply(403, 'Administrators zijn beschermd.', 'ADMIN_PROTECTED');
  } catch {
    return reply(503, 'Controle mislukt. Er is niets gewijzigd.', 'DATASTORE_ERROR');
  }
  return reply(409,
    'Verwijdering geblokkeerd: de database-relaties en triggers zijn nog niet gecontroleerd. Er is niets gewijzigd. Dossiers, facturen en contracten blijven behouden.',
    'RETENTION_REVIEW_REQUIRED');
}

export interface UserAccessStore extends UserDeletionStore {
  banTarget(id: string, attributes: { ban_duration: string }): Promise<Result<{ id: string }>>;
}

// Supabase Auth ban, not deletion. Finite 100-year duration, returned expiry is authoritative.
const ACCESS_BAN_DURATION = '876000h';

function accessStatus(auth: AuthIdentity) {
  const expiry = auth.banned_until;
  const disabled = typeof expiry === 'string' && Number.isFinite(Date.parse(expiry)) && Date.parse(expiry) > Date.now();
  return { id: auth.id, status: disabled ? 'disabled_not_deleted' : 'not_disabled', banned_until: disabled ? expiry : null };
}

async function authorizeAccessTarget(id: string, store: UserDeletionStore): Promise<AuthIdentity | Response> {
  const caller = await store.getCaller();
  if (caller.error || !caller.data) return reply(401, 'Niet ingelogd.', 'UNAUTHENTICATED');
  const me = await store.getCallerProfile(caller.data.id);
  if (me.error) return reply(503, 'Bevoegdheden konden niet worden gecontroleerd.', 'DATASTORE_ERROR');
  if (me.data?.role !== 'admin') return reply(403, 'Geen toegang.', 'FORBIDDEN');
  if (caller.data.id.toLowerCase() === id.toLowerCase()) return reply(403, 'Je eigen account is beschermd.', 'SELF_PROTECTED');
  const target = await store.getTargetProfile(id);
  if (target.error) return reply(503, 'Gebruiker kon niet worden gecontroleerd.', 'DATASTORE_ERROR');
  if (!target.data) return reply(404, 'Gebruiker niet gevonden.', 'TARGET_NOT_FOUND');
  if (target.data.id?.toLowerCase() !== id.toLowerCase()) return reply(503, 'Doelaccount kon niet worden bevestigd.', 'TARGET_MISMATCH');
  if (target.data.role !== 'user') return reply(403, 'Administrators en onbekende rollen zijn beschermd.', 'ADMIN_PROTECTED');
  const auth = await store.getTargetAuth(id);
  if (auth.error) return reply(503, 'Account kon niet worden gecontroleerd.', 'DATASTORE_ERROR');
  if (!auth.data) return reply(404, 'Authenticatie-account niet gevonden.', 'TARGET_NOT_FOUND');
  if (auth.data.id.toLowerCase() !== id.toLowerCase()) return reply(503, 'Doelaccount kon niet worden bevestigd.', 'TARGET_MISMATCH');
  if (auth.data.app_metadata?.role && auth.data.app_metadata.role !== 'user') return reply(403, 'Bevoorrechte en onbekende rollen zijn beschermd.', 'ADMIN_PROTECTED');
  return auth.data;
}

export async function handleUserAccessStatus(request: Request, id: string, store: UserDeletionStore): Promise<Response> {
  if (request.method !== 'GET') return reply(405, 'GET vereist.', 'INVALID_METHOD');
  const origin = request.headers.get('origin');
  const site = request.headers.get('sec-fetch-site');
  if ((origin && origin !== new URL(request.url).origin) || (site && site !== 'same-origin') || (!origin && site !== 'same-origin')) {
    return reply(403, 'Alleen aanvragen vanaf dezelfde website zijn toegestaan.', 'INVALID_ORIGIN');
  }
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) return reply(400, 'Ongeldig gebruikers-ID.', 'INVALID_ID');
  try {
    const auth = await authorizeAccessTarget(id, store);
    if (auth instanceof Response) return auth;
    return Response.json(accessStatus(auth), { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return reply(503, 'Status kon niet worden gecontroleerd.', 'DATASTORE_ERROR');
  }
}

export async function handleUserAccessRevocation(request: Request, id: string, store: UserAccessStore): Promise<Response> {
  if (request.method !== 'POST') return reply(405, 'POST vereist.', 'INVALID_METHOD');
  const invalid = await validateUserMutation(request, id);
  if (invalid) return invalid;
  let attempted = false;
  try {
    const auth = await authorizeAccessTarget(id, store);
    if (auth instanceof Response) return auth;
    attempted = true;
    // Do not send app_metadata: Supabase leaves existing metadata untouched.
    const updated = await store.banTarget(id, { ban_duration: ACCESS_BAN_DURATION });
    if (updated.error || !updated.data || updated.data.id.toLowerCase() !== id.toLowerCase()) {
      return reply(503, 'Intrekking niet bevestigd. Controleer de toegangsstatus; er is niets verwijderd.', 'REVOCATION_UNVERIFIED');
    }
    const readback = await store.getTargetAuth(id);
    if (readback.error || !readback.data || readback.data.id.toLowerCase() !== id.toLowerCase()
      || accessStatus(readback.data).status !== 'disabled_not_deleted') {
      return reply(503, 'Intrekking niet bevestigd. Controleer de toegangsstatus; er is niets verwijderd.', 'REVOCATION_UNVERIFIED');
    }
    return Response.json(accessStatus(readback.data), { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return reply(503, attempted
      ? 'Intrekking niet bevestigd. Controleer de toegangsstatus; er is niets verwijderd.'
      : 'Controle mislukt. Er is niets gewijzigd.', attempted ? 'REVOCATION_UNVERIFIED' : 'DATASTORE_ERROR');
  }
}
