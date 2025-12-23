import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  // Minimal stub: generate a simple QR payload or return URL
  // TODO: plug into lib/qr/generator.ts
  return NextResponse.json({ ok: true, qr: 'sample-payload' })
}
