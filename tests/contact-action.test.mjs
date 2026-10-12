import { beforeEach, expect, test, vi } from 'vitest';
import { sendContactForm } from '../src/app/actions/contact';
import { sendMail } from '@/lib/mailer';
vi.mock('@/lib/mailer', () => ({ sendMail: vi.fn() }));
function payload(overrides = {}) {
  const data = new FormData();
  for (const [key, value] of Object.entries({ naam: 'Test visitor', email: 'visitor@example.test', telefoon: '', onderwerp: 'Website', bericht: 'A test message.', ...overrides })) data.set(key, value);
  return data;
}
beforeEach(() => { vi.clearAllMocks(); sendMail.mockResolvedValue(undefined); });
for (const [field, max] of Object.entries({ naam: 100, email: 254, telefoon: 40, onderwerp: 200, bericht: 5000 })) {
  test(`rejects oversized ${field} before sending mail`, async () => {
    const value = field === 'email' ? `${'a'.repeat(64)}@${'b'.repeat(63)}.${'c'.repeat(63)}.${'d'.repeat(62)}` : 'a'.repeat(max + 1);
    const result = await sendContactForm({ success: false }, payload({ [field]: value, locale: 'en' }));
    expect(result.success).toBe(false);
    expect(result.error).toContain(`no more than ${max} characters`);
    expect(sendMail).not.toHaveBeenCalled();
  });
}
for (const locale of ['nl', 'en']) {
  test(`${locale}: validates trimmed minima with localized errors`, async () => {
    for (const [field, value, expected] of [
      ['naam', ' a ', locale === 'en' ? 'Name must contain at least 2 characters.' : 'Naam moet minimaal 2 tekens bevatten.'],
      ['bericht', '   short   ', locale === 'en' ? 'Message must contain at least 10 characters.' : 'Bericht moet minimaal 10 tekens bevatten.'],
    ]) expect(await sendContactForm({ success: false }, payload({ locale, [field]: value }))).toEqual({ success: false, error: expected });
    expect(sendMail).not.toHaveBeenCalled();
  });
  test(`${locale}: localizes the autoresponder`, async () => {
    expect(await sendContactForm({ success: false }, payload({ locale }))).toEqual({ success: true });
    expect(sendMail.mock.calls[1][0].subject).toBe(locale === 'en' ? 'We have received your message – IntrICT' : 'We hebben je bericht ontvangen – IntrICT');
    expect(sendMail.mock.calls[1][0].html).toContain(locale === 'en' ? 'Thank you for your message, Test visitor!' : 'Bedankt voor je bericht, Test visitor!');
  });
  for (const failingMail of [0, 1]) test(`${locale}: reports failure if mail ${failingMail} rejects`, async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    sendMail.mockImplementationOnce(() => failingMail === 0 ? Promise.reject(new Error('delivery failed')) : Promise.resolve())
      .mockImplementationOnce(() => failingMail === 1 ? Promise.reject(new Error('delivery failed')) : Promise.resolve());
    expect(await sendContactForm({ success: false }, payload({ locale }))).toEqual({ success: false, error: locale === 'en' ? 'Your message could not be sent. Please try again later or email us directly.' : 'Je bericht kon niet worden verstuurd. Probeer het later opnieuw of mail ons direct.' });
    expect(sendMail).toHaveBeenCalledTimes(2);
    log.mockRestore();
  });
}
test('accepts exact maximum lengths and an omitted optional phone', async () => {
  const data = payload({ naam: 'n'.repeat(100), email: `${'a'.repeat(64)}@${'b'.repeat(63)}.${'c'.repeat(63)}.${'d'.repeat(61)}`, onderwerp: 's'.repeat(200), bericht: 'm'.repeat(5000) });
  data.delete('telefoon');
  expect(await sendContactForm({ success: false }, data)).toEqual({ success: true });
});
test('rejects non-string form fields without sending', async () => {
  const data = payload(); data.set('naam', new Blob(['not a name']), 'test.txt');
  expect((await sendContactForm({ success: false }, data)).success).toBe(false);
  expect(sendMail).not.toHaveBeenCalled();
});
test('missing or unrecognized locale falls back to Dutch', async () => {
  for (const locale of ['', 'fr', '<script>']) {
    expect(await sendContactForm({ success: false }, payload({ locale, naam: '' }))).toEqual({ success: false, error: 'Naam moet minimaal 2 tekens bevatten.' });
  }
});
test('bounds apply before trimming so padding cannot bypass the maximum', async () => {
  expect((await sendContactForm({ success: false }, payload({ naam: `${' '.repeat(100)}ok` }))).success).toBe(false);
  expect(sendMail).not.toHaveBeenCalled();
});
test('preserves CRLF and CR line breaks after escaping', async () => {
  await sendContactForm({ success: false }, payload({ bericht: '<b>first</b>\r\nsecond\rthird' }));
  for (const [mail] of sendMail.mock.calls) expect(mail.html).toContain('&lt;b&gt;first&lt;/b&gt;<br/>second<br/>third');
});
test('accepts the maximum optional phone length', async () => {
  expect(await sendContactForm({ success: false }, payload({ telefoon: '1'.repeat(40) }))).toEqual({ success: true });
});
test('escapes every visitor field in mail HTML before converting message newlines', async () => {
  const result = await sendContactForm({ success: false }, payload({ naam: `A & <b>"'`, email: "o'brien@example.test", telefoon: `<img src=x> & "'`, onderwerp: `<script> & "'`, bericht: `<a href="evil"> & '\nnext` }));
  expect(result).toEqual({ success: true });
  expect(sendMail).toHaveBeenCalledTimes(2);
  const [admin, reply] = sendMail.mock.calls.map(([mail]) => mail);
  expect(admin.to).toBe('info@intrict.com');
  expect(admin.replyTo).toBe("o'brien@example.test");
  expect(reply.to).toBe("o'brien@example.test");
  expect(admin.from).toBeUndefined(); // Preserve mailer's real default sender.
  expect(admin.html).toContain('A &amp; &lt;b&gt;&quot;&#39;');
  expect(admin.html).toContain('o&#39;brien@example.test');
  expect(admin.html).toContain('&lt;img src=x&gt; &amp; &quot;&#39;');
  expect(admin.html).toContain('&lt;script&gt; &amp; &quot;&#39;');
  for (const mail of [admin, reply]) {
    expect(mail.html).toContain('&lt;a href=&quot;evil&quot;&gt; &amp; &#39;<br/>next');
    expect(mail.html).not.toContain('<a href="evil">');
  }
  expect(reply.html).toContain('A &amp; &lt;b&gt;&quot;&#39;');
});
