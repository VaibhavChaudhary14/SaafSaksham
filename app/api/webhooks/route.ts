import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  // Minimal stub for webhooks: parse body and log
  // TODO: validate signatures and route to appropriate handlers
  const body = await req.text()
  console.log('webhook received:', body)
  return NextResponse.json({ ok: true })
}
