import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  // Minimal stub: accept form-data or JSON containing file info.
  // TODO: wire to `lib/storage/upload.ts` and validate auth
  return NextResponse.json({ ok: true, message: 'Upload endpoint placeholder' })
}
