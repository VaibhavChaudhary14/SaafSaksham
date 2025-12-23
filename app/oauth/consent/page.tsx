import React from "react"

// Avoid prerendering the consent page — it relies on client-side search params.
export const dynamic = "force-dynamic"

import ClientConsent from "./ClientConsent"

export default function Page() {
  return (
    <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center p-6">Loading…</div>}>
      <ClientConsent />
    </React.Suspense>
  )
}
