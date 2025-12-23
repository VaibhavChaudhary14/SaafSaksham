import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const redirect_uri = url.searchParams.get("redirect_uri")
  const state = url.searchParams.get("state")

  if (!redirect_uri) {
    return NextResponse.json({ error: "missing redirect_uri" }, { status: 400 })
  }

  const code = `devcode-${Date.now()}`
  const dest = new URL(redirect_uri)
  dest.searchParams.set("code", code)
  if (state) dest.searchParams.set("state", state)
  const redirect_to = url.searchParams.get("redirect_to")
  if (redirect_to) dest.searchParams.set("redirect_to", redirect_to)

  return NextResponse.redirect(dest.toString())
}
