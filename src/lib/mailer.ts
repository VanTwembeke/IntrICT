import 'server-only';

// ─── Microsoft Graph API mailer ───────────────────────────────────────────────
// Uses OAuth2 client credentials — no app password required.
// Required env vars:
//   MICROSOFT_TENANT_ID, MICROSOFT_CLIENT_ID, MICROSOFT_CLIENT_SECRET
//   MICROSOFT_EMAIL_USER  (hoofdpostbus: jonas@intrict.com)
//
// Beschikbare afzenderaliassen op jonas@intrict.com:
//   jonas@intrict.com      — standaard, persoonlijk contact
//   noreply@intrict.com    — bevestigingen, geautomatiseerde berichten
//   info@intrict.com       — algemene notificaties naar klanten
//   legal@intrict.com      — juridische correspondentie, DPA, privacy

interface GraphToken {
  access_token: string;
  expires_at: number; // ms
}

// Module-level token cache — survives across requests on warm instances
let _token: GraphToken | null = null;

async function getAccessToken(): Promise<string> {
  if (_token && Date.now() < _token.expires_at - 60_000) {
    return _token.access_token;
  }

  const tenantId = process.env.MICROSOFT_TENANT_ID;
  const clientId = process.env.MICROSOFT_CLIENT_ID;
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;

  if (!tenantId || !clientId || !clientSecret) {
    throw new Error('Microsoft Graph: MICROSOFT_TENANT_ID, MICROSOFT_CLIENT_ID en MICROSOFT_CLIENT_SECRET zijn verplicht.');
  }

  const res = await fetch(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
        scope: 'https://graph.microsoft.com/.default',
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Graph token ophalen mislukt (${res.status}): ${text}`);
  }

  const data = (await res.json()) as { access_token: string; expires_in: number };
  _token = {
    access_token: data.access_token,
    expires_at: Date.now() + data.expires_in * 1000,
  };
  return _token.access_token;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MailAttachment {
  /** Bestandsnaam die de ontvanger ziet */
  name: string;
  /** Base64-gecodeerde inhoud */
  contentBytes: string;
  /** MIME-type, bijv. 'application/pdf' */
  contentType: string;
}

export interface SendMailOptions {
  /** Ontvanger(s) */
  to: string | string[];
  /** E-mailonderwerp */
  subject: string;
  /** HTML-inhoud */
  html: string;
  /**
   * Afzenderadres.
   * Standaard: process.env.MICROSOFT_EMAIL_USER (jonas@intrict.com).
   * Gebruik 'noreply@intrict.com' voor bevestigingen.
   */
  from?: string;
  /** Reply-To adres */
  replyTo?: string;
  /** Optionele bijlagen (base64) */
  attachments?: MailAttachment[];
}

// ─── sendMail ─────────────────────────────────────────────────────────────────

const SENDER_USER = process.env.MICROSOFT_EMAIL_USER ?? 'jonas@intrict.com';

export async function sendMail(opts: SendMailOptions): Promise<void> {
  const token = await getAccessToken();

  const from = opts.from ?? SENDER_USER;
  const toRecipients = (Array.isArray(opts.to) ? opts.to : [opts.to]).map(
    (address) => ({ emailAddress: { address } })
  );

  const message: Record<string, unknown> = {
    subject: opts.subject,
    body: { contentType: 'HTML', content: opts.html },
    toRecipients,
    from: { emailAddress: { address: from } },
  };

  if (opts.replyTo) {
    message.replyTo = [{ emailAddress: { address: opts.replyTo } }];
  }

  if (opts.attachments?.length) {
    message.attachments = opts.attachments.map((a) => ({
      '@odata.type': '#microsoft.graph.fileAttachment',
      name: a.name,
      contentBytes: a.contentBytes,
      contentType: a.contentType,
    }));
  }

  const res = await fetch(
    `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(SENDER_USER)}/sendMail`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, saveToSentItems: false }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Graph sendMail mislukt (${res.status}): ${text}`);
  }
}
