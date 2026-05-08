import 'server-only';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface MailAttachment {
  name: string;
  content: Buffer | string;
}

export interface SendMailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
  attachments?: MailAttachment[];
}

const DEFAULT_FROM = 'IntrICT <noreply@intrict.com>';

export async function sendMail(opts: SendMailOptions): Promise<void> {
  const { error } = await resend.emails.send({
    from: opts.from ?? DEFAULT_FROM,
    to: Array.isArray(opts.to) ? opts.to : [opts.to],
    subject: opts.subject,
    html: opts.html,
    replyTo: opts.replyTo,
    attachments: opts.attachments?.map((a) => ({
      filename: a.name,
      content: a.content,
    })),
  });

  if (error) {
    throw new Error(`Resend fout: ${error.message}`);
  }
}
