type SendResponse = { ok: boolean; status?: number; json(): Promise<unknown> };
const UNKNOWN_STATUS_NOTICE = 'Verzendstatus onbekend. Ververs het gesprek en controleer of het bericht bestaat voordat je opnieuw verzendt.';
const MESSAGE_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function readMessageSendResult(response: SendResponse) {
  const uncertain = () => ({ created: false, retrySafe: false, notice: UNKNOWN_STATUS_NOTICE });
  let body: unknown;
  try { body = await response.json(); } catch { return uncertain(); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return uncertain();
  const data = body as Record<string, unknown>;
  const validMessageId = typeof data.messageId === 'string' && MESSAGE_ID.test(data.messageId);
  // A mixed-version deployment or API rollback can still return the deployed legacy success.
  const confirmedCreated = data.messageCreated === true ||
    (data.messageCreated === undefined && data.message === 'Message sent successfully');
  if (response.ok && confirmedCreated && validMessageId) {
    const failedCount = typeof data.failedAttachmentCount === 'number' && Number.isSafeInteger(data.failedAttachmentCount) && data.failedAttachmentCount > 0
      ? data.failedAttachmentCount : 0;
    return { created: true, retrySafe: false, notice: data.attachmentOutcomeUnknown === true
      ? 'Bericht verzonden. Status van de bijlagen onbekend; ververs voor je opnieuw bestanden stuurt.'
      : failedCount ? `Bericht verzonden, maar ${failedCount} bijlage(n) niet bevestigd. Controleer het gesprek; stuur alleen ontbrekende bestanden opnieuw, niet de tekst.` : '' };
  }
  // Unknown HTTP success/body/transport is NOT evidence that insertion failed.
  // Retry is offered only for this handler's known pre-insert rejection contract.
  const knownRejection = !response.ok && data.messageCreated === undefined && data.messageId === undefined &&
    typeof data.error === 'string' && data.error.length > 0 &&
    (data.outcomeUnknown === false ||
      (data.outcomeUnknown === undefined && [400, 401, 403, 404, 413, 415].includes(response.status ?? 0)));
  return knownRejection ? { created: false, retrySafe: true, notice: data.error as string } : uncertain();
}
export const UNKNOWN_SEND_NOTICE = 'Verzendstatus onbekend. Ververs het gesprek en controleer voor je opnieuw verzendt; de tekst is niet automatisch teruggezet om duplicaten te voorkomen.';
