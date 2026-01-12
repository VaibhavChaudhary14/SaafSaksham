/**
 * QR generator stub
 * TODO: implement QR generation using `qrcode` or similar
 */
export function generateQrPayload(data: unknown) {
  return JSON.stringify({ ts: Date.now(), data })
}
