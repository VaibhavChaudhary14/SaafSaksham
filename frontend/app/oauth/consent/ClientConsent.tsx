"use client"

import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useSearchParams } from "next/navigation"

export default function ClientConsent() {
  const searchParams = useSearchParams()
  const client_id = searchParams.get("client_id") || "Test App"
  const redirect_uri = searchParams.get("redirect_uri") || undefined
  const redirect_to = searchParams.get("redirect_to") || undefined
  const response_type = searchParams.get("response_type") || undefined
  const scope = searchParams.get("scope") || undefined
  const state = searchParams.get("state") || undefined

  const makeApproveHref = () => {
    const q = new URLSearchParams()
    if (redirect_uri) q.set("redirect_uri", redirect_uri)
    if (state) q.set("state", state)
    return "/oauth/consent/approve?" + q.toString()
  }

  const makeDenyHref = () => {
    const q = new URLSearchParams()
    if (redirect_uri) q.set("redirect_uri", redirect_uri)
    if (state) q.set("state", state)
    return "/oauth/consent/deny?" + q.toString()
  }

  const handleApprove = () => {
    if (!redirect_uri) return
    const code = `devcode-${Date.now()}`
    const url = new URL(redirect_uri)
    url.searchParams.set("code", code)
    if (state) url.searchParams.set("state", state)
    window.location.href = url.toString()
  }

  const handleDeny = () => {
    if (!redirect_uri) return
    const url = new URL(redirect_uri)
    url.searchParams.set("error", "access_denied")
    if (state) url.searchParams.set("state", state)
    window.location.href = url.toString()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-card border rounded-lg p-6 shadow-sm">
        <h1 className="text-xl font-semibold mb-2">Authorize "{client_id}"</h1>
        <p className="text-sm text-muted-foreground mb-4">This page simulates an OAuth provider consent screen for local testing.</p>

        <div className="mb-4">
          <div className="font-medium">Requested scopes</div>
          <div className="text-sm text-muted-foreground">{scope ?? "(none)"}</div>
        </div>

        <div className="flex gap-3">
          <Button className="bg-primary text-white" onClick={handleApprove}>Approve</Button>
          <Button variant="ghost" onClick={handleDeny}>Deny</Button>
          <Link href="/" className="ml-auto text-sm text-muted-foreground">Cancel</Link>
        </div>

        <div className="mt-4 text-sm text-muted-foreground">No-JS testing links:</div>
        <div className="flex gap-3 mt-2">
          <a href={makeApproveHref()} className="inline-block px-4 py-2 bg-primary text-white rounded-md">Approve (no-JS)</a>
          <a href={makeDenyHref()} className="inline-block px-4 py-2 border rounded-md">Deny (no-JS)</a>
        </div>

        <div className="mt-6 text-xs text-muted-foreground">
          <div>redirect_uri: <code className="bg-muted/10 px-1 rounded">{redirect_uri ?? "(missing)"}</code></div>
          <div>redirect_to: <code className="bg-muted/10 px-1 rounded">{redirect_to ?? "(none)"}</code></div>
        </div>
      </div>
    </div>
  )
}
