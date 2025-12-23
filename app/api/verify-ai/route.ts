import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  // Minimal stub: accept image or reference and call lib/ai/image-verification
  // TODO: implement image verification logic and return detailed verdict
  return NextResponse.json({ ok: true, verdict: 'unknown', message: 'verify-ai placeholder' })
}
